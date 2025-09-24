from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Transaction
from werkzeug.exceptions import Unauthorized, UnprocessableEntity
import bcrypt
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)

# Load config from environment variables for Render deployment
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///app.db')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///moneygram.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

migrate = Migrate(app, db)
db.init_app(app)

# ✅ Allow Authorization header in CORS
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])

# ---------------- JWT HELPERS ----------------
def generate_token(user_id):
    payload = {
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow(),
        "sub": user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(payload["sub"])
            if not current_user:
                return jsonify({"error": "User not found"}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ---------------- ROUTES ----------------
@app.route("/users", methods=["POST"])
def signup():
    data = request.json
    try:
        if not data.get("password"):
            raise UnprocessableEntity(description="Password is required.")

        hashed_password = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
        new_user = User(
            username=data["username"],
            phone_number=data["phone_number"],
            password=hashed_password.decode("utf-8"),
            balance=1000  # ✅ Give default balance (optional for testing)
        )
        db.session.add(new_user)
        db.session.commit()

        token = generate_token(new_user.id)

        return jsonify({
            "user": new_user.to_dict(),
            "token": token
        }), 201
    except UnprocessableEntity as e:
        db.session.rollback()
        return jsonify(error=str(e.description)), 422
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"An unexpected error occurred: {str(e)}"), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(phone_number=data.get("phone_number")).first()

    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user.password.encode("utf-8")):
        token = generate_token(user.id)
        return jsonify({
            "user": user.to_dict(),
            "token": token
        }), 200
    return jsonify(error="Invalid phone number or password."), 401

@app.route("/check_session", methods=["GET"])
@token_required
def check_session(current_user):
    return jsonify(current_user.to_dict()), 200

@app.route("/logout", methods=["POST"])
def logout():
    # Stateless, client just discards token
    return jsonify(message="Logged out successfully"), 200

@app.route("/send_money", methods=["POST"])
@token_required
def send_money(current_user):
    data = request.json
    recipient = User.query.filter_by(phone_number=data["recipient_phone"]).first()
    amount = float(data["amount"])
    notes = data.get("notes")

    if not recipient:
        return jsonify(error="Recipient not found."), 404
    if amount <= 0:
        return jsonify(error="Amount must be positive."), 422
    if current_user.balance < amount:
        return jsonify(error="Insufficient balance."), 403

    try:
        current_user.balance -= amount
        recipient.balance += amount
        transaction = Transaction(
            sender_id=current_user.id,
            recipient_id=recipient.id,
            amount=amount,
            notes=notes
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify(current_user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Transaction failed: {str(e)}"), 500

@app.route("/transactions", methods=["GET"])
@token_required
def get_transactions(current_user):
    sent_transactions = Transaction.query.filter_by(sender_id=current_user.id).all()
    received_transactions = Transaction.query.filter_by(recipient_id=current_user.id).all()

    return jsonify({
        "sent": [t.to_dict() for t in sent_transactions],
        "received": [t.to_dict() for t in received_transactions]
    }), 200

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(port=5555, debug=True)

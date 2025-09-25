from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Transaction
from werkzeug.exceptions import UnprocessableEntity
import bcrypt
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'fixed-secret-key-for-testing'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///moneygram.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

migrate = Migrate(app, db)
db.init_app(app)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# ---------------- ROUTES ----------------

@app.route("/reset", methods=["DELETE"])
def reset_db():
    db.drop_all()
    db.create_all()
    return jsonify({"message": "Database reset successful"}), 200

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
            balance=1000  # Default balance for testing
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "user": new_user.to_dict(),
            "token": str(new_user.id)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"An unexpected error occurred: {str(e)}"), 500

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(phone_number=data.get("phone_number")).first()
    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user.password.encode("utf-8")):
        return jsonify({
            "user": user.to_dict(),
            "token": str(user.id)
        }), 200
    return jsonify(error="Invalid phone number or password."), 401

# ---------------- Session Check ----------------
@app.route("/check_session", methods=["GET"])
def check_session():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    user = User.query.get(token)
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    return jsonify(user.to_dict()), 200

# ---------------- Helper ----------------
def get_current_user():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return None, jsonify({"error": "Missing X-User-ID header"}), 401
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({"error": "User not found"}), 404
    return user, None, None

# ---------------- Protected Routes ----------------
@app.route("/send_money", methods=["POST"])
def send_money():
    current_user, err_resp, err_code = get_current_user()
    if err_resp:
        return err_resp, err_code

    data = request.json
    amount = float(data.get("amount") or 0)
    notes = data.get("notes")
    recipient_phone = data.get("recipient_phone") or "demo"

    # Deduct amount if > 0
    if amount > 0:
        current_user.balance -= amount
        db.session.commit()

    # Create demo transaction
    transaction = Transaction(
        sender_id=current_user.id,
        recipient_id=current_user.id,  # avoid NOT NULL error
        amount=amount,
        notes=notes
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": f"Money sent successfully to {recipient_phone}!",
        "sender_balance": current_user.balance
    }), 200

@app.route("/transactions", methods=["GET"])
def get_transactions():
    current_user, err_resp, err_code = get_current_user()
    if err_resp:
        return err_resp, err_code

    sent_transactions = Transaction.query.filter_by(sender_id=current_user.id).all()
    received_transactions = Transaction.query.filter_by(recipient_id=current_user.id).all()

    return jsonify({
        "sent": [t.to_dict() for t in sent_transactions],
        "received": [t.to_dict() for t in received_transactions]
    }), 200

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(port=5555, debug=True)
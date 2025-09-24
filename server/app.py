from flask import Flask, request, session, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User, Transaction
from werkzeug.exceptions import NotFound, Unauthorized, UnprocessableEntity
import bcrypt
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///moneygram.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

migrate = Migrate(app, db)
db.init_app(app)

CORS(app, supports_credentials=True)

@app.before_request
def check_if_logged_in():
    open_access_list = [
        'signup',
        'login',
        'check_session'
    ]
    if request.endpoint not in open_access_list and request.method != 'OPTIONS':
        if 'user_id' not in session:
            raise Unauthorized("You need to log in to access this feature.")

@app.route('/users', methods=['POST'])
def signup():
    data = request.json
    try:
        if not data.get('password'):
            raise UnprocessableEntity(description="Password is required.")

        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        new_user = User(
            username=data['username'],
            phone_number=data['phone_number'],
            password=hashed_password.decode('utf-8')
        )
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.id
        return jsonify(new_user.to_dict()), 201
    except UnprocessableEntity as e:
        db.session.rollback()
        return jsonify(error=str(e.description)), 422
    except Exception:
        db.session.rollback()
        return jsonify(error="An unexpected error occurred. Please try again."), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(phone_number=data['phone_number']).first()
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        session['user_id'] = user.id
        return jsonify(user.to_dict()), 200
    else:
        return jsonify(error="Invalid phone number or password."), 401

@app.route('/check_session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.filter_by(id=user_id).first()
        return jsonify(user.to_dict()), 200
    else:
        return jsonify(error="No active session"), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(message="Logged out successfully"), 200

@app.route('/send_money', methods=['POST'])
def send_money():
    data = request.json
    sender_id = session['user_id']
    sender = User.query.filter_by(id=sender_id).first()
    recipient = User.query.filter_by(phone_number=data['recipient_phone']).first()
    amount = float(data['amount'])
    notes = data.get('notes')

    if not recipient:
        return jsonify(error="Recipient not found."), 404
    if sender.balance < amount:
        return jsonify(error="Insufficient balance."), 403
    if amount <= 0:
        return jsonify(error="Amount must be positive."), 422

    try:
        sender.balance -= amount
        recipient.balance += amount
        transaction = Transaction(
            sender_id=sender_id,
            recipient_id=recipient.id,
            amount=amount,
            notes=notes
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify(sender.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Transaction failed: {str(e)}"), 500

@app.route('/transactions', methods=['GET'])
def get_transactions():
    user_id = session['user_id']
    sent_transactions = Transaction.query.filter_by(sender_id=user_id).all()
    received_transactions = Transaction.query.filter_by(recipient_id=user_id).all()

    return jsonify({
        'sent': [t.to_dict() for t in sent_transactions],
        'received': [t.to_dict() for t in received_transactions]
    }), 200

if __name__ == '__main__':
    app.run(port=5555, debug=True)

from flask import Flask, request, jsonify
from models_new import db, User, Transaction, Account, UserContact
import bcrypt
import os
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///moneygram_new.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

def generate_account_number():
    return ''.join(random.choices(string.digits, k=10))


@app.route("/users", methods=["POST"])
def signup():
    data = request.json
    
    
    existing_user = User.query.filter_by(phone_number=data.get('phone_number')).first()
    if existing_user:
        return jsonify(error="User already exists"), 400
    
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    new_user = User(
        username=data['username'],
        phone_number=data['phone_number'],
        password=hashed_password.decode('utf-8'),
        balance=15000
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    
    account = Account(
        user_id=new_user.id,
        account_type='mobile_money',
        account_number=generate_account_number(),
        balance=15000
    )
    db.session.add(account)
    db.session.commit()
    
    return jsonify({
        'user': new_user.to_dict(),
        'token': str(new_user.id)
    }), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(phone_number=data.get('phone_number')).first()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({
            'user': user.to_dict(),
            'token': str(user.id)
        }), 200
    
    return jsonify(error="Invalid credentials"), 401

@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    if 'username' in data:
        user.username = data['username']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    
    db.session.commit()
    return jsonify(user.to_dict()), 200

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify(message="User deleted"), 200

# Transaction routes
@app.route("/transactions", methods=["POST"])
def create_transaction():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    data = request.json
    sender = User.query.get(user_id)
    if not sender:
        return jsonify(error="User not found"), 404
    
    amount = float(data.get('amount', 0))
    if amount <= 0:
        return jsonify(error="Amount must be greater than 0"), 400
    
    if amount > sender.balance:
        return jsonify(error="Insufficient balance"), 400
    
    # Find recipient by phone number
    recipient = User.query.filter_by(phone_number=data.get('recipient_phone', sender.phone_number)).first()
    if not recipient:
        recipient = sender  # Self transaction for demo
    
    # Create transaction
    transaction = Transaction(
        sender_id=sender.id,
        recipient_id=recipient.id,
        amount=amount,
        transaction_type=data.get('transaction_type', 'send_money'),
        notes=data.get('notes', '')
    )
    
    # Update balances
    sender.balance -= amount
    if recipient.id != sender.id:
        recipient.balance += amount
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'transaction': transaction.to_dict(),
        'sender_balance': sender.balance
    }), 201

@app.route("/transactions", methods=["GET"])
def get_transactions():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    sent = Transaction.query.filter_by(sender_id=user_id).all()
    received = Transaction.query.filter_by(recipient_id=user_id).filter(Transaction.sender_id != user_id).all()
    
    return jsonify({
        'sent': [t.to_dict() for t in sent],
        'received': [t.to_dict() for t in received]
    }), 200

@app.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    return jsonify(transaction.to_dict()), 200

@app.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    db.session.delete(transaction)
    db.session.commit()
    return jsonify(message="Transaction deleted"), 200

# Account routes
@app.route("/accounts", methods=["POST"])
def create_account():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    data = request.json
    account = Account(
        user_id=user_id,
        account_type=data['account_type'],
        account_number=generate_account_number(),
        balance=data.get('balance', 0)
    )
    
    db.session.add(account)
    db.session.commit()
    
    return jsonify(account.to_dict()), 201

@app.route("/accounts", methods=["GET"])
def get_accounts():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([account.to_dict() for account in accounts]), 200

# Contact routes (many-to-many)
@app.route("/contacts", methods=["POST"])
def add_contact():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    data = request.json
    contact_user = User.query.filter_by(phone_number=data['phone_number']).first()
    if not contact_user:
        return jsonify(error="Contact not found"), 404
    
    # Check if contact already exists
    existing = UserContact.query.filter_by(user_id=user_id, contact_id=contact_user.id).first()
    if existing:
        return jsonify(error="Contact already exists"), 400
    
    contact = UserContact(
        user_id=user_id,
        contact_id=contact_user.id,
        nickname=data['nickname']
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify(contact.to_dict()), 201

@app.route("/contacts", methods=["GET"])
def get_contacts():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    contacts = UserContact.query.filter_by(user_id=user_id).all()
    return jsonify([contact.to_dict() for contact in contacts]), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
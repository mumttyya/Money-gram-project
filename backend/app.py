from flask import Flask, request, jsonify
import json
import os
import random
import string
from datetime import datetime

app = Flask(__name__)

USERS_FILE = 'users.json'
TRANSACTIONS_FILE = 'transactions.json'
ACCOUNTS_FILE = 'accounts.json'
CONTACTS_FILE = 'contacts.json'

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-ID')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'M-Pesa API Server', 'status': 'running'}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

def load_data(filename):
    if os.path.exists(filename):
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
                return data if data else []
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

@app.route("/users", methods=["POST"])
def signup():
    data = request.json
    users = load_data(USERS_FILE)
    
    for user in users:
        if user['phone_number'] == data.get('phone_number'):
            return jsonify(error="User already exists"), 400
    
    new_user = {
        'id': len(users) + 1,
        'username': data['username'],
        'phone_number': data['phone_number'],
        'password': data['password'],  # In real app, hash this
        'balance': 15000
    }
    
    users.append(new_user)
    save_data(USERS_FILE, users)
    
    return jsonify({
        'user': new_user,
        'token': str(new_user['id'])
    }), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    users = load_data(USERS_FILE)
    
    for user in users:
        if (user['phone_number'] == data.get('phone_number') and 
            user['password'] == data.get('password')):
            return jsonify({
                'user': user,
                'token': str(user['id'])
            }), 200
    
    return jsonify(error="Invalid credentials"), 401

@app.route("/transactions", methods=["POST"])
def create_transaction():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    users = load_data(USERS_FILE)
    transactions = load_data(TRANSACTIONS_FILE)
    
    print(f"DEBUG: Looking for user_id: {user_id}")
    print(f"DEBUG: Available users: {[str(u.get('id')) for u in users]}")
    
    # Find user
    user = None
    for u in users:
        if str(u['id']) == str(user_id):
            user = u
            break
    
    if not user:
        return jsonify(error=f"User not found. ID: {user_id}"), 404
    
    data = request.json
    amount = float(data.get('amount', 0))
    
    if amount <= 0:
        return jsonify(error="Amount must be greater than 0"), 400
    
    if amount > user['balance']:
        return jsonify(error="Insufficient balance"), 400
    
    user['balance'] -= amount
    save_data(USERS_FILE, users)
    
    # Add transaction
    transaction = {
        'id': len(transactions) + 1,
        'sender_id': user['id'],
        'recipient_id': user['id'],
        'amount': amount,
        'transaction_type': data.get('transaction_type', 'send_money'),
        'notes': data.get('notes', ''),
        'sender_name': user['username'],
        'recipient_name': user['username'],
        'created_at': datetime.now().isoformat()
    }
    
    transactions.append(transaction)
    save_data(TRANSACTIONS_FILE, transactions)
    
    return jsonify({
        'transaction': transaction,
        'sender_balance': user['balance']
    }), 201

@app.route("/transactions", methods=["GET"])
def get_transactions():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    transactions = load_data(TRANSACTIONS_FILE)
    user_transactions = [t for t in transactions if str(t['sender_id']) == user_id]
    
    return jsonify({
        'sent': user_transactions,
        'received': []
    }), 200

# Account routes
@app.route("/accounts", methods=["POST"])
def create_account():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    data = request.json
    accounts = load_data(ACCOUNTS_FILE)
    
    account = {
        'id': len(accounts) + 1,
        'user_id': int(user_id),
        'account_type': data['account_type'],
        'account_number': ''.join(random.choices(string.digits, k=10)),
        'balance': float(data.get('balance', 0)),
        'is_active': True,
        'created_at': datetime.now().isoformat()
    }
    
    accounts.append(account)
    save_data(ACCOUNTS_FILE, accounts)
    
    return jsonify(account), 201

@app.route("/accounts", methods=["GET"])
def get_accounts():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    accounts = load_data(ACCOUNTS_FILE)
    user_accounts = [a for a in accounts if str(a['user_id']) == user_id]
    
    return jsonify(user_accounts), 200

# Contact routes (many-to-many with nickname)
@app.route("/contacts", methods=["POST"])
def add_contact():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    data = request.json
    users = load_data(USERS_FILE)
    contacts = load_data(CONTACTS_FILE)
    
    # Find contact user
    contact_user = None
    for u in users:
        if u['phone_number'] == data['phone_number']:
            contact_user = u
            break
    
    if not contact_user:
        return jsonify(error="Contact not found"), 404
    
    # Check if contact already exists
    for c in contacts:
        if str(c['user_id']) == user_id and str(c['contact_id']) == str(contact_user['id']):
            return jsonify(error="Contact already exists"), 400
    
    contact = {
        'id': len(contacts) + 1,
        'user_id': int(user_id),
        'contact_id': contact_user['id'],
        'nickname': data['nickname'],
        'contact_name': contact_user['username'],
        'contact_phone': contact_user['phone_number'],
        'created_at': datetime.now().isoformat()
    }
    
    contacts.append(contact)
    save_data(CONTACTS_FILE, contacts)
    
    return jsonify(contact), 201

@app.route("/contacts", methods=["GET"])
def get_contacts():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    contacts = load_data(CONTACTS_FILE)
    user_contacts = [c for c in contacts if str(c['user_id']) == user_id]
    
    return jsonify(user_contacts), 200

# Full CRUD for Users
@app.route("/users", methods=["GET"])
def get_users():
    users = load_data(USERS_FILE)
    return jsonify([{k: v for k, v in user.items() if k != 'password'} for user in users]), 200

@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    users = load_data(USERS_FILE)
    data = request.json
    
    for user in users:
        if user['id'] == user_id:
            if 'username' in data:
                user['username'] = data['username']
            if 'phone_number' in data:
                user['phone_number'] = data['phone_number']
            save_data(USERS_FILE, users)
            return jsonify({k: v for k, v in user.items() if k != 'password'}), 200
    
    return jsonify(error="User not found"), 404

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    users = load_data(USERS_FILE)
    users = [u for u in users if u['id'] != user_id]
    save_data(USERS_FILE, users)
    return jsonify(message="User deleted"), 200

# Full CRUD for Transactions
@app.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    transactions = load_data(TRANSACTIONS_FILE)
    for t in transactions:
        if t['id'] == transaction_id:
            return jsonify(t), 200
    return jsonify(error="Transaction not found"), 404

@app.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    transactions = load_data(TRANSACTIONS_FILE)
    data = request.json
    
    for t in transactions:
        if t['id'] == transaction_id:
            if 'notes' in data:
                t['notes'] = data['notes']
            save_data(TRANSACTIONS_FILE, transactions)
            return jsonify(t), 200
    
    return jsonify(error="Transaction not found"), 404

@app.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    transactions = load_data(TRANSACTIONS_FILE)
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_data(TRANSACTIONS_FILE, transactions)
    return jsonify(message="Transaction deleted"), 200

# Full CRUD for Accounts
@app.route("/accounts/<int:account_id>", methods=["GET"])
def get_account(account_id):
    accounts = load_data(ACCOUNTS_FILE)
    for a in accounts:
        if a['id'] == account_id:
            return jsonify(a), 200
    return jsonify(error="Account not found"), 404

@app.route("/accounts/<int:account_id>", methods=["PUT"])
def update_account(account_id):
    accounts = load_data(ACCOUNTS_FILE)
    data = request.json
    
    for a in accounts:
        if a['id'] == account_id:
            if 'account_type' in data:
                a['account_type'] = data['account_type']
            if 'balance' in data:
                a['balance'] = float(data['balance'])
            if 'is_active' in data:
                a['is_active'] = data['is_active']
            save_data(ACCOUNTS_FILE, accounts)
            return jsonify(a), 200
    
    return jsonify(error="Account not found"), 404

@app.route("/accounts/<int:account_id>", methods=["DELETE"])
def delete_account(account_id):
    accounts = load_data(ACCOUNTS_FILE)
    accounts = [a for a in accounts if a['id'] != account_id]
    save_data(ACCOUNTS_FILE, accounts)
    return jsonify(message="Account deleted"), 200

# Full CRUD for Contacts
@app.route("/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    contacts = load_data(CONTACTS_FILE)
    data = request.json
    
    for c in contacts:
        if c['id'] == contact_id:
            if 'nickname' in data:
                c['nickname'] = data['nickname']
            save_data(CONTACTS_FILE, contacts)
            return jsonify(c), 200
    
    return jsonify(error="Contact not found"), 404

@app.route("/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    contacts = load_data(CONTACTS_FILE)
    contacts = [c for c in contacts if c['id'] != contact_id]
    save_data(CONTACTS_FILE, contacts)
    return jsonify(message="Contact deleted"), 200

@app.route("/add_money", methods=["POST"])
def add_money():
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify(error="Missing X-User-ID header"), 401
    
    users = load_data(USERS_FILE)
    user = next((u for u in users if str(u['id']) == user_id), None)
    
    if not user:
        return jsonify(error="User not found"), 404
    
    data = request.json
    amount = float(data.get("amount", 0))
    
    if amount <= 0:
        return jsonify(error="Amount must be greater than 0"), 400
    
    user['balance'] += amount
    save_data(USERS_FILE, users)
    
    return jsonify({
        'message': f"${amount} added successfully!",
        'new_balance': user['balance']
    }), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
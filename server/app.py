from flask import Flask, request, jsonify, session
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
import os
from models import db, User, Transaction, Contact

app = Flask(__name__)
# Load config from environment variables for Render deployment
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///app.db')app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'a_very_secret_key'

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
bcrypt = Bcrypt(app)

# AUTHENTICATION & USER MANAGEMENT (Auth Branch)
class UserResource(Resource):
    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            if user:
                return jsonify(user.to_dict()), 200
            return {'error': 'User not found'}, 404
        
        users = [user.to_dict() for user in User.query.all()]
        return jsonify(users), 200

    def post(self):
        data = request.get_json()
        try:
            new_user = User(
                username=data['username'],
                phone_number=data['phone_number'],
            )
            new_user.password = data['password']
            db.session.add(new_user)
            db.session.commit()
            return jsonify(new_user.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 422
    
    def patch(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        for key, value in data.items():
            if key == 'password':
                user.password = value
            else:
                setattr(user, key, value)
        
        db.session.commit()
        return jsonify(user.to_dict()), 200

    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        db.session.delete(user)
        db.session.commit()
        return '', 204

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(phone_number=data.get('phone_number')).first()
        if user and user.authenticate(data.get('password')):
            session['user_id'] = user.id
            return jsonify(user.to_dict()), 200
        return {'error': 'Invalid phone number or password'}, 401

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            return jsonify(user.to_dict()), 200
        return {'error': 'Unauthorized'}, 401

# TRANSACTIONS & CONTACTS (Transactions Branch)
class SendMoney(Resource):
    def post(self):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
        
        data = request.get_json()
        sender = User.query.get(session['user_id'])
        receiver = User.query.filter_by(phone_number=data.get('recipient_phone')).first()
        amount = data.get('amount')
        
        if not receiver:
            return {'error': 'Recipient not found'}, 404
        
        if sender.balance < amount:
            return {'error': 'Insufficient balance'}, 422
        
        # Deduct from sender, add to receiver
        sender.balance -= amount
        receiver.balance += amount
        
        new_transaction = Transaction(
            amount=amount,
            notes=data.get('notes'),
            sender=sender,
            receiver=receiver
        )
        
        db.session.add(new_transaction)
        db.session.commit()
        
        return jsonify(new_transaction.to_dict()), 201

class TransactionHistory(Resource):
    def get(self):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
            
        user = User.query.get(session['user_id'])
        sent_history = [t.to_dict() for t in user.sent_transactions]
        received_history = [t.to_dict() for t in user.received_transactions]
        
        return jsonify({
            'sent': sent_history,
            'received': received_history
        }), 200

class ContactsResource(Resource):
    def post(self):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401

        data = request.get_json()
        user_from = User.query.get(session['user_id'])
        user_to = User.query.filter_by(phone_number=data.get('contact_phone')).first()

        if not user_to:
            return {'error': 'Contact not found'}, 404
        
        new_contact = Contact(
            user_from=user_from,
            user_to=user_to,
            notes=data.get('notes')
        )
        
        db.session.add(new_contact)
        db.session.commit()
        return jsonify(new_contact.to_dict()), 201

    def get(self):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
        
        user = User.query.get(session['user_id'])
        contacts = [c.user_to.to_dict() for c in user.contacts_from]
        return jsonify(contacts), 200

# Add all resources to the API
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(Login, '/login')
api.add_resource(CheckSession, '/check_session')
api.add_resource(SendMoney, '/send_money')
api.add_resource(TransactionHistory, '/transactions')
api.add_resource(ContactsResource, '/contacts')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
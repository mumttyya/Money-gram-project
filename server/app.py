import os
from flask import Flask, request, jsonify, session
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
# Import the database object and models
from models import db, User, Transaction, Contact

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'a_very_secret_key'
app.json.compact = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- AUTHENTICATION & USER MANAGEMENT ---
# class Signup(Resource):
#     def post(self):
#         data = request.get_json()
#         try:
#             new_user = User(
#                 username=data['username'],
#                 phone_number=data['phone_number'],
#             )
#             new_user.password = data['password']
#             db.session.add(new_user)
#             db.session.commit()
#             return new_user.to_dict(), 201
#         except Exception as e:
#             db.session.rollback()
#             return {'error': str(e)}, 422

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(phone_number=data.get('phone_number')).first()
        if user and user.authenticate(data.get('password')):
            login_user(user)
            return user.to_dict(), 200
        return {'error': 'Invalid phone number or password'}, 401

class Logout(Resource):
    @login_required
    def post(self):
        logout_user()
        return {'message': 'Logged out successfully'}, 200

class CheckSession(Resource):
    def get(self):
        if current_user.is_authenticated:
            return current_user.to_dict(), 200
        return {'error': 'Unauthorized'}, 401

class UserResource(Resource):
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
            return new_user.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 422

    @login_required
    def get(self, user_id=None):
        if user_id:
            user = User.query.get_or_404(user_id)
            return user.to_dict(), 200

        users = [user.to_dict() for user in User.query.all()]
        return users, 200

# --- TRANSACTIONS & CONTACTS ---
class SendMoney(Resource):
    @login_required
    def post(self):
        data = request.get_json()
        sender = current_user
        receiver = User.query.filter_by(phone_number=data.get('recipient_phone')).first()
        amount = data.get('amount')
        
        if not receiver:
            return {'error': 'Recipient not found'}, 404
        
        if sender.balance < amount:
            return {'error': 'Insufficient balance'}, 422
        
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
        
        return new_transaction.to_dict(), 201

class TransactionHistory(Resource):
    @login_required
    def get(self):
        user = current_user
        sent_history = [t.to_dict() for t in user.sent_transactions]
        received_history = [t.to_dict() for t in user.received_transactions]
        
        return {
            'sent': sent_history,
            'received': received_history
        }, 200

class ContactsResource(Resource):
    @login_required
    def post(self):
        data = request.get_json()
        user_from = current_user
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
        return new_contact.to_dict(), 201

    @login_required
    def get(self):
        user = current_user
        contacts = [c.user_to.to_dict() for c in user.contacts_from]
        return contacts, 200

# --- ROUTE ADDITIONS ---
# api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(CheckSession, '/check_session')
api.add_resource(UserResource, '/users', '/users/<int:user_id>')
api.add_resource(SendMoney, '/send_money')
api.add_resource(TransactionHistory, '/transactions')
api.add_resource(ContactsResource, '/contacts')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
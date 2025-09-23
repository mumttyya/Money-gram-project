from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates, relationship
from bcrypt import hashpw, gensalt, checkpw
import re

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)

# User Model (Auth Branch)
class User(db.Model):
    _tablename_ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    phone_number = db.Column(db.String(10), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    balance = db.Column(db.Float, default=0.00)

    # One-to-many relationships (Transactions Branch)
    sent_transactions = db.relationship('Transaction', back_populates='sender', foreign_keys='Transaction.sender_id')
    received_transactions = db.relationship('Transaction', back_populates='receiver', foreign_keys='Transaction.receiver_id')
    
    # Reciprocal many-to-many relationship (Transactions Branch)
    contacts_from = relationship('Contact', foreign_keys='Contact.user_from_id', back_populates='user_from')
    contacts_to = relationship('Contact', foreign_keys='Contact.user_to_id', back_populates='user_to')
    
    @property
    def password(self):
        raise AttributeError('Password cannot be accessed.')

    @password.setter
    def password(self, password):
        self._password_hash = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

    def authenticate(self, password):
        return checkpw(password.encode('utf-8'), self._password_hash.encode('utf-8'))

    @validates('username')
    def validate_username(self, key, username):
        if not username or len(username) < 3:
            raise ValueError("Username must be at least 3 characters long.")
        return username

    @validates('phone_number')
    def validate_phone_number(self, key, phone_number):
        if not re.fullmatch(r'^\d{10}$', phone_number):
            raise ValueError("Phone number must be a 10-digit number.")
        return phone_number

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'phone_number': self.phone_number,
            'balance': self.balance,
        }

# Transaction Model (Transactions Branch)
class Transaction(db.Model):
    _tablename_ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    notes = db.Column(db.String)
    
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_transactions')
    receiver = db.relationship('User', foreign_keys=[receiver_id], back_populates='received_transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'notes': self.notes,
            'timestamp': self.timestamp.isoformat(),
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id
        }

# Contact Association Model (Transactions Branch)
class Contact(db.Model):
    _tablename_ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    notes = db.Column(db.String)  # User-submittable attribute
    
    user_from_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user_to_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    user_from = relationship('User', foreign_keys=[user_from_id], back_populates='contacts_from')
    user_to = relationship('User', foreign_keys=[user_to_id], back_populates='contacts_to')
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import MetaData
from sqlalchemy.orm import validates, relationship
from sqlalchemy_serializer import SerializerMixin
from bcrypt import hashpw, gensalt, checkpw
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import validates
import re
import os

db = SQLAlchemy()

# User Model (Auth Branch)
class User(db.Model, SerializerMixin): 
=======
class User(db.Model, SerializerMixin)

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    phone_number = db.Column(db.String(10), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Float, default=0.00)

    # relationships
    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.sender_id', backref='sender', lazy=True)
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.recipient_id', backref='recipient', lazy=True)

    # serialization
    serialize_rules = ('-sent_transactions.sender', '-received_transactions.recipient', '-password')

    @validates('phone_number')
    def validate_phone_number(self, key, phone_number):
        if not re.match(r'^\d{10}$', phone_number):
            raise ValueError("Phone number must be a 10-digit number.")
        return phone_number

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'phone_number': self.phone_number,
            'balance': self.balance
        }

class Transaction(db.Model, SerializerMixin):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    # serialization
    serialize_rules = ('-sender.sent_transactions', '-recipient.received_transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'amount': self.amount,
            'notes': self.notes,
            'timestamp': self.timestamp
        }

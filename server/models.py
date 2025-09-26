from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
import re
import os
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Float, default=0.00)

    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.sender_id', backref='sender', lazy=True)
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.recipient_id', backref='recipient', lazy=True)

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

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'amount': self.amount,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
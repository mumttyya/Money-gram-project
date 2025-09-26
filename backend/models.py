from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Float, default=15000.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sent_transactions = db.relationship('Transaction', foreign_keys='Transaction.sender_id', backref='sender', lazy=True)
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.recipient_id', backref='recipient', lazy=True)
    accounts = db.relationship('Account', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'phone_number': self.phone_number,
            'balance': self.balance,
            'created_at': self.created_at.isoformat()
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.String(255))
    status = db.Column(db.String(20), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'notes': self.notes,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'sender_name': self.sender.username if self.sender else None,
            'recipient_name': self.recipient.username if self.recipient else None
        }

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_type = db.Column(db.String(50), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'account_type': self.account_type,
            'account_number': self.account_number,
            'balance': self.balance,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class UserContact(db.Model):
    __tablename__ = 'user_contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    nickname = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='contacts_added')
    contact = db.relationship('User', foreign_keys=[contact_id], backref='added_by')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'contact_id': self.contact_id,
            'nickname': self.nickname,
            'contact_name': self.contact.username,
            'contact_phone': self.contact.phone_number,
            'created_at': self.created_at.isoformat()
        }
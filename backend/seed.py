from app import app, db
from models import User, Transaction, Account, UserContact
import random
import string

def generate_account_number():
    return ''.join(random.choices(string.digits, k=10))

def seed_data():
    with app.app_context():
        db.create_all()
        
        # Create sample users
        users = [
            User(username='john_doe', phone_number='1234567890', password='password123', balance=5000),
            User(username='jane_smith', phone_number='0987654321', password='password123', balance=3000),
            User(username='bob_wilson', phone_number='5555555555', password='password123', balance=7500)
        ]
        
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        
        # Create sample accounts
        for user in users:
            account = Account(
                user_id=user.id,
                account_type='mobile_money',
                account_number=generate_account_number(),
                balance=user.balance
            )
            db.session.add(account)
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()
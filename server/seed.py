

#!/usr/bin/env python3
from app import app
from models import db, User

with app.app_context():
    print("Seeding database...")

    # .Delete existing data to start fresh.
    User.query.delete()

    # .Create new users.
    uuser1 = User(username='Karl', phone_number='7123456780')
    user1.password = 'password123'

    user1 = User(username='Karl', phone_number='7123456780')
    user2.password = 'password123'

    db.session.add_all([user1, user2])
    db.session.commit()

    print("Seeding complete!")
=======
from app import app, db
from models import User, Transaction
import bcrypt

def seed_data():
    with app.app_context():
        print("Seeding database...")
        db.drop_all()
        db.create_all()

        # Create test users
        hashed_password = bcrypt.hashpw(b"password123", bcrypt.gensalt())
        user1 = User(username='Alice', phone_number='1234567890', password=hashed_password.decode('utf-8'), balance=1000.00)
        user2 = User(username='Bob', phone_number='0987654321', password=hashed_password.decode('utf-8'), balance=500.00)

        db.session.add_all([user1, user2])
        db.session.commit()

        # Create some initial transactions
        transaction1 = Transaction(sender_id=user1.id, recipient_id=user2.id, amount=50.00, notes="Lunch money")
        transaction2 = Transaction(sender_id=user2.id, recipient_id=user1.id, amount=25.00, notes="Groceries")

        db.session.add_all([transaction1, transaction2])
        db.session.commit()

        print("Database seeding complete!")

if __name__ == '__main__':
    seed_data()

    
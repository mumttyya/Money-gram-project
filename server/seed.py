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
#!/usr/bin/env python3
from app import app
from models import db, User

with app.app_context():
    print("Seeding database...")
    
    # Delete existing data to start fresh
    User.query.delete()
    
    # Create new users with 10-digit phone numbers
    user1 = User(username='Karl', phone_number='0712345678') # Change this line
    user1.password = 'password123'
    
    user2 = User(username='Collins', phone_number='0798765432') # Change this line
    user2.password = 'password123'
    
    db.session.add_all([user1, user2])
    db.session.commit()
    
    print("Seeding complete!")
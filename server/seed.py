# Import your app and db instances
from app import app, db
from models import User, ... # import your models

# Your seeding logic
def seed_database():
    # Delete existing data
    User.query.delete()
    # Add your new data here...
    new_user = User(username='testuser', email='test@example.com')
    db.session.add(new_user)
    db.session.commit()
    print("Database seeded successfully!")

# This is the crucial part
with app.app_context():
    seed_database()
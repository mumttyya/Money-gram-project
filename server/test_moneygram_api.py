import requests

BASE_URL = "http://127.0.0.1:5555"

def reset_database():
    print("Resetting database...")
    res = requests.delete(f"{BASE_URL}/reset")
    print(res.json(), res.status_code)

def register_user(username, phone, password="password123"):
    print(f"Registering {username}...")
    res = requests.post(f"{BASE_URL}/users", json={
        "username": username,
        "phone_number": phone,
        "password": password
    })
    print(res.json())
    return res.json()

def login_user(phone, password="password123"):
    print(f"Logging in {phone}...")
    res = requests.post(f"{BASE_URL}/login", json={
        "phone_number": phone,
        "password": password
    })
    print(res.json())
    return res.json()

def send_money(sender_id, recipient_phone, amount):
    print(f"Sending {amount} from user {sender_id} to {recipient_phone}...")
    headers = {"X-User-ID": str(sender_id)}
    res = requests.post(f"{BASE_URL}/send_money", headers=headers, json={
        "recipient_phone": recipient_phone,
        "amount": amount
    })
    print(res.json())
    return res.json()

def get_transactions(user_id):
    print(f"Fetching transactions for user {user_id}...")
    headers = {"X-User-ID": str(user_id)}
    res = requests.get(f"{BASE_URL}/transactions", headers=headers)
    print(res.json())
    return res.json()

if __name__ == "__main__":
    reset_database()

    # Register users
    alice = register_user("Alice", "0700000001")
    bob = register_user("Bob", "0700000002")

    # Login users
    alice_login = login_user("0700000001")
    bob_login = login_user("0700000002")

    alice_id = alice_login["user"]["id"]
    bob_id = bob_login["user"]["id"]

    # Alice sends 200 to Bob
    send_money(alice_id, "0700000002", 200)

    # Fetch transactions
    print("Alice's transactions:")
    get_transactions(alice_id)

    print("Bob's transactions:")
    get_transactions(bob_id)
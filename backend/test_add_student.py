import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api/fleet"

def run_test():
    email = f"test_{uuid.uuid4().hex[:8]}@test.com"
    print(f"--- TEST: REGISTER {email} ---")
    res = requests.post(f"{BASE_URL}/auth/register-company/", json={
        "company_name": "Test Company",
        "manager_name": "Test Manager",
        "email": email,
        "phone": "05554443322",
        "password": "testpassword123"
    })
    
    if res.status_code != 201:
        print("Register failed:", res.status_code, res.text)
        return

    token = res.json()["token"]
    headers = {"Authorization": f"Token {token}", "Content-Type": "application/json"}
    
    print("\n--- TEST: ADD STUDENT ---")
    student_payload = {
        "first_name": "Ali",
        "last_name": "Veli",
        "parent_name": "Ahmet",
        "parent_phone": "05554443311",
        "pickup_address": "Test Adresi",
        "total_agreed_fee": 10000.0,
        "installment_count": 4,
        "vehicle": None
    }
    
    res = requests.post(f"{BASE_URL}/students/", json=student_payload, headers=headers)
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)

if __name__ == "__main__":
    run_test()

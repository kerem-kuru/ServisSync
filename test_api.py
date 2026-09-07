import requests

url = "http://127.0.0.1:8000/api/fleet/vehicles/"
data = {
    "company": "",
    "plate_number": "34 TT 1234",
    "driver_name": "kerem",
    "driver_phone": "05524885865"
}

try:
    response = requests.post(url, json=data)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)

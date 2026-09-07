import os
import sys
import django

# Django ortamını kur
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.conf import settings
from twilio.rest import Client
from fleet.services.notification import _format_phone_number

account_sid = settings.TWILIO_ACCOUNT_SID
auth_token = settings.TWILIO_AUTH_TOKEN
from_number = settings.TWILIO_FROM_NUMBER

print(f"SID: {account_sid}")
print(f"TOKEN: {'*' * len(auth_token) if auth_token else None}")
print(f"FROM: {from_number}")

if not account_sid or not auth_token or not from_number:
    print("HATA: Bilgiler settings'ten okunamadı. Lütfen .env dosyasını ve settings.py'yi kontrol edin.")
    sys.exit(1)

test_phone = "+905524885865"
formatted_phone = _format_phone_number(test_phone)
print(f"Gönderilecek Numara: {formatted_phone}")

try:
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body="sms_feedback_surveys",
        from_=from_number,
        to=formatted_phone
    )
    print(f"BAŞARILI: SID: {message.sid}")
except Exception as e:
    print(f"HATA OLUŞTU: {e}")

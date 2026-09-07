"""
ServisSync — Bildirim Servisi (Twilio)
=====================================
AttendanceLog kaydedildiğinde veliye SMS gönderir.
Asenkron çalışması için thread kullanır.

Kullanım:
    from fleet.services.notification import notify_parent
    notify_parent(attendance_log)
"""

import threading
import time
import logging
from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)

# ANSI renk kodları (Sadece fallback/hata çıktıları için)
_GREEN = "\033[92m"
_CYAN = "\033[96m"
_YELLOW = "\033[93m"
_BOLD = "\033[1m"
_RESET = "\033[0m"

# Durum → Türkçe mesaj eşleştirmesi
_STATUS_MESSAGES = {
    "boarded": "servise bindi 🚌",
    "dropped": "servisten indi 🏠",
    "absent": "servise gelmedi ❌",
}

# Yön → Türkçe eşleştirme
_DIRECTION_LABELS = {
    "morning": "Sabah",
    "evening": "Akşam",
}


def _format_phone_number(phone: str) -> str:
    """Twilio için telefon numarasını E.164 formatına çevirir (Türkiye için +90)."""
    phone = phone.strip()
    if phone.startswith("05") and len(phone) == 11:
        return f"+9{phone}"
    elif phone.startswith("5") and len(phone) == 10:
        return f"+90{phone}"
    return phone


def _send_twilio_sms(parent_phone: str, parent_name: str, student_name: str,
                     status: str, direction: str) -> None:
    """
    Twilio API ile gerçek SMS gönderimi — arka plan thread'inde çalışır.
    """
    status_text = _STATUS_MESSAGES.get(status, status)
    direction_text = _DIRECTION_LABELS.get(direction, direction)
    
    # Twilio Deneme Hesabı Kısıtlaması (Test için çalışan haline geri alındı)
    body = "sms_feedback_surveys"

    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_FROM_NUMBER

    if not account_sid or not auth_token or not from_number:
        logger.error("Twilio kimlik bilgileri eksik. Konsola yazdırılıyor.")
        print(f"Twilio Mock: {body} to {parent_phone}")
        return

    formatted_phone = _format_phone_number(parent_phone)

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=formatted_phone
        )
        print(f"{_BOLD}{_GREEN}[SMS BAŞARILI]{_RESET} SID: {message.sid} → Veli: {parent_name} ({formatted_phone})")
    except Exception as e:
        logger.error(f"Twilio SMS Gönderim Hatası ({formatted_phone}): {str(e)}")
        print(f"{_BOLD}\033[91m[SMS HATASI]{_RESET} {formatted_phone} — {str(e)}")


def notify_parent(attendance_log) -> None:
    """
    AttendanceLog kaydedildiğinde veliye bildirim gönderir.
    Arka plan thread'i kullanarak ana isteği bloklamaz.
    """
    student = attendance_log.student

    parent_phone = student.parent_phone
    parent_name = student.parent_name or "Veli"
    student_name = str(student)
    status = attendance_log.status
    direction = attendance_log.direction

    if not parent_phone:
        print(
            f"{_BOLD}\033[91m[SMS ATLANILDI]{_RESET} "
            f"{student_name} — veli telefon numarası tanımlı değil."
        )
        return

    thread = threading.Thread(
        target=_send_twilio_sms,
        args=(parent_phone, parent_name, student_name, status, direction),
        daemon=True,
        name=f"sms-{student_name}",
    )
    thread.start()


def _send_twilio_payment_reminder(parent_phone: str, parent_name: str, student_name: str, remaining_debt: float) -> None:
    """
    Twilio API ile aidat hatırlatma SMS'i.
    """
    # Twilio Deneme Hesabı Kısıtlaması
    body = "sms_feedback_surveys"
    
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_FROM_NUMBER

    if not account_sid or not auth_token or not from_number:
        print(f"Twilio Mock Hatırlatma: {body} to {parent_phone}")
        return

    formatted_phone = _format_phone_number(parent_phone)

    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=formatted_phone
        )
        print(f"{_BOLD}{_GREEN}[HATIRLATMA SMS]{_RESET} SID: {message.sid} → {formatted_phone}")
    except Exception as e:
        print(f"{_BOLD}\033[91m[HATIRLATMA HATASI]{_RESET} {formatted_phone} — {str(e)}")


def send_payment_reminder(student) -> None:
    """
    Öğrencinin velisine aidat hatırlatma mesajı gönderir.
    """
    parent_phone = student.parent_phone
    parent_name = student.parent_name or "Veli"
    student_name = str(student)
    
    if not parent_phone:
        print(
            f"{_BOLD}\033[91m[HATIRLATMA ATLANILDI]{_RESET} "
            f"{student_name} — veli telefon numarası tanımlı değil."
        )
        return

    remaining_debt = student.remaining_debt
    if remaining_debt <= 0:
        return

    thread = threading.Thread(
        target=_send_twilio_payment_reminder,
        args=(parent_phone, parent_name, student_name, remaining_debt),
        daemon=True,
        name=f"reminder-{student_name}",
    )
    thread.start()

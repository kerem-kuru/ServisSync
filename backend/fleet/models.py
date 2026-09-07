"""
ServisSync — Fleet Models
=========================
Company, Vehicle, Student, AttendanceLog, Payment
Tüm modellerde UUID primary key kullanılır.
"""

import uuid
from django.db import models


from django.contrib.auth.models import User

class Company(models.Model):
    """Servis şirketi."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company', null=True)
    name = models.CharField("Şirket Adı", max_length=255)
    phone = models.CharField("Telefon", max_length=20, blank=True, default="")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        db_table = "companies"
        verbose_name = "Şirket"
        verbose_name_plural = "Şirketler"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    """Servis aracı."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="vehicles",
        verbose_name="Şirket",
    )
    plate_number = models.CharField("Plaka", max_length=15)
    driver_name = models.CharField("Sürücü Adı", max_length=150, blank=True, default="")
    driver_phone = models.CharField("Sürücü Telefon", max_length=20, blank=True, default="")
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    class Meta:
        db_table = "vehicles"
        verbose_name = "Araç"
        verbose_name_plural = "Araçlar"
        ordering = ["plate_number"]
        unique_together = ["company", "plate_number"]

    def __str__(self):
        return f"{self.plate_number} — {self.driver_name}"


class Student(models.Model):
    """Servis hizmeti alan öğrenci."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="students",
        verbose_name="Şirket",
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
        verbose_name="Araç",
    )
    first_name = models.CharField("Ad", max_length=100)
    last_name = models.CharField("Soyad", max_length=100)
    parent_name = models.CharField("Veli Adı", max_length=200, blank=True, default="")
    parent_phone = models.CharField("Veli Telefon", max_length=20, blank=True, default="")
    pickup_address = models.TextField("Alınma Adresi", blank=True, default="")
    monthly_fee = models.DecimalField(
        "Aylık Ücret",
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    installment_count = models.IntegerField("Taksit Sayısı", default=1)
    total_agreed_fee = models.DecimalField(
        "Toplam Anlaşılan Ücret",
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    is_active = models.BooleanField("Aktif mi?", default=True)
    created_at = models.DateTimeField("Oluşturulma", auto_now_add=True)

    @property
    def total_paid(self):
        from decimal import Decimal
        payments = self.payments.filter(status='paid')
        return sum((p.amount for p in payments), Decimal('0'))

    @property
    def remaining_debt(self):
        return self.total_agreed_fee - self.total_paid

    class Meta:
        db_table = "students"
        verbose_name = "Öğrenci"
        verbose_name_plural = "Öğrenciler"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class AttendanceLog(models.Model):
    """Öğrenci yoklama kaydı."""

    class Status(models.TextChoices):
        BOARDED = "boarded", "Bindi"
        DROPPED = "dropped", "İndi"
        ABSENT = "absent", "Gelmedi"

    class Direction(models.TextChoices):
        MORNING = "morning", "Sabah"
        EVENING = "evening", "Akşam"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_logs",
        verbose_name="Öğrenci",
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="attendance_logs",
        verbose_name="Araç",
    )
    status = models.CharField(
        "Durum",
        max_length=10,
        choices=Status.choices,
        default=Status.BOARDED,
    )
    direction = models.CharField(
        "Yön",
        max_length=10,
        choices=Direction.choices,
        default=Direction.MORNING,
    )
    logged_at = models.DateTimeField("Kayıt Zamanı", auto_now_add=True)

    class Meta:
        db_table = "attendance_logs"
        verbose_name = "Yoklama Kaydı"
        verbose_name_plural = "Yoklama Kayıtları"
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.student} — {self.get_status_display()} ({self.get_direction_display()})"


class Payment(models.Model):
    """Aidat / ödeme kaydı (Taksit)."""

    class Method(models.TextChoices):
        CASH = "cash", "Nakit"
        TRANSFER = "transfer", "Havale/EFT"
        CARD = "card", "Kredi Kartı"

    class Status(models.TextChoices):
        PENDING = "pending", "Bekliyor"
        PAID = "paid", "Ödendi"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="Şirket",
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="Öğrenci",
    )
    amount = models.DecimalField(
        "Tutar",
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    payment_method = models.CharField(
        "Ödeme Yöntemi",
        max_length=20,
        choices=Method.choices,
        default=Method.CASH,
    )
    status = models.CharField(
        "Durum",
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    installment_number = models.IntegerField("Taksit No", default=1)
    notes = models.TextField("Notlar", blank=True, default="")
    paid_at = models.DateTimeField("Ödeme Tarihi", null=True, blank=True)

    class Meta:
        db_table = "payments"
        verbose_name = "Ödeme"
        verbose_name_plural = "Ödemeler"
        ordering = ["installment_number", "paid_at"]

    def __str__(self):
        return f"{self.student} — ₺{self.amount} ({self.get_payment_method_display()})"

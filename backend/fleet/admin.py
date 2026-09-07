from django.contrib import admin
from .models import Company, Vehicle, Student, AttendanceLog, Payment


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "created_at")
    search_fields = ("name",)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("plate_number", "driver_name", "company", "created_at")
    list_filter = ("company",)
    search_fields = ("plate_number", "driver_name")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "company", "vehicle", "monthly_fee", "is_active")
    list_filter = ("company", "is_active")
    search_fields = ("first_name", "last_name", "parent_name")


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ("student", "vehicle", "status", "direction", "logged_at")
    list_filter = ("status", "direction", "logged_at")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "company",
        "amount",
        "payment_method",
        "paid_at",
    )
    list_filter = ("payment_method", "company")
    search_fields = ("student__first_name", "student__last_name")

"""
ServisSync — Fleet URL Configuration
======================================
Tüm API endpoint'leri /api/fleet/ altında tanımlanır (core/urls.py'de mount edilir).
"""

from django.urls import path

from . import views

app_name = "fleet"

urlpatterns = [
    # ── CRUD: Vehicle ──
    path("vehicles/", views.VehicleListCreateView.as_view(), name="vehicle-list"),
    path("vehicles/<uuid:pk>/", views.VehicleDetailView.as_view(), name="vehicle-detail"),

    # ── CRUD: Student ──
    path("students/", views.StudentListCreateView.as_view(), name="student-list"),
    path("students/<uuid:pk>/", views.StudentDetailView.as_view(), name="student-detail"),
    path(
        "students/<uuid:pk>/assign-vehicle/",
        views.StudentAssignVehicleView.as_view(),
        name="student-assign-vehicle",
    ),
    path("students/ai-import/", views.AIImportPreviewView.as_view(), name="ai-import-preview"),
    path("students/ai-confirm-import/", views.AIImportConfirmView.as_view(), name="ai-import-confirm"),

    # ── CRUD: Payment ──
    path("payments/", views.PaymentListCreateView.as_view(), name="payment-list-create"),
    path("payments/<uuid:pk>/", views.PaymentDetailView.as_view(), name="payment-detail"),
    path("payments/<uuid:pk>/approve/", views.ApproveInstallmentView.as_view(), name="payment-approve"),
    path(
        "notifications/send-payment-reminder/",
        views.SendPaymentReminderView.as_view(),
        name="send-payment-reminder",
    ),

    # ── Auth & Giriş İşlemleri ──
    path("auth/register-company/", views.RegisterCompanyView.as_view(), name="register-company"),
    path("auth/company-login/", views.CompanyLoginView.as_view(), name="company-login"),
    path("auth/driver-login/", views.DriverLoginView.as_view(), name="driver-login"),
    path("auth/delete-company/", views.DeleteCompanyView.as_view(), name="delete-company"),
    
    # ── Şoför Özel (Eski driver/login yolunu desteklemek için bırakılabilir, ancak auth'a taşındı) ──
    path("driver/login/", views.DriverLoginView.as_view(), name="driver-login-legacy"),
    path("attendance/log/", views.AttendanceLogCreateView.as_view(), name="attendance-log"),
]

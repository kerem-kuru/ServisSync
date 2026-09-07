"""
ServisSync — Fleet API Views
==============================
CRUD endpoint'leri + Şoför özel endpoint'leri.
"""

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import pandas as pd
from django.db import transaction

from .models import Vehicle, Student, AttendanceLog, Payment
from .serializers import (
    VehicleSerializer,
    StudentSerializer,
    StudentAssignVehicleSerializer,
    AttendanceLogSerializer,
    AttendanceLogCreateSerializer,
    PaymentSerializer,
    DriverLoginSerializer,
    DriverLoginResponseSerializer,
    RegisterCompanySerializer,
    CompanyLoginSerializer,
)
from .services.notification import notify_parent, send_payment_reminder


# ════════════════════════════════════════════════════════════════
# CRUD — Vehicle
# ════════════════════════════════════════════════════════════════
class VehicleListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/fleet/vehicles/  → Araç listesi
    POST /api/fleet/vehicles/  → Yeni araç ekle
    """

    permission_classes = [IsAuthenticated]
    serializer_class = VehicleSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            return Vehicle.objects.none()
        return Vehicle.objects.filter(company=user.company)

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Kullanıcıya ait bir şirket hesabı bulunamadı."})
        serializer.save(company=user.company)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/fleet/vehicles/<pk>/  → Araç detayı
    PUT    /api/fleet/vehicles/<pk>/  → Araç güncelle
    DELETE /api/fleet/vehicles/<pk>/  → Araç sil
    """

    permission_classes = [IsAuthenticated]
    serializer_class = VehicleSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            return Vehicle.objects.none()
        return Vehicle.objects.filter(company=user.company)


# ════════════════════════════════════════════════════════════════
# CRUD — Student
# ════════════════════════════════════════════════════════════════
class StudentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/fleet/students/  → Öğrenci listesi
    POST /api/fleet/students/  → Yeni öğrenci ekle
    """

    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            return Student.objects.none()
        return Student.objects.select_related("vehicle").filter(company=user.company)

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Kullanıcıya ait bir şirket hesabı bulunamadı."})
        serializer.save(company=user.company)


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/fleet/students/<pk>/  → Öğrenci detayı
    PUT    /api/fleet/students/<pk>/  → Öğrenci güncelle
    DELETE /api/fleet/students/<pk>/  → Öğrenci sil
    """

    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            return Student.objects.none()
        return Student.objects.select_related("vehicle").filter(company=user.company)


class StudentAssignVehicleView(APIView):
    """
    PATCH /api/fleet/students/<pk>/assign-vehicle/
    Öğrenciyi bir araca atar (vehicle_id güncelleme).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not hasattr(user, 'company') or not user.company:
            return Response({"detail": "Kullanıcıya ait bir şirket hesabı bulunamadı."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = Student.objects.get(pk=pk, company=user.company)
        except Student.DoesNotExist:
            return Response(
                {"detail": "Öğrenci bulunamadı veya bu şirkete ait değil."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StudentAssignVehicleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle_id = serializer.validated_data["vehicle_id"]
        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id, company=user.company)
        except Vehicle.DoesNotExist:
            return Response(
                {"detail": "Araç bulunamadı veya bu şirkete ait değil."},
                status=status.HTTP_404_NOT_FOUND,
            )

        student.vehicle = vehicle
        student.save(update_fields=["vehicle"])

        return Response(
            StudentSerializer(student).data,
            status=status.HTTP_200_OK,
        )


class AIImportPreviewView(APIView):
    """
    POST /api/fleet/students/ai-import/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"detail": "Dosya bulunamadı."}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)
                
            df = df.fillna('')
            raw_data = df.to_dict('records')
            
            from .services.ai_importer import parse_messy_excel_with_ai
            parsed_data = parse_messy_excel_with_ai(raw_data)
            return Response(parsed_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Dosya işlenirken hata oluştu: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AIImportConfirmView(APIView):
    """
    POST /api/fleet/students/ai-confirm-import/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Geçersiz veri formatı. Liste bekleniyor."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        company = user.company
        
        vehicles_cache = {v.plate_number: v for v in Vehicle.objects.filter(company=company)}
        payments_to_create = []
        
        try:
            with transaction.atomic():
                for item in data:
                    plate_number = item.get("plate_number", "").strip()
                    vehicle = None
                    if plate_number:
                        if plate_number not in vehicles_cache:
                            vehicle = Vehicle.objects.create(company=company, plate_number=plate_number, driver_name="Belirtilmedi")
                            vehicles_cache[plate_number] = vehicle
                        else:
                            vehicle = vehicles_cache[plate_number]
                    
                    total_fee = float(item.get("total_agreed_fee", 0))
                    installments = int(item.get("installment_count", 9))
                    
                    student = Student.objects.create(
                        company=company,
                        first_name=item.get("first_name", ""),
                        last_name=item.get("last_name", ""),
                        parent_name=item.get("parent_name", ""),
                        parent_phone=item.get("parent_phone", ""),
                        pickup_address=item.get("pickup_address", ""),
                        total_agreed_fee=total_fee,
                        installment_count=installments,
                        vehicle=vehicle
                    )
                    
                    if total_fee > 0 and installments > 0:
                        amount_per = total_fee / installments
                        for i in range(1, installments + 1):
                            payments_to_create.append(Payment(
                                company=company,
                                student=student,
                                amount=amount_per,
                                installment_number=i,
                                status=Payment.Status.PENDING
                            ))
                            
                if payments_to_create:
                    Payment.objects.bulk_create(payments_to_create)
                    
            return Response({"detail": f"{len(data)} öğrenci başarıyla içe aktarıldı."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": f"Kayıt sırasında hata oluştu: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════════════════════
# CRUD — Payment
# ════════════════════════════════════════════════════════════════
class PaymentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/fleet/payments/  → Aidat listesi
    POST /api/fleet/payments/  → Yeni ödeme kaydı
    """

    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            return Payment.objects.none()
        return Payment.objects.select_related("student").filter(company=user.company)

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'company') or not user.company:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Kullanıcıya ait bir şirket hesabı bulunamadı."})
        serializer.save(company=user.company)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/fleet/payments/<pk>/  → Ödeme detayı
    PUT    /api/fleet/payments/<pk>/  → Ödeme güncelle
    DELETE /api/fleet/payments/<pk>/  → Ödeme sil
    """

    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.select_related("student").filter(company=user.company)


class ApproveInstallmentView(APIView):
    """
    POST /api/fleet/payments/<pk>/approve/
    Belirli bir taksitin ödemesini onaylar (Tahsil eder).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        if not hasattr(user, 'company') or not user.company:
            return Response({"detail": "Şirket hesabı bulunamadı."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(pk=pk, company=user.company)
        except Payment.DoesNotExist:
            return Response({"detail": "Taksit bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == Payment.Status.PAID:
            return Response({"detail": "Bu taksit zaten ödenmiş."}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = Payment.Status.PAID
        payment.paid_at = timezone.now()
        payment.payment_method = request.data.get("payment_method", Payment.Method.CASH)
        payment.save(update_fields=["status", "paid_at", "payment_method"])

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class SendPaymentReminderView(APIView):
    """
    POST /api/fleet/notifications/send-payment-reminder/
    Body: { student_id } or { bulk: true }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student_id = request.data.get("student_id")
        bulk = request.data.get("bulk", False)
        user_company = request.user.company

        if bulk:
            students = Student.objects.filter(company=user_company, is_active=True)
            sent_count = 0
            for student in students:
                if student.remaining_debt > 0:
                    send_payment_reminder(student)
                    sent_count += 1
            return Response({"detail": f"{sent_count} veliye hatırlatma gönderildi."})
        else:
            if not student_id:
                return Response(
                    {"detail": "student_id veya bulk parametresi gereklidir."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                student = Student.objects.get(pk=student_id)
                if student.remaining_debt > 0:
                    send_payment_reminder(student)
                    return Response({"detail": "Hatırlatma gönderildi."})
                else:
                    return Response({"detail": "Öğrencinin borcu bulunmamaktadır."}, status=status.HTTP_400_BAD_REQUEST)
            except Student.DoesNotExist:
                return Response({"detail": "Öğrenci bulunamadı."}, status=status.HTTP_404_NOT_FOUND)


# ════════════════════════════════════════════════════════════════
# Auth — Company
# ════════════════════════════════════════════════════════════════
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class RegisterCompanyView(APIView):
    """
    POST /api/fleet/auth/register-company/
    """
    def post(self, request):
        serializer = RegisterCompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            token, _ = Token.objects.get_or_create(user=company.owner)
            return Response({
                "token": token.key,
                "company_id": company.id,
                "company_name": company.name,
                "manager_name": company.owner.first_name,
                "email": company.owner.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyLoginView(APIView):
    """
    POST /api/fleet/auth/company-login/
    """
    def post(self, request):
        serializer = CompanyLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(username=email, password=password)
            
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                try:
                    company = user.company
                except:
                    return Response({"detail": "Bu kullanıcıya ait bir şirket hesabı bulunamadı."}, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    "token": token.key,
                    "company_id": company.id,
                    "company_name": company.name,
                    "manager_name": user.first_name,
                    "email": user.email
                }, status=status.HTTP_200_OK)
            return Response({"detail": "E-posta veya şifre hatalı."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteCompanyView(APIView):
    """
    DELETE /api/fleet/auth/delete-company/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "Hesap başarıyla silindi."}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════════════
# Şoför Özel — Login
# ════════════════════════════════════════════════════════════════
class DriverLoginView(APIView):
    """
    POST /api/fleet/driver/login/
    Şoför telefon numarasıyla giriş yapar.
    Eşleşen aracı ve araçtaki öğrencileri döner.
    (MVP — SMS doğrulaması yerine direkt telefon kontrolü.)
    """

    def post(self, request):
        serializer = DriverLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]

        try:
            vehicle = Vehicle.objects.get(driver_phone=phone)
        except Vehicle.DoesNotExist:
            return Response(
                {"detail": "Bu telefon numarasına kayıtlı araç bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Vehicle.MultipleObjectsReturned:
            # Aynı telefonla birden fazla araç varsa ilkini al
            vehicle = Vehicle.objects.filter(driver_phone=phone).first()

        students = Student.objects.filter(
            vehicle=vehicle, is_active=True
        ).order_by("last_name", "first_name")

        response_data = {
            "vehicle": VehicleSerializer(vehicle).data,
            "students": StudentSerializer(students, many=True).data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════════
# Şoför Özel — Yoklama Kaydı
# ════════════════════════════════════════════════════════════════
class AttendanceLogCreateView(APIView):
    """
    POST /api/fleet/attendance/log/
    Şoför butona bastığında yoklama kaydı oluşturur.
    Body: { student_id, status, direction }
    Kayıt sonrası bildirim servisi tetiklenir.
    """

    def post(self, request):
        serializer = AttendanceLogCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student_id = serializer.validated_data["student_id"]
        log_status = serializer.validated_data["status"]
        direction = serializer.validated_data["direction"]

        try:
            student = Student.objects.select_related("vehicle").get(pk=student_id)
        except Student.DoesNotExist:
            return Response(
                {"detail": "Öğrenci bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not student.vehicle:
            return Response(
                {"detail": "Öğrencinin atanmış bir aracı yok."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attendance_log = AttendanceLog.objects.create(
            student=student,
            vehicle=student.vehicle,
            status=log_status,
            direction=direction,
        )

        # 🔔 Bildirim servisini tetikle (arka plan thread)
        notify_parent(attendance_log)

        return Response(
            AttendanceLogSerializer(attendance_log).data,
            status=status.HTTP_201_CREATED,
        )

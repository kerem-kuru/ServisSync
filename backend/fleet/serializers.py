"""
ServisSync — Fleet Serializers
===============================
Vehicle, Student, AttendanceLog ve Payment modelleri için DRF serializer'ları.
"""

from rest_framework import serializers

from .models import Vehicle, Student, AttendanceLog, Payment


# ────────────────────────────────────────────────────────────────
# Vehicle
# ────────────────────────────────────────────────────────────────
class VehicleSerializer(serializers.ModelSerializer):
    """Araç listeleme / oluşturma serializer'ı."""

    student_count = serializers.IntegerField(source="students.count", read_only=True)
    company = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "company",
            "plate_number",
            "driver_name",
            "driver_phone",
            "student_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_company(self, value):
        return getattr(value, "company", None)

    def create(self, validated_data):
        return super().create(validated_data)


# ────────────────────────────────────────────────────────────────
# Student
# ────────────────────────────────────────────────────────────────
class StudentSerializer(serializers.ModelSerializer):
    """Öğrenci listeleme / oluşturma serializer'ı."""

    vehicle_plate = serializers.CharField(
        source="vehicle.plate_number", read_only=True
    )

    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    remaining_debt = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    # Nested payments list
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "company",
            "vehicle",
            "vehicle_plate",
            "first_name",
            "last_name",
            "parent_name",
            "parent_phone",
            "pickup_address",
            "monthly_fee",
            "installment_count",
            "total_agreed_fee",
            "total_paid",
            "remaining_debt",
            "is_active",
            "payments",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"company": {"required": False}}

    def get_payments(self, obj):
        # Local import to prevent circular import if PaymentSerializer is defined below
        from .serializers import PaymentSerializer
        return PaymentSerializer(obj.payments.all(), many=True).data

    def create(self, validated_data):
        if "company" not in validated_data:
            from .models import Company
            company, _ = Company.objects.get_or_create(name="Servis A.Ş.")
            validated_data["company"] = company
            
        student = super().create(validated_data)
        
        # Otomatik taksitleri oluştur
        count = student.installment_count
        total = student.total_agreed_fee
        if count > 0 and total > 0:
            amount_per = total / count
            from .models import Payment
            for i in range(1, count + 1):
                Payment.objects.create(
                    company=student.company,
                    student=student,
                    amount=amount_per,
                    installment_number=i,
                    status=Payment.Status.PENDING
                )
        return student


class StudentAssignVehicleSerializer(serializers.Serializer):
    """Öğrenciyi araca atama için minimal serializer."""

    vehicle_id = serializers.UUIDField()


# ────────────────────────────────────────────────────────────────
# AttendanceLog
# ────────────────────────────────────────────────────────────────
class AttendanceLogSerializer(serializers.ModelSerializer):
    """Yoklama kaydı serializer'ı."""

    student_name = serializers.CharField(source="student.__str__", read_only=True)

    class Meta:
        model = AttendanceLog
        fields = [
            "id",
            "student",
            "vehicle",
            "status",
            "direction",
            "student_name",
            "logged_at",
        ]
        read_only_fields = ["id", "logged_at"]


class AttendanceLogCreateSerializer(serializers.Serializer):
    """Şoför uygulamasından gelen yoklama verisi."""

    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=AttendanceLog.Status.choices)
    direction = serializers.ChoiceField(choices=AttendanceLog.Direction.choices)


# ────────────────────────────────────────────────────────────────
# Payment
# ────────────────────────────────────────────────────────────────
class PaymentSerializer(serializers.ModelSerializer):
    """Ödeme listeleme serializer'ı."""

    student_name = serializers.CharField(source="student.__str__", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "company",
            "student",
            "student_name",
            "amount",
            "payment_method",
            "status",
            "installment_number",
            "notes",
            "paid_at",
        ]
        read_only_fields = ["id", "paid_at"]
        extra_kwargs = {"company": {"required": False}}

    def create(self, validated_data):
        if "company" not in validated_data:
            from .models import Company
            company, _ = Company.objects.get_or_create(name="Servis A.Ş.")
            validated_data["company"] = company
        return super().create(validated_data)


# ────────────────────────────────────────────────────────────────
# Driver Login
# ────────────────────────────────────────────────────────────────
class DriverLoginSerializer(serializers.Serializer):
    """Şoför giriş serializer'ı — telefon numarasıyla eşleşme."""

    phone = serializers.CharField(max_length=20)


class DriverLoginResponseSerializer(serializers.Serializer):
    """Şoför giriş yanıt serializer'ı."""

    vehicle = VehicleSerializer()
    students = StudentSerializer(many=True)

# ────────────────────────────────────────────────────────────────
# Auth - Company
# ────────────────────────────────────────────────────────────────
from django.contrib.auth.models import User

class RegisterCompanySerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    manager_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kullanılıyor.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kullanılıyor.")
        return value

    def create(self, validated_data):
        # Create User
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['manager_name']
        )
        # Create Company
        from .models import Company
        company = Company.objects.create(
            owner=user,
            name=validated_data['company_name'],
            phone=validated_data['phone']
        )
        return company

class CompanyLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

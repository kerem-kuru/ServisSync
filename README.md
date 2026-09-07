# 🚌 ServisSync - Akıllı Okul ve Personel Servis Yönetim Sistemi

ServisSync, modern web teknolojilerini kullanarak servis taşımacılığı sektöründeki operasyonel zorlukları (yoklama takibi, veli bilgilendirme, ödeme takibi) tamamen dijitalleştiren kapsamlı bir SaaS (Software as a Service) platformudur. 

Projenin temel amacı, servis firmalarına güçlü bir yönetim paneli sunarken, şoförlerin sahada sıfır sürtünme ile (uygulama indirmeden, PWA üzerinden) yoklama alabilmesini ve velilerin anlık SMS ile bilgilendirilmesini sağlamaktır.

---

## 🌟 Temel Özellikler ve Modüller

### 1. Yönetici Paneli (Admin Dashboard)
Yöneticiler için geliştirilen tam kapsamlı web arayüzü:
- **Araç ve Şoför Yönetimi:** Filodaki araçların, plakaların ve onlara atanan şoförlerin takibi.
- **Öğrenci/Personel Yönetimi:** Hangi öğrencinin hangi araca kayıtlı olduğu, veli iletişim bilgileri ve biniş-iniş adreslerinin yönetimi.
- **Yapay Zeka (AI) Destekli Akıllı İçe Aktarım:** Firmaların ellerindeki karmaşık ve düzensiz Excel öğrenci listelerini Google Gemini AI kullanarak saniyeler içinde anlamlandırıp sisteme otomatik kaydetme yeteneği.
- **Ödeme Takip Modülü:** Öğrencilerin aylık taksitlerinin takibi, nakit/kredi kartı tahsilatları ve geciken ödemeler için velilere **Tek Tıkla Twilio SMS Hatırlatması** gönderme.

### 2. Şoför Mobil Uygulaması (PWA)
Şoförlerin sürüş esnasında kolayca kullanabilmesi için tasarlandı:
- **Progressive Web App (PWA):** App Store veya Google Play'e ihtiyaç duymadan, doğrudan tarayıcı üzerinden telefonun ana ekranına yüklenebilen native hisli web uygulaması.
- **Çift Yönlü Sefer Mantığı:** Sabah (Evden Okula) ve Akşam (Okuldan Eve) şeklinde ayrı yoklama listeleri.
- **Tek Tıkla Yoklama:** Kocaman butonlarla (Bindi, İndi, Gelmedi) şoförün dikkatini dağıtmadan yoklama alabilmesi. (Tıklandığında Haptic titreşim geri bildirimi).
- **Offline First (Servis Worker):** PWA önbelleklemesi sayesinde hızlı açılış süresi.

### 3. Otomatik Bildirim Sistemi (Twilio Entegrasyonu)
Sistem, gerçek dünya ile anlık iletişim kurar:
- Şoför "Öğrenci Bindi" butonuna bastığı an, Django backend'i **Twilio API**'sini tetikler.
- Velinin cep telefonuna saniyeler içinde *"Öğrenciniz servise binmiştir"* şeklinde kişiselleştirilmiş SMS gider.

---

## 🏗️ Mimari ve Kod Yapısı

Proje, "Decoupled (Ayrık)" mimari kullanılarak Backend (API) ve Frontend (İstemci) olarak iki ayrı klasörde geliştirilmiştir.

### Backend (Django REST Framework)
Güvenli ve ölçeklenebilir bir API altyapısı tercih edildi.
- **Uygulama (App) Yapısı:** Proje `core` (ana ayarlar) ve `fleet` (iş mantığı) olmak üzere modüler şekilde ayrılmıştır.
- **Veritabanı:** Supabase (PostgreSQL). `dj_database_url` ile connection pooler üzerinden güvenli bağlantı.
- **Güvenlik (Auth):** Django REST Framework'ün `TokenAuthentication` mekanizması kullanılarak stateless ve güvenli bir giriş sistemi kurulmuştur. Vercel (Frontend) ve API arası iletişim için CORS strict politikalara bağlıdır.

### Frontend (React + Vite)
Hızlı geliştirme ve yüksek performanslı render için modern React tercih edildi.
- **State Management & Routing:** Sayfa geçişleri için `react-router-dom` kullanılmış, state'ler lokal seviyede optimize edilmiştir.
- **CSS Stratejisi:** TailwindCSS ile utility-first bir yaklaşım benimsenerek, component tabanlı (Reusable) bir tasarım dili (Design System) oluşturuldu (`PWABanner`, `Sidebar`, `ExcelImportModal` vb.).
- **Axios Interceptor'ları:** Tüm API istekleri merkezi bir `api.js` üzerinden geçer. Token yönetimi ve yetkisiz (401) durumlarda otomatik çıkış (logout) gibi güvenlik önlemleri global olarak interceptor'lar üzerinden yönetilir.

---

## 🚀 Kullanılan Teknolojiler (Tech Stack)

| Kategori | Teknoloji / Kütüphane | Kullanım Amacı |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js (Vite) | Hızlı render, component bazlı UI inşası |
| **Stil / UI** | Tailwind CSS & Lucide Icons | Responsive tasarım, hazır class'lar ve modern ikonlar |
| **Backend API** | Django REST Framework (Python) | Hızlı ve güvenli REST API (JSON) sunumu |
| **Veritabanı** | PostgreSQL (Supabase) | Ölçeklenebilir, bulut tabanlı ilişkisel veri yönetimi |
| **Bildirim / SMS** | Twilio API | Şoför aksiyonlarına bağlı anlık veli SMS gönderimi |
| **Veri Analizi (AI)**| Pandas & OpenPyXL & Gemini | Yüklenen Excel'leri parçalama ve AI ile haritalama |
| **Deployment** | Fly.io (Backend) & Vercel (Frontend)| Dockerized Backend, Global CDN destekli Frontend yayınlama |

---

## 💻 Geliştiriciler İçin Yerel Kurulum (Local Setup)

1. **Repoyu Klonlayın:**
```bash
git clone https://github.com/KULLANICI_ADINIZ/servissync.git
cd servissync
```

2. **Backend'i Başlatın:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
*(Gereksinim: `backend/.env` dosyası içinde DATABASE_URL, TWILIO_*, ve DJANGO_SECRET_KEY tanımlanmalıdır.)*

3. **Frontend'i Başlatın:**
```bash
cd frontend
npm install
npm run dev
```
*(Gereksinim: `frontend/.env.local` içinde `VITE_API_URL=http://localhost:8000/api/fleet` tanımlanmalıdır.)*

---
*ServisSync - Geleceğin Taşımacılık Teknolojisi*

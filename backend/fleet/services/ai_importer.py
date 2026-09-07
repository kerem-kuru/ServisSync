import json
from google import genai
from google.genai import types

def parse_messy_excel_with_ai(raw_rows_data):
    """
    Kullanıcının karmaşık, düzensiz Excel satırlarını 
    standart JSON formatına çeviren AI motoru.
    """
    client = genai.Client()

    prompt = f"""
    Aşağıda bir servis şirketinin karmaşık Excel/liste verisi yer almaktadır.
    Bu veriyi analiz et ve her bir öğrenci için aşağıdaki şemaya uygun JSON formatında çıkar:
    - first_name: string
    - last_name: string
    - parent_name: string (belirtilmemişse boş string)
    - parent_phone: string (sadece rakamlar, 10-11 haneli temiz format, ör: 5554443322. +90 veya 0 varsa düzelt)
    - plate_number: string (servis plakası veya hat adı. Boş bırakılabilir)
    - monthly_fee: number (ücret varsa, yoksa 0. total_agreed_fee olarak algıla ve monthly_fee'ye veya total_agreed_fee anahtarına yaz)
    - total_agreed_fee: number (ücret varsa, yoksa 0)
    - installment_count: number (varsayılan 9)

    Eğer ad ve soyad aynı sütundaysa mantıklı bir şekilde ayır. 
    Telefon numaralarındaki tire, parantez ve boşlukları temizle.
    Eğer geçerli bir öğrenci adı yoksa o satırı atla.
    Sadece ve sadece JSON formatında, bir liste (array) olarak döndür.
    
    Ham Veri:
    {json.dumps(raw_rows_data, ensure_ascii=False)}
    """

    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)

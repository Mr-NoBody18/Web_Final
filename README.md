## Proje Yapısı ve Değişiklikler

### Sunucusuz, JSON Tabanlı Sistem Yapısı

Bu projede, önceden sunucu tabanlı olan bir web sitesinin sunucusuz bir yapıya dönüştürülmesi yapıldı. Veriler artık JSON dosyaları üzerinden yönetiliyor. Bu sayede herhangi bir sunucu olmadan site çalışabilir hale geldi.

### Yeni Dosya Yapısı

- `/data/`: JSON veri dosyaları burada bulunur
  - `users.json`: Kullanıcı verileri
  - `posts.json`: Gönderi/hikaye verileri
  - `comments.json`: Yorum verileri

- `/js/`: JavaScript dosyaları daha düzenli bir yapıya kavuşturuldu
  - `/utils/`: Yardımcı fonksiyonlar
    - `dataUtils.js`: Veri işleme fonksiyonları
    - `pageUtils.js`: Sayfa yükleme, UI güncelleme fonksiyonları
    - `compatUtils.js`: Eski API çağrılarını yeni JSON yapısına yönlendirmek için uyumluluk katmanı
  
  - `/pages/`: Sayfa bazlı JavaScript kodları
    - `index.js`: Ana sayfa için özel kodlar
    - `login.js`: Giriş sayfası için özel kodlar
    - `register.js`: Kayıt sayfası için özel kodlar
    - `post_detail.js`: Gönderi detay sayfası için özel kodlar
  
  - `/components/`: Sayfalarda kullanılan bileşenler için (henüz boş)

### Önemli Değişiklikler

1. **Veri Yönetimi**:
   - Tüm veriler JSON dosyalarında saklanıyor
   - `dataUtils.js` üzerinden merkezi olarak yönetiliyor
   - localStorage, kullanıcı oturumu ve önbellek için kullanılıyor

2. **Kimlik Doğrulama**:
   - Tamamen istemci taraflı yönetiliyor
   - Token ve kullanıcı bilgileri localStorage'da saklanıyor

3. **Sayfa Yapısı**:
   - Tüm sayfalarda ortak başlatma kodu kullanılıyor
   - Header, dinamik olarak yükleniyor

### Kullanım

1. Tüm sayfalar direk tarayıcıda açılabilir
2. Giriş için örnek kullanıcı:
   - Kullanıcı adı: demo_user
   - Şifre: hashed_password_123

### Dikkat Edilmesi Gerekenler

1. Bu yapı sadece demo/prototip amaçlıdır ve gerçek bir uygulamada güvenlik açığı oluşturur.
2. Gerçek bir projede API çağrıları için Firebase, Supabase gibi BaaS (Backend as a Service) platformları kullanılması önerilir.
3. JSON dosyaları üzerinde yapılan değişiklikler kalıcı değildir, tarayıcı yenilendiğinde lokalda yapılan değişiklikler kaybedilecektir.

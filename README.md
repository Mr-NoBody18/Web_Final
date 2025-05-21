# Hikaye Portalı - Statik Sürüm

Bu proje, sunucu ve veritabanı gerektirmeden tamamen tarayıcı üzerinde çalışan bir hikaye portalıdır. Tüm veriler JSON dosyalarında statik olarak saklanır ve kullanıcı etkileşimleri tarayıcının yerel depolama (localStorage) özelliği kullanılarak yönetilir.

## Özellikler

- Hikaye okuma
- Hikaye beğenme ve kaydetme
- Yorum yapma
- Kullanıcı girişi ve kayıt işlemleri (simüle edilmiş)
- Hikayeleri kategorilere göre filtreleme
- Arama ve keşfetme

## Yapı

Proje, veri tabanı ve sunucu olmadan çalışacak şekilde tasarlanmıştır:

- `static_data/`: JSON veri dosyalarının bulunduğu klasör
  - `users.json`: Kullanıcı verileri
  - `stories.json`: Hikaye verileri
  - `comments.json`: Yorum verileri
- `static-data-handler.js`: Veri yönetimi için JavaScript kütüphanesi
- `static_version.html`: Statik sürüm için ana sayfa
- `json_editor.html`: JSON verilerini düzenlemek için arayüz

## Nasıl Kullanılır

1. `static_version.html` dosyasını bir web tarayıcısı ile açın
2. Ana sayfadan istediğiniz bölüme gidin
3. Test için kullanıcı girişi yapabilirsiniz:
   - Kullanıcı adı: admin, şifre: herhangi bir şey
   - Kullanıcı adı: yazar1, şifre: herhangi bir şey
   - Kullanıcı adı: yazar2, şifre: herhangi bir şey

## JSON Verilerini Düzenleme

Verileri güncellemek veya değiştirmek için:

1. `json_editor.html` sayfasını açın
2. Düzenlemek istediğiniz JSON dosyasını seçin
3. Değişikliklerinizi yapın ve kaydedin
4. Değişikliklerin etkili olması için sayfayı yenileyin

## Notlar

- Bu statik sürümde, tüm veri değişiklikleri sadece kullandığınız tarayıcının localStorage'ında saklanır
- Tarayıcı verilerini temizlerseniz, yaptığınız tüm değişiklikler kaybolur
- Bu sürüm sadece yerel kullanım için uygundur, birden fazla kullanıcı arasında veri paylaşımı yoktur

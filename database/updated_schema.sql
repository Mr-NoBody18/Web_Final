-- Güncellenmiş Veritabanı Şeması

-- Veritabanını kullan
USE hikaye_portali;

-- Stories tablosunu güncellemek için ALTER TABLE komutları

-- 1. Hikaye içeriğini daha iyi yapılandırmak için JSON doğrulama ekleyelim
ALTER TABLE stories MODIFY COLUMN content JSON NOT NULL;

-- 2. Hikaye etkileşim metrikleri için yeni alanlar ekleyelim
-- comment_count sütunu zaten mevcut olduğu için eklenmeyecek
ALTER TABLE stories ADD COLUMN share_count INT DEFAULT 0 AFTER like_count;
ALTER TABLE stories ADD COLUMN read_time INT DEFAULT 0 COMMENT 'Tahmini okuma süresi (dakika)' AFTER share_count;

-- 3. Hikaye meta verileri için yeni alanlar ekleyelim
ALTER TABLE stories ADD COLUMN tags VARCHAR(255) DEFAULT NULL COMMENT 'Hikaye etiketleri' AFTER category;
ALTER TABLE stories ADD COLUMN location VARCHAR(255) DEFAULT NULL COMMENT 'Hikayenin geçtiği konum' AFTER tags;
ALTER TABLE stories ADD COLUMN is_featured BOOLEAN DEFAULT FALSE COMMENT 'Öne çıkan hikaye mi?' AFTER location;

-- 4. SEO ve sosyal medya paylaşımları için alanlar ekleyelim
ALTER TABLE stories ADD COLUMN meta_description VARCHAR(255) DEFAULT NULL AFTER image_url;
ALTER TABLE stories ADD COLUMN meta_keywords VARCHAR(255) DEFAULT NULL AFTER meta_description;

-- 5. Hikaye durumu için alan ekleyelim
ALTER TABLE stories ADD COLUMN status ENUM('draft', 'published', 'archived') DEFAULT 'published' AFTER meta_keywords;

-- 6. Hikaye içeriğinin versiyonlanması için yeni bir tablo oluşturalım
CREATE TABLE IF NOT EXISTS story_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  story_id INT NOT NULL,
  version INT NOT NULL,
  content JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Hikaye istatistikleri için yeni bir tablo oluşturalım
CREATE TABLE IF NOT EXISTS story_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  story_id INT NOT NULL,
  view_date DATE NOT NULL,
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  avg_read_time INT DEFAULT 0,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  UNIQUE KEY (story_id, view_date)
);

-- 8. Hikaye etkileşimleri için yeni bir tablo oluşturalım
CREATE TABLE IF NOT EXISTS story_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  story_id INT NOT NULL,
  user_id INT NOT NULL,
  interaction_type ENUM('view', 'like', 'comment', 'share', 'bookmark') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Hikaye içerik yapısı için örnek JSON şeması açıklaması
/*
Hikaye içeriği için JSON yapısı örneği:
{
  "title": "Hikaye Başlığı",
  "summary": "Kısa özet",
  "pages": [
    {
      "page_number": 1,
      "blocks": [
        {
          "type": "text",
          "content": "Metin içeriği",
          "style": {"bold": true, "italic": false}
        },
        {
          "type": "image",
          "url": "resim/yolu.jpg",
          "caption": "Resim açıklaması"
        },
        {
          "type": "info",
          "title": "Bilgi Kutusu",
          "items": [
            {"label": "Tarih", "value": "26 Nisan 1986"}
          ]
        }
      ]
    }
  ],
  "metadata": {
    "created_at": "2025-03-14T12:00:00Z",
    "updated_at": "2025-03-15T14:30:00Z",
    "author": "Yazar Adı",
    "read_time": 5
  }
}
*/
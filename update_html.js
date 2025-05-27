// HTML sayfalarını güncelleme işlemi
const fs = require('fs');
const path = require('path');

// HTML dosyalarını bul
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'));

console.log(`${htmlFiles.length} adet HTML dosyası bulundu. Güncelleniyor...`);

// Her dosyayı güncelle
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Header yükleyici scriptini yeni JS yapısına uygun hale getir
    const headerLoaderRegex = /<script src=".*header-loader\.js"><\/script>/;
    const mobileNavRegex = /<script src=".*mobile-nav\.js"><\/script>/;
    
    // Eski scriptleri tespit et
    const hasHeaderLoader = headerLoaderRegex.test(content);
    const hasMobileNav = mobileNavRegex.test(content);
    
    // Eski scriptleri yeni uyumlu scriptlerle değiştir
    if (hasHeaderLoader || hasMobileNav) {
        content = content.replace(headerLoaderRegex, '')
                         .replace(mobileNavRegex, '');
        
        // Yeni scriptleri ekle (eğer zaten eklenmemişse)
        if (!content.includes('js/utils/dataUtils.js')) {
            const headEndTag = '</head>';
            const newScripts = `    <!-- JS yapısına uyum sağlayan scriptler -->
    <script src="js/utils/dataUtils.js"></script>
    <script src="js/utils/pageUtils.js"></script>
    <script src="js/utils/compatUtils.js"></script>
${headEndTag}`;
            
            content = content.replace(headEndTag, newScripts);
        }
    }
    
    // 2. Header container elementini güncelle
    if (content.includes('id="header-placeholder"')) {
        content = content.replace('id="header-placeholder"', 'id="header-container"');
    }
    
    // 3. Sayfa başlıklarını güncelle
    if (content.includes('HikayePortalı')) {
        content = content.replace(/HikayePortalı/g, 'Trae');
    }
    
    // Dosyayı kaydet
    fs.writeFileSync(file, content, 'utf8');
    console.log(`${file} dosyası güncellendi.`);
});

console.log('Tüm HTML sayfaları başarıyla güncellendi!');

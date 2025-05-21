/**
 * responsive-story.js
 * Hikaye içeriğinin farklı cihazlarda otomatik olarak optimize edilmesini sağlar.
 * Masaüstünde hazırlanan hikayeleri mobil için, mobilde hazırlanan hikayeleri masaüstü için optimize eder.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cihaz tipini belirle
    const deviceType = detectDeviceType();
    const storyContent = document.querySelector('.story-content');
    
    if (!storyContent) return;
    
    // Hikayenin hangi cihazda hazırlandığını kontrol et
    const createdOnDevice = storyContent.dataset.createdOn || 'unknown';
    
    // Hikaye içeriğine cihaz tipini ekle
    storyContent.dataset.currentDevice = deviceType;
    document.body.classList.add(`viewing-on-${deviceType}`);
    
    // Hikaye içeriğini optimize et
    optimizeStoryContent(storyContent, createdOnDevice, deviceType);
    
    // Pencere boyutu değiştiğinde içeriği yeniden optimize et
    window.addEventListener('resize', debounce(function() {
        const newDeviceType = detectDeviceType();
        if (newDeviceType !== deviceType) {
            storyContent.dataset.currentDevice = newDeviceType;
            document.body.classList.remove(`viewing-on-${deviceType}`);
            document.body.classList.add(`viewing-on-${newDeviceType}`);
            optimizeStoryContent(storyContent, createdOnDevice, newDeviceType);
        }
    }, 250));
});

/**
 * Cihaz tipini belirler
 * @returns {string} 'mobile', 'tablet' veya 'desktop'
 */
function detectDeviceType() {
    const width = window.innerWidth;
    if (width <= 480) return 'small-mobile';
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
}

/**
 * Hikaye içeriğini cihaz tipine göre optimize eder
 * @param {HTMLElement} contentElement - Hikaye içeriği elementi
 * @param {string} createdOnDevice - Hikayenin oluşturulduğu cihaz tipi
 * @param {string} currentDevice - Mevcut cihaz tipi
 */
function optimizeStoryContent(contentElement, createdOnDevice, currentDevice) {
    // İçerik elementlerini seç
    const paragraphs = contentElement.querySelectorAll('p');
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const images = contentElement.querySelectorAll('img');
    const blockquotes = contentElement.querySelectorAll('blockquote');
    
    // Masaüstünde hazırlanıp mobilde görüntülenen içerik
    if ((createdOnDevice === 'desktop' || createdOnDevice === 'tablet') && 
        (currentDevice === 'mobile' || currentDevice === 'small-mobile')) {
        
        // Paragrafları optimize et
        paragraphs.forEach(p => {
            p.style.fontSize = currentDevice === 'small-mobile' ? '15px' : '16px';
            p.style.lineHeight = '1.6';
            p.style.textAlign = 'left';
            p.style.marginBottom = '15px';
        });
        
        // Başlıkları optimize et
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            const baseSize = currentDevice === 'small-mobile' ? 20 : 22;
            heading.style.fontSize = `${baseSize - (level - 1) * 2}px`;
            heading.style.marginTop = '25px';
            heading.style.marginBottom = '10px';
        });
        
        // Görselleri optimize et
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
            img.style.display = 'block';
        });
        
        // Alıntıları optimize et
        blockquotes.forEach(quote => {
            quote.style.fontSize = currentDevice === 'small-mobile' ? '14px' : '15px';
            quote.style.padding = '10px 15px';
            quote.style.margin = '15px 0';
        });
    }
    
    // Mobilde hazırlanıp masaüstünde görüntülenen içerik
    else if ((createdOnDevice === 'mobile' || createdOnDevice === 'small-mobile') && 
             (currentDevice === 'desktop' || currentDevice === 'tablet')) {
        
        // Paragrafları optimize et
        paragraphs.forEach(p => {
            p.style.fontSize = currentDevice === 'desktop' ? '18px' : '17px';
            p.style.lineHeight = '1.8';
            p.style.maxWidth = currentDevice === 'desktop' ? '800px' : '100%';
            p.style.marginBottom = '20px';
        });
        
        // Başlıkları optimize et
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            const baseSize = currentDevice === 'desktop' ? 32 : 28;
            heading.style.fontSize = `${baseSize - (level - 1) * 4}px`;
            heading.style.marginTop = '40px';
            heading.style.marginBottom = '20px';
        });
        
        // Görselleri optimize et
        images.forEach(img => {
            // Görsel boyutunu kontrol et
            if (img.naturalWidth < 400) {
                // Küçük görseller için daha iyi görünüm
                img.style.maxWidth = '50%';
                img.style.float = 'left';
                img.style.margin = '5px 20px 20px 0';
            } else {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.margin = '30px 0';
            }
        });
        
        // Alıntıları optimize et
        blockquotes.forEach(quote => {
            quote.style.fontSize = '18px';
            quote.style.padding = '20px 30px';
            quote.style.margin = '30px 0';
            quote.style.borderLeft = '4px solid var(--accent-purple)';
        });
    }
    
    // İçerik yapısını düzenle
    organizeContentStructure(contentElement, currentDevice);
}

/**
 * İçerik yapısını cihaz tipine göre düzenler
 * @param {HTMLElement} contentElement - Hikaye içeriği elementi
 * @param {string} deviceType - Mevcut cihaz tipi
 */
function organizeContentStructure(contentElement, deviceType) {
    // Mobil cihazlarda içerik yapısını düzenle
    if (deviceType === 'mobile' || deviceType === 'small-mobile') {
        // Uzun paragrafları böl
        const paragraphs = contentElement.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (p.textContent.length > 300) {
                // Çok uzun paragrafları böl
                const words = p.textContent.split(' ');
                const midPoint = Math.floor(words.length / 2);
                
                // Cümle sonunda bölmeye çalış
                let breakPoint = midPoint;
                for (let i = midPoint; i < words.length; i++) {
                    if (words[i].endsWith('.') || words[i].endsWith('!') || words[i].endsWith('?')) {
                        breakPoint = i + 1;
                        break;
                    }
                }
                
                // Paragrafı böl
                const firstHalf = words.slice(0, breakPoint).join(' ');
                const secondHalf = words.slice(breakPoint).join(' ');
                
                if (secondHalf.trim().length > 0) {
                    p.textContent = firstHalf;
                    const newP = document.createElement('p');
                    newP.textContent = secondHalf;
                    newP.style.fontSize = p.style.fontSize;
                    newP.style.lineHeight = p.style.lineHeight;
                    p.after(newP);
                }
            }
        });
    }
    
    // Masaüstü cihazlarda içerik yapısını düzenle
    else if (deviceType === 'desktop' || deviceType === 'tablet') {
        // Kısa ve ardışık paragrafları birleştir
        const paragraphs = Array.from(contentElement.querySelectorAll('p'));
        for (let i = 0; i < paragraphs.length - 1; i++) {
            const current = paragraphs[i];
            const next = paragraphs[i + 1];
            
            // Kısa paragrafları birleştir
            if (current.textContent.length < 100 && next.textContent.length < 100) {
                current.textContent += ' ' + next.textContent;
                next.remove();
                // Diziden kaldırılan elemanı çıkar
                paragraphs.splice(i + 1, 1);
                i--; // Dizin güncellendi, bir önceki elemana dön
            }
        }
    }
}

/**
 * Fonksiyon çağrılarını sınırlar (debounce)
 * @param {Function} func - Çağrılacak fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function} Sınırlandırılmış fonksiyon
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
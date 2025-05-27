// Ana sayfa için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlatma fonksiyonu
    initPage('Ana Sayfa', 'Hikayeler ve Paylaşımlar', 'hikaye, keşfet, blog, yazı');
    
    // Hikayeleri JSON veri dosyasından yükle
    DataUtils.loadData('posts').then(data => {
        if (data && data.posts) {
            renderStories(data.posts);
        } else {
            showErrorMessage('Hikayeler yüklenemedi.');
        }
    }).catch(error => {
        console.error('Veri yükleme hatası:', error);
        document.querySelector('.card-grid').innerHTML = `
            <div class="error-message">
                <h2>Hikayeler Yüklenemedi</h2>
                <p>Hikayeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
    });
    
    // Hikayeleri render et
    function renderStories(stories) {
        const cardGrid = document.querySelector('.card-grid');
        if (!cardGrid) return;
        
        // Mevcut içeriği temizle
        cardGrid.innerHTML = '';
        
        if (!stories || stories.length === 0) {
            cardGrid.innerHTML = `
                <div class="no-content">
                    <h2>Henüz Hikaye Yok</h2>
                    <p>Burada gösterilecek hikaye bulunamadı.</p>
                </div>
            `;
            return;
        }
        
        // Her hikaye için kart oluştur
        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Hikayeyi render et
            card.innerHTML = `
                <a href="post_detail.html?id=${story.id}" class="card-link">
                    <div class="card-image">
                        <img src="${story.image || './images/posts/default.svg'}" alt="${story.title}">
                        <div class="card-category">${getCategoryName(story.category)}</div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${story.title}</h3>
                        <div class="card-meta">
                            <span class="card-date">${formatDate(story.created_at)}</span>
                            <span class="card-comments"><i class="far fa-comment"></i> ${story.comment_count || 0}</span>
                        </div>
                    </div>
                </a>
            `;
            
            cardGrid.appendChild(card);
        });
    }
    
    // Kategori adını al
    function getCategoryName(categorySlug) {
        const categoryNames = {
            'genel': 'Genel',
            'yasam': 'Yaşam',
            'teknoloji': 'Teknoloji',
            'spor': 'Spor',
            'sanat': 'Sanat',
            'bilim': 'Bilim',
            'seyahat': 'Seyahat'
        };
        
        return categoryNames[categorySlug] || 'Diğer';
    }
    
    // Tarih formatla
    function formatDate(dateString) {
        return DataUtils.formatDate(dateString);
    }
});

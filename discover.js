document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü için gerekli işlemler
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (mobileMenuButton && navLinks) {
        // Mobil menü için CSS sınıfı ekleyelim
        navLinks.classList.add('nav-links-mobile');
        
        mobileMenuButton.addEventListener('click', function() {
            // Toggle sınıfı ile menüyü açıp kapatalım
            navLinks.classList.toggle('nav-active');
            mobileMenuButton.classList.toggle('menu-active');
            
            // Menü açıkken sayfanın kaydırılmasını engelleyelim
            if (navLinks.classList.contains('nav-active')) {
                body.style.overflow = 'hidden';
                // Menü açık olduğunda butonun içeriğini değiştirelim
                mobileMenuButton.textContent = '✕';
            } else {
                body.style.overflow = '';
                // Menü kapalı olduğunda butonun içeriğini geri alalım
                mobileMenuButton.textContent = '☰';
            }
        });
        
        // Menü linklerine tıklandığında menüyü kapatalım
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('nav-active');
                mobileMenuButton.classList.remove('menu-active');
                body.style.overflow = '';
                mobileMenuButton.textContent = '☰';
            });
        });
    }
    
    // Filtreleme işlevselliği
    const filterButtons = document.querySelectorAll('.filter-button');
    const sortButtons = document.querySelectorAll('.sort-button');
    const cardGrid = document.querySelector('.card-grid');
    
    // Arama işlevselliği
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // Aktif filtre ve sıralama
    let activeFilter = 'all';
    let activeSort = 'popular';
    let stories = [];
    
    // Hikayeleri getir
    fetchStories();
    
    // Filtre butonları için olay dinleyicileri
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Aktif sınıfını kaldır
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Bu butona aktif sınıfını ekle
            this.classList.add('active');
            
            // Aktif filtreyi güncelle
            activeFilter = this.dataset.category;
            
            // İçeriği filtrele
            filterContent();
        });
    });
    
    // Sıralama butonları için olay dinleyicileri
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Aktif sınıfını kaldır
            sortButtons.forEach(btn => btn.classList.remove('active'));
            
            // Bu butona aktif sınıfını ekle
            this.classList.add('active');
            
            // Aktif sıralamayı güncelle
            activeSort = this.dataset.sort;
            
            // İçeriği sırala
            sortContent();
        });
    });
    
    // Arama işlevselliği
    searchButton.addEventListener('click', function() {
        searchContent();
    });
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchContent();
        }
    });
    
    // Hikayeleri getir (önce localStorage'dan, yoksa API'den)
    function fetchStories() {
        // Yükleniyor göstergesi
        cardGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Hikayeler yükleniyor...</p></div>';
        
        // Önce localStorage'dan hikayeleri kontrol et
        const cachedStories = localStorage.getItem('discoverPageStories');
        
        if (cachedStories) {
            try {
                stories = JSON.parse(cachedStories);
                renderStories();
                
                // Arka planda API'den güncel hikayeleri getir
                refreshStoriesFromAPI();
            } catch (error) {
                console.error('Önbellek hikayeleri ayrıştırma hatası:', error);
                fetchStoriesFromAPI();
            }
        } else {
            fetchStoriesFromAPI();
        }
    }
    
    // API'den hikayeleri getir
    function fetchStoriesFromAPI() {
        fetch('/api/stories?limit=20')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikayeler yüklenemedi');
                }
                return response.json();
            })
            .then(data => {
                stories = data;
                // Hikayeleri localStorage'a kaydet
                localStorage.setItem('discoverPageStories', JSON.stringify(stories));
                renderStories();
            })
            .catch(error => {
                console.error('Hikaye yükleme hatası:', error);
                cardGrid.innerHTML = `
                    <div class="error-message">
                        <h2>Hikayeler Yüklenemedi</h2>
                        <p>Hikayeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
            });
    }
    
    // Arka planda API'den güncel hikayeleri getir
    function refreshStoriesFromAPI() {
        fetch('/api/stories?limit=20')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikayeler yüklenemedi');
                }
                return response.json();
            })
            .then(data => {
                stories = data;
                // Hikayeleri localStorage'a kaydet
                localStorage.setItem('discoverPageStories', JSON.stringify(stories));
                // Sayfayı yeniden render et
                renderStories();
            })
            .catch(error => {
                console.error('Hikaye güncelleme hatası:', error);
            });
    }
    
    // Hikayeleri render et
    function renderStories() {
        if (stories.length === 0) {
            cardGrid.innerHTML = '<div class="no-content"><p>Henüz hikaye bulunmuyor.</p></div>';
            return;
        }
        
        cardGrid.innerHTML = '';
        
        // Filtrelenmiş ve sıralanmış hikayeleri göster
        const filteredStories = stories.filter(story => {
            return activeFilter === 'all' || story.category === activeFilter;
        });
        
        // Hikayeleri sırala
        filteredStories.sort((a, b) => {
            if (activeSort === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (activeSort === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (activeSort === 'popular') {
                return b.view_count - a.view_count || b.like_count - a.like_count;
            }
            return 0;
        });
        
        // Hikayeleri DOM'a ekle
        filteredStories.forEach(story => {
            const storyCard = createStoryCard(story);
            cardGrid.appendChild(storyCard);
        });
    }
    
    // Hikaye kartı oluştur
    function createStoryCard(story) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.dataset.category = story.category;
        
        // Hikaye içeriğini parse et
        let contentData;
        try {
            contentData = JSON.parse(story.content);
        } catch (error) {
            console.error('İçerik ayrıştırma hatası:', error);
            contentData = { pages: [] };
        }
        
        // Hikaye kartı HTML'ini oluştur
        card.innerHTML = `
            <img src="${story.image_url || 'https://via.placeholder.com/800x400?text=Hikaye+Görseli'}" alt="${story.title}" class="card-image">
            <div class="card-content">
                <div class="card-category category-${story.category}">${getCategoryName(story.category)}</div>
                <h3 class="card-title">${story.title}</h3>
                <p class="card-description">${getStoryDescription(contentData)}</p>
                
                <div class="card-meta">
                    <div class="card-date">${formatDate(story.created_at)}</div>
                    <div class="card-stats">
                        <span>👁️ ${story.view_count}</span>
                        <span>❤️ ${story.like_count}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Hikaye detay sayfasına yönlendirme
        card.addEventListener('click', function() {
            window.location.href = `/story.html?id=${story.id}`;
        });
        
        return card;
    }
    
    // İçeriği filtrele
    function filterContent() {
        renderStories();
    }
    
    // İçeriği sırala
    function sortContent() {
        renderStories();
    }
    
    // İçerikte arama yap
    function searchContent() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Arama terimi boşsa, sadece filtreleme uygula
            renderStories();
            return;
        }
        
        // Arama sonuçlarını filtrele
        const filteredStories = stories.filter(story => {
            const title = story.title.toLowerCase();
            const category = getCategoryName(story.category).toLowerCase();
            
            return (title.includes(searchTerm) || category.includes(searchTerm)) && 
                   (activeFilter === 'all' || story.category === activeFilter);
        });
        
        // Sonuçları göster
        if (filteredStories.length === 0) {
            cardGrid.innerHTML = '<div class="no-content"><p>Arama sonucu bulunamadı.</p></div>';
            return;
        }
        
        cardGrid.innerHTML = '';
        
        // Sonuçları sırala
        filteredStories.sort((a, b) => {
            if (activeSort === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (activeSort === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (activeSort === 'popular') {
                return b.view_count - a.view_count || b.like_count - a.like_count;
            }
            return 0;
        });
        
        // Sonuçları DOM'a ekle
        filteredStories.forEach(story => {
            const storyCard = createStoryCard(story);
            cardGrid.appendChild(storyCard);
        });
    }
    
    // Hikaye açıklaması oluştur
    function getStoryDescription(contentData) {
        if (!contentData.pages || contentData.pages.length === 0) {
            return 'Bu hikaye için açıklama bulunmuyor.';
        }
        
        // İlk sayfadaki ilk metin bloğunu bul
        const firstPage = contentData.pages[0];
        const textBlocks = firstPage.blocks.filter(block => block.type === 'text');
        
        if (textBlocks.length === 0) {
            return 'Bu hikaye için açıklama bulunmuyor.';
        }
        
        // İlk metin bloğunun içeriğini al ve HTML etiketlerini temizle
        const textContent = textBlocks[0].content.replace(/<[^>]*>/g, '');
        
        // Metni kısalt
        return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
    }
    
    // Tarih formatla
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('tr-TR', options);
    }
    
    // Kategori adını getir
    function getCategoryName(category) {
        const categoryNames = {
            'disasters': 'Felaketler',
            'cars': 'Arabalar',
            'historic': 'Tarihi Mekanlar',
            'creepy': 'Creepy Hikayeler',
            'science': 'Bilim',
            'tech': 'Teknoloji'
        };
        
        return categoryNames[category] || category;
    }
    
    // Kartlar için hover efektleri ve tıklama olayları
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            // Hikaye detay sayfasına yönlendirme
            window.location.href = 'story.html';
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = `0 15px 30px rgba(0, 0, 0, 0.4)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = `0 10px 20px rgba(0, 0, 0, 0.3)`;
        });
    });
    
    // Arama çubuğu işlevselliği için ek işlevsellik
    if (searchInput && searchButton) {
        // Arama kutusuna odaklandığında stil değişikliği
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 10px rgba(255, 77, 77, 0.3)';
        });
        
        // Arama kutusundan çıkıldığında stil değişikliği
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
        
        // Arama fonksiyonu
        const performSearch = function() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                // Arama terimi boşsa tüm kartları göster
                contentCards.forEach(card => {
                    card.style.display = 'block';
                });
                return;
            }
            
            // Arama sonuçlarını sayacak değişken
            let resultsFound = 0;
            
            // Kartları filtrele
            contentCards.forEach(card => {
                const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
                const cardDescription = card.querySelector('.card-description').textContent.toLowerCase();
                const cardCategory = card.querySelector('.card-category').textContent.toLowerCase();
                
                // Başlık, açıklama veya kategoride arama terimini içeriyorsa göster
                if (cardTitle.includes(searchTerm) || 
                    cardDescription.includes(searchTerm) || 
                    cardCategory.includes(searchTerm)) {
                    card.style.display = 'block';
                    resultsFound++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Arama sonuçlarını göster
            if (resultsFound === 0) {
                // Sonuç bulunamadıysa kullanıcıya bildir
                alert('Aramanızla eşleşen hikaye bulunamadı.');
            }
        };
        
        // Enter tuşuna basıldığında arama yap
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Arama butonuna tıklandığında arama yap
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
});
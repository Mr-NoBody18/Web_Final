document.addEventListener('DOMContentLoaded', function() {
    // Tarih seçici için gerekli değişkenler
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    const searchDateButton = document.getElementById('search-date-button');
    const selectedDateDisplay = document.getElementById('selected-date');
    const historyEventsContainer = document.getElementById('history-events-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const randomEventsSection = document.querySelector('.random-events-section .card-grid');
    
    // Bugünün tarihini al
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript'te aylar 0'dan başlar
    const currentDay = today.getDate();
    
    // Ay seçimini bugünkü aya ayarla
    monthSelect.value = currentMonth;
    
    // Günleri doldur ve bugünkü günü seç
    populateDays(currentMonth);
    daySelect.value = currentDay;
    
    // Sayfa yüklendiğinde bugünkü tarihe ait olayları göster
    fetchHistoricalEvents(currentMonth, currentDay);
    fetchRandomHistoricalEvents();
    
    // Ay değiştiğinde günleri güncelle
    monthSelect.addEventListener('change', function() {
        const selectedMonth = parseInt(this.value);
        populateDays(selectedMonth);
    });
    
    // Tarih ara butonuna tıklandığında
    searchDateButton.addEventListener('click', function() {
        const selectedMonth = parseInt(monthSelect.value);
        const selectedDay = parseInt(daySelect.value);
        showHistoricalEvents(selectedMonth, selectedDay);
    });
    
    // Seçilen aya göre günleri doldur
    function populateDays(month) {
        // Günleri temizle
        daySelect.innerHTML = '';
        
        // Seçilen ayın gün sayısını hesapla
        let daysInMonth;
        
        // Eğer ay değeri geçerli değilse, bugünkü ayı kullan
        if (isNaN(month) || month < 1 || month > 12) {
            month = new Date().getMonth() + 1;
        }
        
        // Gün seçimini etkinleştir
        daySelect.disabled = false;
        
        // Ayın son gününü hesapla
        const year = today.getFullYear();
        daysInMonth = new Date(year, month, 0).getDate();
        
        // Günleri ekle
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            
            // Bugünkü tarih ise seçili yap
            if (month === currentMonth && i === currentDay) {
                option.selected = true;
            }
            
            daySelect.appendChild(option);
        }
    }
    
    // Tarihte bugün olaylarını getir
    function fetchHistoricalEvents(month, day) {
        // Yükleniyor göstergesini göster
        historyEventsContainer.innerHTML = '';
        loadingSpinner.style.display = 'flex';
        
        // Önce localStorage'dan hikayeleri kontrol et
        const cachedStories = localStorage.getItem('todayPageStories');
        
        if (cachedStories) {
            try {
                const stories = JSON.parse(cachedStories);
                displayHistoricalEvents(stories);
                
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
        fetch(`/api/stories?limit=5&sort=newest`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikayeler yüklenemedi');
                }
                return response.json();
            })
            .then(stories => {
                // Hikayeleri localStorage'a kaydet
                localStorage.setItem('todayPageStories', JSON.stringify(stories));
                displayHistoricalEvents(stories);
            })
            .catch(error => {
                console.error('Hikaye yükleme hatası:', error);
                loadingSpinner.style.display = 'none';
                historyEventsContainer.innerHTML = `
                    <div class="error-message">
                        <h2>Hikayeler Yüklenemedi</h2>
                        <p>Hikayeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
            });
    }
    
    // Arka planda API'den güncel hikayeleri getir
    function refreshStoriesFromAPI() {
        fetch(`/api/stories?limit=5&sort=newest`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikayeler yüklenemedi');
                }
                return response.json();
            })
            .then(stories => {
                // Hikayeleri localStorage'a kaydet
                localStorage.setItem('todayPageStories', JSON.stringify(stories));
            })
            .catch(error => {
                console.error('Hikaye güncelleme hatası:', error);
            });
    }
    
    // Hikayeleri görüntüle
    function displayHistoricalEvents(stories) {
        // Yükleniyor göstergesini gizle
        loadingSpinner.style.display = 'none';
        
        // Hikayeleri DOM'a ekle
        if (stories.length === 0) {
            historyEventsContainer.innerHTML = '<p class="no-events">Bu tarihte kayıtlı hikaye bulunamadı.</p>';
        } else {
                    // Örnek tarihsel olaylar (gerçek uygulamada API'den gelecek)
                    const events = [
                        {
                            year: 1986,
                            title: 'Avrupa Para Birimi (ECU) Avrupa Topluluğu\'nun resmi para birimi olarak onaylandı.',
                            category: 'Ekonomi',
                            description: 'Avrupa Para Birimi (European Currency Unit - ECU), Avrupa Topluluğu tarafından 1979 yılında oluşturulmuş ve 1999 yılında Euro\'nun kullanıma girmesiyle yerini Euro\'ya bırakmış bir para birimidir.'
                        },
                        {
                            year: 1879,
                            title: 'Albert Einstein doğdu.',
                            category: 'Bilim',
                            description: 'Albert Einstein, görelilik kuramının yaratıcısı, fizikçi ve bilim insanı. Modern fiziğin en büyük isimlerinden biri olarak kabul edilir.'
                        },
                        {
                            year: 1964,
                            title: 'İlk Ford Mustang üretim bandından çıktı.',
                            category: 'Otomotiv',
                            description: 'Ford Mustang, Ford Motor Company tarafından 1964 yılından beri üretilen efsanevi Amerikan spor otomobilidir.'
                        }
                    ];
                    
                    // Önce tarihsel olayları ekle
                    events.forEach(event => {
                        const eventElement = document.createElement('div');
                        eventElement.className = 'history-event-item';
                        
                        eventElement.innerHTML = `
                            <div class="event-year">${event.year}</div>
                            <div class="event-content">
                                <div class="event-category">${event.category}</div>
                                <h3 class="event-title">${event.title}</h3>
                                <p class="event-description">${event.description}</p>
                            </div>
                        `;
                        
                        historyEventsContainer.appendChild(eventElement);
                        
                        // Animasyon efekti
                        setTimeout(() => {
                            eventElement.classList.add('visible');
                        }, 100);
                    });
                    
                    // Sonra kullanıcı hikayelerini ekle
                    stories.forEach(story => {
                        // Hikaye içeriğini parse et
                        let contentData;
                        try {
                            contentData = JSON.parse(story.content);
                        } catch (error) {
                            console.error('İçerik ayrıştırma hatası:', error);
                            contentData = { pages: [] };
                        }
                        
                        const eventElement = document.createElement('div');
                        eventElement.className = 'history-event-item user-story';
                        
                        eventElement.innerHTML = `
                            <div class="event-year">${new Date(story.created_at).getFullYear()}</div>
                            <div class="event-content">
                                <div class="event-category">${getCategoryName(story.category)}</div>
                                <h3 class="event-title">${story.title}</h3>
                                <p class="event-description">${getStoryDescription(contentData)}</p>
                                <div class="event-author">Yazar: ${story.real_name}</div>
                                <a href="/story.html?id=${story.id}" class="event-link">Hikayeyi Oku</a>
                            </div>
                        `;
                        
                        historyEventsContainer.appendChild(eventElement);
                        
                        // Animasyon efekti
                        setTimeout(() => {
                            eventElement.classList.add('visible');
                        }, 100);
                    });
                }
            })
            .catch(error => {
                console.error('Hikaye yükleme hatası:', error);
                loadingSpinner.style.display = 'none';
                historyEventsContainer.innerHTML = `
                    <div class="error-message">
                        <h2>Hikayeler Yüklenemedi</h2>
                        <p>Hikayeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
            });
    }
    
    // Rastgele tarihsel olayları getir
    function fetchRandomHistoricalEvents() {
        const cardGrid = document.querySelector('.random-events-section .card-grid');
        
        // Yükleniyor göstergesi
        cardGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Hikayeler yükleniyor...</p></div>';
        
        // API'den hikayeleri getir
        fetch('/api/stories?limit=3&sort=popular')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikayeler yüklenemedi');
                }
                return response.json();
            })
            .then(stories => {
                cardGrid.innerHTML = '';
                
                if (stories.length === 0) {
                    cardGrid.innerHTML = '<div class="no-content"><p>Henüz hikaye bulunmuyor.</p></div>';
                    return;
                }
                
                // Hikayeleri DOM'a ekle
                stories.forEach(story => {
                    const storyCard = createStoryCard(story);
                    cardGrid.appendChild(storyCard);
                });
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
    
    // Rastgele tarihsel olayları yükle
    function loadRandomEvents() {
        // Tüm olaylardan rastgele 3 tanesini seç
        const allEvents = getAllHistoricalEvents();
        const randomEvents = getRandomItems(allEvents, 3);
        
        // Rastgele olayları göster
        randomEvents.forEach(event => {
            const eventCard = createContentCard(event);
            cardGrid.appendChild(eventCard);
        });
    }
    
    // Tarihsel olay kartı oluştur
    function createEventCard(event) {
        const eventCard = document.createElement('div');
        eventCard.className = 'history-event-card';
        
        eventCard.innerHTML = `
            <div class="event-year">${event.year}</div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-image" onerror="handleImageError(this)">` : `<img src="${defaultImage}" alt="Default Image" class="event-image">`}
            </div>
        `;
        
        return eventCard;
    }
    
    // İçerik kartı oluştur (rastgele olaylar için)
    function handleImageError(img) {
        img.onerror = null; // Prevent infinite loop
        img.src = defaultImage;
    }

    function createContentCard(event) {
        const card = document.createElement('div');
        card.className = 'content-card';
        
        card.innerHTML = `
            ${event.image ? `<img src="${event.image}" alt="${event.title}" class="card-image" onerror="handleImageError(this)">` : `<img src="${defaultImage}" alt="Default Image" class="card-image">`}
            <div class="card-content">
                <div class="card-category category-historic">Tarihsel Olay</div>
                <h3 class="card-title">${event.title}</h3>
                <p class="card-description">${event.description}</p>
                
                <div class="info-box">
                    <h4 class="info-title">Olay Bilgileri</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tarih: </span>
                            <span class="info-value">${event.day} ${getMonthName(event.month)} ${event.year}</span>
                        </div>
                        ${event.location ? `
                        <div class="info-item">
                            <span class="info-label">Konum: </span>
                            <span class="info-value">${event.location}</span>
                        </div>` : ''}
                    </div>
                </div>
                
                <div class="card-meta">
                    <div class="card-date">Tarihte Bugün</div>
                    <div class="card-stats">
                        <span>👁️ ${Math.floor(Math.random() * 10000)}+</span>
                        <span>💬 ${Math.floor(Math.random() * 200)}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Kart tıklama olayı
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            alert(`"${event.title}" detayları yakında eklenecek!`);
        });
        
        return card;
    }
    
    // Ay adını döndür
    function getMonthName(month) {
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return monthNames[month - 1];
    }
    
    // Diziden rastgele öğeler seç
    function getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    // Tarihsel olayları getir
    function getHistoricalEvents(month, day) {
        const allEvents = getAllHistoricalEvents();
        return allEvents.filter(event => event.month === month && event.day === day);
    }
    
    // Tüm tarihsel olaylar
    function getAllHistoricalEvents() {
        const defaultImage = 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
        return [
            {
                year: 1879,
                month: 3,
                day: 14,
                title: "Albert Einstein'ın Doğumu",
                description: "Fizik alanında devrim yaratan ve görelilik teorisini geliştiren Albert Einstein dünyaya geldi.",
                location: "Ulm, Almanya",
                image: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                year: 1883,
                month: 3,
                day: 14,
                title: "Karl Marx'ın Ölümü",
                description: "Komünizm teorisinin kurucusu ve 'Das Kapital' kitabının yazarı Karl Marx hayatını kaybetti.",
                location: "Londra, İngiltere",
                image: defaultImage
            },
            {
                year: 1900,
                month: 3,
                day: 14,
                title: "ABD'de Altın Standardı Yasası",
                description: "ABD Başkanı William McKinley, doları altına sabitleyen Altın Standardı Yasası'nı imzaladı.",
                location: "Washington D.C., ABD",
                image: defaultImage
            },
            {
                year: 1951,
                month: 4,
                day: 11,
                title: "Truman, MacArthur'u Görevden Aldı",
                description: "ABD Başkanı Harry Truman, Kore Savaşı sırasında General Douglas MacArthur'u görevden aldı.",
                location: "Washington D.C., ABD",
                image: "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                year: 1970,
                month: 4,
                day: 11,
                title: "Apollo 13 Fırlatıldı",
                description: "NASA'nın Apollo 13 uzay aracı, daha sonra 'Houston, we have a problem' sözüyle ünlenen görev için fırlatıldı.",
                location: "Cape Canaveral, Florida, ABD",
                image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                year: 1979,
                month: 5,
                day: 4,
                title: "Margaret Thatcher Başbakan Oldu",
                description: "Margaret Thatcher, Birleşik Krallık'ın ilk kadın başbakanı olarak göreve başladı.",
                location: "Londra, İngiltere",
                image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            {
                year: 1986,
                month: 3,
                day: 14,
                title: "Avrupa Para Birimi (ECU)",
                description: "Avrupa Topluluğu'nun resmi para birimi olarak onaylandı.",
                location: "Avrupa",
                image: "https://images.unsplash.com/photo-1519458246479-6acae7536988?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            },
            // Diğer olaylar...
        ];
    }
});
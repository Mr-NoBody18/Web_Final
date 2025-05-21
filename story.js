document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü için gerekli işlemler
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            
            if (navLinks.style.display === 'flex') {
                navLinks.style.position = 'absolute';
                navLinks.style.top = '60px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.flexDirection = 'column';
                navLinks.style.backgroundColor = 'var(--glass-bg)';
                navLinks.style.backdropFilter = 'blur(10px)';
                navLinks.style.padding = '20px';
                navLinks.style.zIndex = '99';
                navLinks.style.borderBottom = '1px solid var(--glass-border)';
            } else {
                navLinks.style.position = '';
                navLinks.style.top = '';
                navLinks.style.left = '';
                navLinks.style.width = '';
                navLinks.style.flexDirection = '';
                navLinks.style.backgroundColor = '';
                navLinks.style.backdropFilter = '';
                navLinks.style.padding = '';
                navLinks.style.zIndex = '';
                navLinks.style.borderBottom = '';
            }
        });
    }
    
    // URL'den hikaye ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('id');
    
    if (storyId) {
        // Hikaye detaylarını getir
        fetch(`/api/stories/${storyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hikaye bulunamadı');
                }
                return response.json();
            })
            .then(story => {
                displayStory(story);
            })
            .catch(error => {
                console.error('Hikaye yükleme hatası:', error);
                document.querySelector('.story-container').innerHTML = `
                    <div class="error-message">
                        <h2>Hikaye Bulunamadı</h2>
                        <p>İstediğiniz hikaye bulunamadı veya bir hata oluştu.</p>
                        <a href="/index.html" class="btn">Ana Sayfaya Dön</a>
                    </div>
                `;
            });
    } else {
        // ID yoksa hata mesajı göster
        document.querySelector('.story-container').innerHTML = `
            <div class="error-message">
                <h2>Hikaye Bulunamadı</h2>
                <p>Geçerli bir hikaye ID'si belirtilmedi.</p>
                <a href="/index.html" class="btn">Ana Sayfaya Dön</a>
            </div>
        `;
    }
    
    // Hikaye içeriğini görüntüle
    function displayStory(story) {
        // Hikaye başlığı ve meta bilgileri
        document.title = `HikayePortalı - ${story.title}`;
        
        // Kategori
        const categoryElement = document.getElementById('story-category');
        if (categoryElement) {
            categoryElement.textContent = getCategoryName(story.category);
            categoryElement.className = `story-category category-${story.category}`;
        }
        
        // Başlık
        const titleElement = document.getElementById('story-title');
        if (titleElement) {
            titleElement.textContent = story.title;
        }
        
        // Yazar bilgileri
        const authorAvatarElement = document.getElementById('author-avatar');
        if (authorAvatarElement && story.profile_image) {
            authorAvatarElement.style.backgroundImage = `url('${story.profile_image}')`;
        }
        
        const authorNameElement = document.getElementById('author-name');
        if (authorNameElement) {
            authorNameElement.textContent = story.real_name || story.username;
        }
        
        const storyDateElement = document.getElementById('story-date');
        if (storyDateElement) {
            storyDateElement.textContent = formatDate(story.created_at);
        }
        
        // İstatistikler
        const viewCountElement = document.getElementById('view-count');
        if (viewCountElement) {
            viewCountElement.textContent = `👁️ ${story.views || 0} Görüntülenme`;
        }
        
        const commentCountElement = document.getElementById('comment-count');
        if (commentCountElement) {
            commentCountElement.textContent = `💬 ${story.comment_count || 0} Yorum`;
        }
        
        // Kapak görseli
        const storyImageElement = document.getElementById('story-image');
        if (storyImageElement && story.image_url) {
            storyImageElement.src = story.image_url;
            storyImageElement.alt = story.title;
        } else if (storyImageElement) {
            storyImageElement.style.display = 'none';
        }
        
        // Hikaye içeriğini yükle
        loadStoryContent(story.content);
        
        // Etiketler
        const tagsContainer = document.getElementById('story-tags');
        if (tagsContainer && story.tags && story.tags.length > 0) {
            tagsContainer.innerHTML = '';
            story.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'story-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        } else if (tagsContainer) {
            tagsContainer.style.display = 'none';
        }
        
        // Benzer hikayeleri yükle
        loadRelatedStories(story.category, story.id);
        
        // Yorumları yükle
        loadComments(story.id);
    }
    
    // Hikaye içeriğini yükle ve görüntüle
    function loadStoryContent(contentJson) {
        try {
            // JSON içeriğini parse et
            const content = typeof contentJson === 'string' ? JSON.parse(contentJson) : contentJson;
            const storyContentElement = document.getElementById('story-content');
            
            if (!storyContentElement || !content || !content.pages) {
                console.error('Hikaye içeriği yüklenemedi');
                return;
            }
            
            // Tüm sayfaları temizle
            storyContentElement.innerHTML = '';
            
            // Her sayfayı işle
            content.pages.forEach((page, pageIndex) => {
                // Sayfa elementi oluştur
                const pageElement = document.createElement('div');
                pageElement.className = 'editor-page';
                pageElement.dataset.page = pageIndex + 1;
                pageElement.style.backgroundColor = page.backgroundColor || '#ffffff';
                pageElement.style.display = pageIndex === 0 ? 'block' : 'none';
                
                // Sayfadaki blokları işle
                if (page.blocks && Array.isArray(page.blocks)) {
                    page.blocks.forEach(block => {
                        // Blok elementi oluştur
                        const blockElement = document.createElement('div');
                        blockElement.className = `editor-block ${block.type}-block`;
                        blockElement.id = block.id || `block-${Math.random().toString(36).substr(2, 9)}`;
                        blockElement.dataset.type = block.type;
                        
                        // Blok pozisyonu ve stilini ayarla
                        if (block.position) {
                            blockElement.style.left = `${block.position.x}px`;
                            blockElement.style.top = `${block.position.y}px`;
                            blockElement.style.width = `${block.position.width}px`;
                            blockElement.style.height = `${block.position.height}px`;
                        }
                        
                        // Blok tipine göre içerik oluştur
                        if (block.type === 'text') {
                            const content = document.createElement('div');
                            content.className = 'text-block-content';
                            content.innerHTML = block.content || '';
                            
                            // Metin stillerini uygula
                            if (block.style) {
                                for (const [key, value] of Object.entries(block.style)) {
                                    if (value) content.style[key] = value;
                                }
                            }
                            
                            blockElement.appendChild(content);
                        } else if (block.type === 'image') {
                            const img = document.createElement('img');
                            img.src = block.content || '';
                            img.alt = block.alt || 'Hikaye görseli';
                            
                            // Görsel stillerini uygula
                            if (block.style && block.style.objectFit) {
                                img.style.objectFit = block.style.objectFit;
                            }
                            
                            blockElement.appendChild(img);
                        }
                        
                        // Sayfaya ekle
                        pageElement.appendChild(blockElement);
                    });
                }
                
                // Hikaye içeriğine ekle
                storyContentElement.appendChild(pageElement);
            });
            
            // Sayfa sayısı birden fazlaysa sayfa geçiş butonlarını göster
            if (content.pages.length > 1) {
                createPageNavigation(content.pages.length);
            }
            
        } catch (error) {
            console.error('Hikaye içeriği işlenirken hata oluştu:', error);
            const storyContentElement = document.getElementById('story-content');
            if (storyContentElement) {
                storyContentElement.innerHTML = `
                    <div class="error-message">
                        <h2>Hikaye İçeriği Yüklenemedi</h2>
                        <p>Hikaye içeriği işlenirken bir hata oluştu.</p>
                    </div>
                `;
            }
        }
    }
    
    // Sayfa geçiş butonlarını oluştur
    function createPageNavigation(pageCount) {
        const storyContentElement = document.getElementById('story-content');
        if (!storyContentElement) return;
        
        // Sayfa geçiş butonları konteyneri
        const navContainer = document.createElement('div');
        navContainer.className = 'story-page-navigation';
        
        // Önceki sayfa butonu
        const prevButton = document.createElement('button');
        prevButton.className = 'page-nav-button prev-page';
        prevButton.innerHTML = '&larr; Önceki Sayfa';
        prevButton.disabled = true;
        
        // Sonraki sayfa butonu
        const nextButton = document.createElement('button');
        nextButton.className = 'page-nav-button next-page';
        nextButton.innerHTML = 'Sonraki Sayfa &rarr;';
        
        // Sayfa göstergesi
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'page-indicator';
        pageIndicator.textContent = `Sayfa 1 / ${pageCount}`;
        
        // Butonları konteyner'a ekle
        navContainer.appendChild(prevButton);
        navContainer.appendChild(pageIndicator);
        navContainer.appendChild(nextButton);
        
        // Konteyneri hikaye içeriğinin sonuna ekle
        storyContentElement.parentNode.appendChild(navContainer);
        
        // Mevcut sayfa
        let currentPage = 1;
        
        // Sayfa geçiş olayları
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                switchPage(--currentPage);
                updatePageNavigation();
            }
        });
        
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                switchPage(++currentPage);
                updatePageNavigation();
            }
        });
        
        // Sayfa geçiş butonlarını güncelle
        function updatePageNavigation() {
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === pageCount;
            pageIndicator.textContent = `Sayfa ${currentPage} / ${pageCount}`;
        }
        
        // Sayfa değiştirme fonksiyonu
        function switchPage(pageNumber) {
            const pages = document.querySelectorAll('.editor-page');
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            const selectedPage = document.querySelector(`.editor-page[data-page="${pageNumber}"]`);
            if (selectedPage) {
                selectedPage.style.display = 'block';
            }
        }
    }
    
    // Benzer hikayeleri yükle
    function loadRelatedStories(category, currentStoryId) {
        fetch(`/api/stories?category=${category}&limit=3`)
            .then(response => response.json())
            .then(stories => {
                // Mevcut hikayeyi filtrele
                const relatedStories = stories.filter(story => story.id !== currentStoryId);
                
                // Benzer hikayeleri göster
                const relatedStoriesContainer = document.getElementById('related-stories-container');
                if (relatedStoriesContainer && relatedStories.length > 0) {
                    relatedStoriesContainer.innerHTML = '';
                    
                    relatedStories.forEach(story => {
                        relatedStoriesContainer.innerHTML += `
                            <div class="content-card">
                                <img src="${story.image_url || 'https://via.placeholder.com/400x320'}" alt="${story.title}" class="card-image">
                                <div class="card-content">
                                    <div class="card-category category-${story.category}">${getCategoryName(story.category)}</div>
                                    <h3 class="card-title">${story.title}</h3>
                                    <p class="card-description">${story.description || 'Hikaye açıklaması bulunmuyor.'}</p>
                                    
                                    <div class="card-meta">
                                        <div class="card-date">${formatDate(story.created_at)}</div>
                                        <div class="card-stats">
                                            <span>👁️ ${story.views || 0}</span>
                                            <span>💬 ${story.comment_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else if (relatedStoriesContainer) {
                    relatedStoriesContainer.innerHTML = '<p>Benzer hikaye bulunamadı.</p>';
                }
            })
            .catch(error => {
                console.error('Benzer hikayeler yüklenirken hata oluştu:', error);
                const relatedStoriesContainer = document.getElementById('related-stories-container');
                if (relatedStoriesContainer) {
                    relatedStoriesContainer.innerHTML = '<p>Benzer hikayeler yüklenemedi.</p>';
                }
            });
    }
    
    // Yorumları yükle
    function loadComments(storyId) {
        fetch(`/api/stories/${storyId}/comments`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Yorumlar yüklenemedi');
                }
                return response.json();
            })
            .then(comments => {
                const commentListElement = document.getElementById('comment-list');
                const commentsCountElement = document.getElementById('comments-count');
                
                if (commentsCountElement) {
                    commentsCountElement.textContent = comments.length;
                }
                
                if (commentListElement) {
                    if (comments.length > 0) {
                        commentListElement.innerHTML = '';
                        
                        comments.forEach(comment => {
                            commentListElement.innerHTML += `
                                <div class="comment-item">
                                    <div class="comment-header">
                                        <div class="comment-author">
                                            <div class="comment-avatar" ${comment.profile_image ? `style="background-image: url('${comment.profile_image}')"` : ''}></div>
                                            <span class="comment-name">${comment.real_name || comment.username}</span>
                                        </div>
                                        <div class="comment-date">${formatDate(comment.created_at)}</div>
                                    </div>
                                    <div class="comment-text">${comment.content}</div>
                                </div>
                            `;
                        });
                    } else {
                        commentListElement.innerHTML = '<p>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>';
                    }
                }
                
                // Yorum formunu ayarla
                setupCommentForm(storyId);
            })
            .catch(error => {
                console.error('Yorumlar yüklenirken hata oluştu:', error);
                const commentListElement = document.getElementById('comment-list');
                if (commentListElement) {
                    commentListElement.innerHTML = '<p>Yorumlar yüklenemedi.</p>';
                }
            });
    }
    
    // Yorum formunu ayarla
    function setupCommentForm(storyId) {
        const commentForm = document.getElementById('comment-form');
        if (!commentForm) return;
        
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentInput = commentForm.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            
            if (!commentText) {
                alert('Lütfen bir yorum yazın.');
                return;
            }
            
            // Kullanıcı giriş yapmış mı kontrol et
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Yorum yapmak için giriş yapmalısınız.');
                return;
            }
            
            // Yorumu API'ye gönder
            fetch(`/api/stories/${storyId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: commentText
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Yorum gönderilemedi');
                }
                return response.json();
            })
            .then(data => {
                // Yorumu başarıyla gönderdikten sonra yorumları yeniden yükle
                commentInput.value = '';
                loadComments(storyId);
            })
            .catch(error => {
                console.error('Yorum gönderilirken hata oluştu:', error);
                alert('Yorum gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            });
        });
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
    
    // Tarih formatla
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('tr-TR', options);
    }
});
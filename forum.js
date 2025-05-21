document.addEventListener('DOMContentLoaded', function() {
    // DOM Elemanları
    const topicsContainer = document.getElementById('topics-container');
    const newTopicButton = document.getElementById('new-topic-button');
    const newTopicModal = document.getElementById('new-topic-modal');
    const topicDetailModal = document.getElementById('topic-detail-modal');
    const newTopicForm = document.getElementById('new-topic-form');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const topicCommentForm = document.getElementById('topic-comment-form');
    const noTopicsMessage = document.querySelector('.no-topics-message');
    
    // Modallardaki kapat butonları
    const closeButtons = document.querySelectorAll('.close-button');
    
    // Kategori öğeleri
    const categoryItems = document.querySelectorAll('.category-item');
    
    // LocalStorage'dan konuları yükle veya boş bir dizi oluştur
    let topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    
    // Konuları görüntüle
    displayTopics();
    
    // Yeni konu butonuna tıklama olayı
    newTopicButton.addEventListener('click', function() {
        newTopicModal.style.display = 'block';
    });
    
    // Kategori öğelerine tıklama olayı
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            categoryFilter.value = category;
            filterTopics();
        });
    });
    
    // Kapat butonlarına tıklama olayı
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Modal dışına tıklama olayı
    window.addEventListener('click', function(event) {
        if (event.target === newTopicModal) {
            newTopicModal.style.display = 'none';
        }
        if (event.target === topicDetailModal) {
            topicDetailModal.style.display = 'none';
        }
    });
    
    // Yeni konu formunu gönderme olayı
    newTopicForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Kullanıcı bilgilerini al (localStorage'dan veya varsayılan değerler)
        const user = JSON.parse(localStorage.getItem('currentUser')) || {
            id: 'guest-' + Date.now(),
            username: 'Misafir Kullanıcı',
            avatar: 'https://via.placeholder.com/40'
        };
        
        // Form verilerini al
        const title = document.getElementById('topic-title').value;
        const category = document.getElementById('topic-category').value;
        const content = document.getElementById('topic-content').value;
        
        // Yeni konu oluştur
        const newTopic = {
            id: 'topic-' + Date.now(),
            title: title,
            category: category,
            content: content,
            author: user.username,
            authorId: user.id,
            authorAvatar: user.avatar,
            date: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: [],
            liked_by: []
        };
        
        // Konuyu diziye ekle
        topics.unshift(newTopic);
        
        // LocalStorage'a kaydet
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Konuları yeniden görüntüle
        displayTopics();
        
        // Formu temizle ve modalı kapat
        newTopicForm.reset();
        newTopicModal.style.display = 'none';
        
        // Kullanıcıya bildirim göster
        alert('Konu başarıyla oluşturuldu!');
    });
    
    // Kategori ve sıralama filtrelerine değişiklik olayı
    categoryFilter.addEventListener('change', filterTopics);
    sortFilter.addEventListener('change', filterTopics);
    
    // Konu yorumu gönderme olayı
    topicCommentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Aktif konunun ID'sini al
        const topicId = topicDetailModal.getAttribute('data-topic-id');
        if (!topicId) return;
        
        // Kullanıcı bilgilerini al
        const user = JSON.parse(localStorage.getItem('currentUser')) || {
            id: 'guest-' + Date.now(),
            username: 'Misafir Kullanıcı',
            avatar: 'https://via.placeholder.com/40'
        };
        
        // Yorum içeriğini al
        const commentContent = document.getElementById('comment-content').value;
        if (!commentContent.trim()) return;
        
        // Yeni yorum oluştur
        const newComment = {
            id: 'comment-' + Date.now(),
            content: commentContent,
            author: user.username,
            authorId: user.id,
            authorAvatar: user.avatar,
            date: new Date().toISOString(),
            likes: 0,
            liked_by: []
        };
        
        // Konuyu bul ve yorumu ekle
        const topicIndex = topics.findIndex(topic => topic.id === topicId);
        if (topicIndex !== -1) {
            topics[topicIndex].comments.push(newComment);
            
            // LocalStorage'a kaydet
            localStorage.setItem('forumTopics', JSON.stringify(topics));
            
            // Konu detaylarını güncelle
            displayTopicDetail(topics[topicIndex]);
            
            // Formu temizle
            topicCommentForm.reset();
        }
    });
    
    // Konuları görüntüleme fonksiyonu
    function displayTopics() {
        // Konular boşsa mesajı göster, değilse gizle
        if (topics.length === 0) {
            topicsContainer.innerHTML = '';
            noTopicsMessage.style.display = 'block';
            return;
        } else {
            noTopicsMessage.style.display = 'none';
        }
        
        // Filtreleme uygula
        const filteredTopics = filterTopicsByCategory();
        const sortedTopics = sortTopics(filteredTopics);
        
        // Konuları HTML olarak oluştur
        let topicsHTML = '';
        
        sortedTopics.forEach(topic => {
            const date = new Date(topic.date);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            topicsHTML += `
                <div class="topic-item" data-id="${topic.id}">
                    <div class="topic-info">
                        <h3 class="topic-title">${topic.title}</h3>
                        <div class="topic-meta">
                            <span class="topic-author">${topic.author}</span>
                            <span class="topic-date">${formattedDate}</span>
                            <span class="topic-category">${getCategoryName(topic.category)}</span>
                        </div>
                    </div>
                    <div class="topic-stats">
                        <div class="stat-item">
                            <span class="stat-icon">👁️</span>
                            <span class="stat-value">${topic.views}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">❤️</span>
                            <span class="stat-value">${topic.likes}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${topic.comments.length}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        topicsContainer.innerHTML = topicsHTML;
        
        // Konu öğelerine tıklama olayı ekle
        document.querySelectorAll('.topic-item').forEach(item => {
            item.addEventListener('click', function() {
                const topicId = this.getAttribute('data-id');
                const topic = topics.find(t => t.id === topicId);
                
                if (topic) {
                    // Görüntülenme sayısını artır
                    topic.views++;
                    localStorage.setItem('forumTopics', JSON.stringify(topics));
                    
                    // Konu detaylarını göster
                    displayTopicDetail(topic);
                    topicDetailModal.setAttribute('data-topic-id', topicId);
                    topicDetailModal.style.display = 'block';
                }
            });
        });
    }
    
    // Konu detaylarını görüntüleme fonksiyonu
    function displayTopicDetail(topic) {
        const topicDetailContainer = document.getElementById('topic-detail-container');
        const topicCommentsCount = document.getElementById('topic-comments-count');
        const topicCommentsList = document.getElementById('topic-comments-list');
        
        // Kullanıcı bilgilerini al
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 'guest' };
        
        // Konu beğenilmiş mi kontrol et
        const isLiked = topic.liked_by.includes(currentUser.id);
        
        // Tarih formatla
        const date = new Date(topic.date);
        const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        // Konu detaylarını HTML olarak oluştur
        topicDetailContainer.innerHTML = `
            <div class="topic-detail">
                <div class="topic-detail-header">
                    <h2 class="topic-detail-title">${topic.title}</h2>
                    <div class="topic-detail-meta">
                        <span class="topic-author">${topic.author}</span>
                        <span class="topic-date">${formattedDate}</span>
                        <span class="topic-category">${getCategoryName(topic.category)}</span>
                    </div>
                </div>
                <div class="topic-detail-content">
                    ${topic.content.replace(/\n/g, '<br>')}
                </div>
                <div class="topic-actions">
                    <button class="action-button like-button ${isLiked ? 'liked' : ''}" data-id="${topic.id}">
                        <span class="action-icon">❤️</span>
                        <span class="action-text">Beğen</span>
                        <span class="action-count">(${topic.likes})</span>
                    </button>
                </div>
            </div>
        `;
        
        // Yorum sayısını güncelle
        topicCommentsCount.textContent = topic.comments.length;
        
        // Yorumları HTML olarak oluştur
        let commentsHTML = '';
        
        if (topic.comments.length === 0) {
            commentsHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        } else {
            topic.comments.forEach(comment => {
                const commentDate = new Date(comment.date);
                const formattedCommentDate = `${commentDate.getDate()}.${commentDate.getMonth() + 1}.${commentDate.getFullYear()} ${commentDate.getHours()}:${commentDate.getMinutes().toString().padStart(2, '0')}`;
                
                const isCommentLiked = comment.liked_by.includes(currentUser.id);
                
                commentsHTML += `
                    <div class="comment-item" data-id="${comment.id}">
                        <div class="comment-header">
                            <span class="comment-author">${comment.author}</span>
                            <span class="comment-date">${formattedCommentDate}</span>
                        </div>
                        <div class="comment-content">
                            ${comment.content.replace(/\n/g, '<br>')}
                        </div>
                        <div class="comment-actions">
                            <button class="action-button comment-like-button ${isCommentLiked ? 'liked' : ''}" data-topic-id="${topic.id}" data-comment-id="${comment.id}">
                                <span class="action-icon">❤️</span>
                                <span class="action-text">Beğen</span>
                                <span class="action-count">(${comment.likes})</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        topicCommentsList.innerHTML = commentsHTML;
        
        // Beğenme butonlarına tıklama olayı ekle
        const likeButton = document.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const topicId = this.getAttribute('data-id');
                toggleLikeTopic(topicId);
            });
        }
        
        // Yorum beğenme butonlarına tıklama olayı ekle
        document.querySelectorAll('.comment-like-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const topicId = this.getAttribute('data-topic-id');
                const commentId = this.getAttribute('data-comment-id');
                toggleLikeComment(topicId, commentId);
            });
        });
    }
    
    // Konu beğenme/beğenmeme fonksiyonu
    function toggleLikeTopic(topicId) {
        // Kullanıcı bilgilerini al
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 'guest' };
        
        // Konuyu bul
        const topicIndex = topics.findIndex(topic => topic.id === topicId);
        if (topicIndex === -1) return;
        
        const topic = topics[topicIndex];
        const likedIndex = topic.liked_by.indexOf(currentUser.id);
        
        // Beğeni durumunu değiştir
        if (likedIndex === -1) {
            // Beğen
            topic.liked_by.push(currentUser.id);
            topic.likes++;
        } else {
            // Beğeniyi kaldır
            topic.liked_by.splice(likedIndex, 1);
            topic.likes--;
        }
        
        // LocalStorage'a kaydet
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Konu detaylarını güncelle
        displayTopicDetail(topic);
        
        // Konu listesini güncelle
        displayTopics();
    }
    
    // Yorum beğenme/beğenmeme fonksiyonu
    function toggleLikeComment(topicId, commentId) {
        // Kullanıcı bilgilerini al
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: 'guest' };
        
        // Konuyu ve yorumu bul
        const topicIndex = topics.findIndex(topic => topic.id === topicId);
        if (topicIndex === -1) return;
        
        const topic = topics[topicIndex];
        const commentIndex = topic.comments.findIndex(comment => comment.id === commentId);
        if (commentIndex === -1) return;
        
        const comment = topic.comments[commentIndex];
        const likedIndex = comment.liked_by.indexOf(currentUser.id);
        
        // Beğeni durumunu değiştir
        if (likedIndex === -1) {
            // Beğen
            comment.liked_by.push(currentUser.id);
            comment.likes++;
        } else {
            // Beğeniyi kaldır
            comment.liked_by.splice(likedIndex, 1);
            comment.likes--;
        }
        
        // LocalStorage'a kaydet
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Konu detaylarını güncelle
        displayTopicDetail(topic);
    }
    
    // Kategori adını alma fonksiyonu
    function getCategoryName(categoryId) {
        const categories = {
            'genel': 'Genel Konular',
            'hikayeler': 'Hikayeler',
            'yazarlar': 'Yazarlar',
            'oneri': 'Öneri ve İstekler'
        };
        
        return categories[categoryId] || categoryId;
    }
    
    // Konuları kategoriye göre filtreleme fonksiyonu
    function filterTopicsByCategory() {
        const category = categoryFilter.value;
        
        if (category === 'all') {
            return [...topics];
        } else {
            return topics.filter(topic => topic.category === category);
        }
    }
    
    // Konuları sıralama fonksiyonu
    function sortTopics(topicsToSort) {
        const sortBy = sortFilter.value;
        
        return [...topicsToSort].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'popular':
                    return b.likes - a.likes;
                case 'most-commented':
                    return b.comments.length - a.comments.length;
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    }
    
    // Konuları filtreleme fonksiyonu
    function filterTopics() {
        displayTopics();
    }
    
    // Yeni konu butonlarına tıklama olayı
    document.querySelectorAll('.new-topic-button').forEach(button => {
        button.addEventListener('click', function() {
            newTopicModal.style.display = 'block';
        });
    });
});
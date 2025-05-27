// Gönderi detay sayfası için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlatma
    initPage('Gönderi Detay', 'Gönderi içeriği', 'gönderi, hikaye, detay');
    
    // DOM Elemanları
    const postTitle = document.getElementById('post-title');
    const postCategory = document.getElementById('post-category');
    const authorAvatar = document.getElementById('author-avatar');
    const authorName = document.getElementById('author-name');
    const postDate = document.getElementById('post-date');
    const viewCount = document.getElementById('view-count');
    const commentCount = document.getElementById('comment-count');
    const postImage = document.getElementById('post-image');
    const postContent = document.getElementById('post-content');
    const postTags = document.getElementById('post-tags');
    const relatedPostsContainer = document.getElementById('related-posts-container');
    const commentsList = document.getElementById('comment-list');
    const commentsCount = document.getElementById('comments-count');
    const commentForm = document.getElementById('comment-form');
    
    // URL'den gönderi ID'sini al
    const postId = getUrlParam('id');
    let currentPost = null;
    
    // Gönderi ve yorumları yükle
    if (postId) {
        loadPostDetails(postId);
        loadComments(postId);
        
        // Yorum formu dinleyicisi ekle
        if (commentForm) {
            commentForm.addEventListener('submit', handleCommentSubmit);
        }
    } else {
        showErrorPage('Gönderi ID\'si bulunamadı');
    }
    
    // Gönderi detaylarını yükle
    async function loadPostDetails(id) {
        try {
            const postsData = await DataUtils.loadData('posts');
            if (!postsData || !postsData.posts) {
                throw new Error('Gönderi verileri yüklenemedi');
            }
            
            const post = postsData.posts.find(p => p.id === parseInt(id));
            
            if (!post) {
                throw new Error('Gönderi bulunamadı');
            }
            
            // Post verilerini sakla
            currentPost = post;
            
            // Post görüntüleme sayısını artır
            incrementViewCount(post);
            
            // Post detaylarını göster
            displayPostDetails(post);
            
            // İlgili gönderiler
            loadRelatedPosts(post.category, post.id);
            
            // Sayfa başlığını güncelle
            setPageMeta(`${post.title}`, `${post.title} - Trae sitesinde yayınlanan bir gönderi`, 
                       `${post.tags.join(', ')}, gönderi, hikaye`);
                
        } catch (error) {
            console.error('Gönderi yükleme hatası:', error);
            showErrorPage(error.message);
        }
    }
    
    // Gönderi detaylarını göster
    async function displayPostDetails(post) {
        // Gönderi içeriğini doldur
        if (postTitle) postTitle.textContent = post.title;
        if (postCategory) postCategory.textContent = getCategoryName(post.category);
        if (postDate) postDate.textContent = DataUtils.formatDate(post.created_at);
        if (viewCount) viewCount.textContent = post.view_count || 0;
        if (commentCount) commentCount.textContent = post.comment_count || 0;
        if (postContent) postContent.innerHTML = post.content;
        if (postImage && post.image) {
            postImage.src = post.image;
            postImage.alt = post.title;
        }
        
        // Etiketleri göster
        if (postTags && post.tags && post.tags.length > 0) {
            postTags.innerHTML = '';
            post.tags.forEach(tag => {
                const tagElement = document.createElement('a');
                tagElement.href = `/discover.html?tag=${tag}`;
                tagElement.className = 'post-tag';
                tagElement.textContent = `#${tag}`;
                postTags.appendChild(tagElement);
            });
        }
        
        // Yazar bilgilerini yükle
        await loadAuthorInfo(post.author_id);
    }
    
    // Yazar bilgilerini yükle
    async function loadAuthorInfo(authorId) {
        try {
            const usersData = await DataUtils.loadData('users');
            if (!usersData || !usersData.users) {
                throw new Error('Kullanıcı verileri yüklenemedi');
            }
            
            const author = usersData.users.find(u => u.id === authorId);
            
            if (!author) {
                throw new Error('Yazar bilgileri bulunamadı');
            }
            
            // Yazar bilgilerini göster
            if (authorName) authorName.textContent = author.username;            if (authorAvatar) {
                authorAvatar.src = author.avatar || './images/avatars/default.svg';
                authorAvatar.alt = author.username;
            }
            
        } catch (error) {
            console.error('Yazar bilgileri yükleme hatası:', error);
            
            // Varsayılan değerler
            if (authorName) authorName.textContent = 'Bilinmeyen Yazar';
            if (authorAvatar) {
                authorAvatar.src = './images/avatars/default.svg';
                authorAvatar.alt = 'Bilinmeyen Yazar';
            }
        }
    }
    
    // Yorumları yükle
    async function loadComments(postId) {
        try {
            const commentsData = await DataUtils.loadData('comments');
            if (!commentsData || !commentsData.comments) {
                throw new Error('Yorum verileri yüklenemedi');
            }
            
            const postComments = commentsData.comments.filter(
                c => c.post_id === parseInt(postId)
            );
            
            // Yorumları göster
            displayComments(postComments);
            
        } catch (error) {
            console.error('Yorum yükleme hatası:', error);
            
            if (commentsList) {
                commentsList.innerHTML = `
                    <div class="no-comments">
                        <p>Yorumlar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
                    </div>
                `;
            }
            
            if (commentsCount) {
                commentsCount.textContent = '0';
            }
        }
    }
    
    // Yorumları göster
    async function displayComments(comments) {
        if (!commentsList) return;
        
        // Yorum sayısını güncelle
        if (commentsCount) {
            commentsCount.textContent = comments.length;
        }
        
        // Yorumlar yoksa mesaj göster
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                </div>
            `;
            return;
        }
        
        // Yorumları temizle
        commentsList.innerHTML = '';
        
        // Kullanıcı verilerini yükle
        const usersData = await DataUtils.loadData('users');
        
        // Yorumları göster
        for (const comment of comments) {
            // Kullanıcı bilgisini bul
            const user = usersData && usersData.users ? 
                usersData.users.find(u => u.id === comment.user_id) : null;
            
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-item';
            
            const userName = user ? user.username : 'Bilinmeyen Kullanıcı';
            const userAvatar = user && user.avatar ? user.avatar : './images/avatars/default.svg';
            
            commentEl.innerHTML = `
                <div class="comment-header">
                    <img src="${userAvatar}" alt="${userName}" class="comment-avatar">
                    <div class="comment-meta">
                        <div class="comment-author">${userName}</div>
                        <div class="comment-date">${DataUtils.formatDate(comment.created_at)}</div>
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
            `;
            
            commentsList.appendChild(commentEl);
        }
    }
    
    // Yorum gönderme
    async function handleCommentSubmit(e) {
        e.preventDefault();
        
        // Kullanıcı giriş yapmış mı kontrol et
        if (!DataUtils.isAuthenticated()) {
            showErrorMessage('Yorum yapmak için giriş yapmalısınız.');
            setTimeout(() => {
                window.location.href = `/login.html?redirect=/post_detail.html?id=${postId}`;
            }, 2000);
            return;
        }
        
        const commentContent = document.getElementById('comment-content').value.trim();
        
        if (!commentContent) {
            showErrorMessage('Yorum içeriği boş olamaz.');
            return;
        }
        
        try {
            // Mevcut kullanıcıyı al
            const currentUser = DataUtils.getCurrentUser();
            
            // Yorum verilerini yükle
            const commentsData = await DataUtils.loadData('comments');
            if (!commentsData) {
                throw new Error('Yorum verileri yüklenemedi');
            }
            
            // Yeni yorum oluştur
            const newComment = {
                id: commentsData.comments.length + 1,
                post_id: parseInt(postId),
                user_id: currentUser.id,
                content: commentContent,
                created_at: new Date().toISOString()
            };
            
            // Yorumu ekle
            commentsData.comments.push(newComment);
            
            // Yorumları kaydet
            await DataUtils.saveData('comments', commentsData);
            
            // Gönderi yorum sayısını güncelle
            if (currentPost) {
                const postsData = await DataUtils.loadData('posts');
                if (postsData && postsData.posts) {
                    const postIndex = postsData.posts.findIndex(p => p.id === parseInt(postId));
                    if (postIndex !== -1) {
                        postsData.posts[postIndex].comment_count = 
                            (postsData.posts[postIndex].comment_count || 0) + 1;
                        await DataUtils.saveData('posts', postsData);
                    }
                }
            }
            
            // Başarılı mesajı göster
            showSuccessMessage('Yorumunuz başarıyla eklendi!');
            
            // Yorum formunu temizle
            document.getElementById('comment-content').value = '';
            
            // Yorumları yeniden yükle
            loadComments(postId);
            
        } catch (error) {
            showErrorMessage(`Yorum eklenemedi: ${error.message}`);
        }
    }
    
    // İlgili gönderileri yükle
    async function loadRelatedPosts(category, currentPostId) {
        if (!relatedPostsContainer) return;
        
        try {
            const postsData = await DataUtils.loadData('posts');
            if (!postsData || !postsData.posts) {
                throw new Error('Gönderi verileri yüklenemedi');
            }
            
            // Aynı kategorideki en fazla 4 gönderiyi seç (mevcut gönderi hariç)
            const relatedPosts = postsData.posts
                .filter(p => p.category === category && p.id !== parseInt(currentPostId))
                .slice(0, 4);
            
            if (!relatedPosts || relatedPosts.length === 0) {
                relatedPostsContainer.innerHTML = '<p>İlgili gönderi bulunamadı.</p>';
                return;
            }
            
            // İlgili gönderileri göster
            relatedPostsContainer.innerHTML = '';
            
            relatedPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'related-post';
                
                postElement.innerHTML = `
                    <a href="post_detail.html?id=${post.id}" class="related-post-link">
                        <div class="related-post-image">
                            <img src="${post.image || './images/posts/default.svg'}" alt="${post.title}">
                        </div>
                        <div class="related-post-info">
                            <h4>${post.title}</h4>
                            <span class="related-post-date">${DataUtils.formatDate(post.created_at)}</span>
                        </div>
                    </a>
                `;
                
                relatedPostsContainer.appendChild(postElement);
            });
            
        } catch (error) {
            console.error('İlgili gönderiler yükleme hatası:', error);
            relatedPostsContainer.innerHTML = '<p>İlgili gönderiler yüklenemedi.</p>';
        }
    }
    
    // Gönderi görüntüleme sayısını artır
    async function incrementViewCount(post) {
        if (!post) return;
        
        try {
            // Gönderi verilerini yükle
            const postsData = await DataUtils.loadData('posts');
            if (!postsData || !postsData.posts) return;
            
            // Gönderiyi bul ve görüntüleme sayısını artır
            const postIndex = postsData.posts.findIndex(p => p.id === post.id);
            if (postIndex !== -1) {
                postsData.posts[postIndex].view_count = (postsData.posts[postIndex].view_count || 0) + 1;
                
                // Verileri kaydet
                await DataUtils.saveData('posts', postsData);
                
                // UI'ı güncelle
                if (viewCount) {
                    viewCount.textContent = postsData.posts[postIndex].view_count;
                }
            }
        } catch (error) {
            console.error('Görüntüleme sayısı güncelleme hatası:', error);
        }
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
    
    // Hata sayfası göster
    function showErrorPage(message) {
        const container = document.querySelector('.post-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>Gönderi Bulunamadı</h2>
                    <p>${message || 'İstediğiniz gönderi bulunamadı veya bir hata oluştu.'}</p>
                    <a href="index.html" class="btn">Ana Sayfaya Dön</a>
                </div>
            `;
        }
    }
});

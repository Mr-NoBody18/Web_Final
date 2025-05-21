// post_detail.js - Gönderi Detay Sayfası JavaScript

document.addEventListener('DOMContentLoaded', function() {
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
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
      if (postId) {
        // Gönderi detaylarını static data handler ile getir
        staticData.getStoryById(postId)
            .then(post => {
                if (!post) {
                    throw new Error('Gönderi bulunamadı');
                }
                displayPost(post);
                loadRelatedPosts(post.category, post.id);
                loadComments(post.id);
                
                // View count zaten StaticDataHandler'da artırılıyor
            })
            .catch(error => {
                console.error('Gönderi yükleme hatası:', error);
                document.querySelector('.post-detail-container').innerHTML = `
                    <div class="error-message">
                        <h2>Gönderi Bulunamadı</h2>
                        <p>İstediğiniz gönderi bulunamadı veya bir hata oluştu.</p>
                        <a href="../index.html" class="btn">Ana Sayfaya Dön</a>
                    </div>
                `;
            });
    } else {
        // ID yoksa hata mesajı göster
        document.querySelector('.post-detail-container').innerHTML = `
            <div class="error-message">
                <h2>Gönderi Bulunamadı</h2>
                <p>Geçerli bir gönderi ID'si belirtilmedi.</p>
                <a href="../index.html" class="btn">Ana Sayfaya Dön</a>
            </div>
        `;
    }
      // Görüntülenme sayısı artık StaticDataHandler tarafından otomatik artırılıyor
    // Bu işlev artık kullanılmıyor
    function incrementViewCount(storyId) {
        // Static data kullandığımız için bu işlev artık kullanılmıyor
        console.log('View count değeri otomatik olarak artırıldı.');
    }
    
    // Gönderi içeriğini görüntüle
    function displayPost(post) {
        // Sayfa başlığı ve meta bilgileri
        updatePageMetadata(post);
        
        // Gönderi başlık ve kategori bilgileri
        updatePostHeader(post);
        
        // Yazar bilgileri
        updateAuthorInfo(post);
        
        // İstatistikler
        updatePostStats(post);
        
        // Kapak görseli
        updatePostImage(post);
        
        // İçerik bloklarını oluştur
        updatePostContent(post);
        
        // Etiketler
        updatePostTags(post);
        
        // Etkileşim butonları
        setupInteractionButtons(post);
    }
    
    // Sayfa başlığı ve meta bilgilerini güncelle
    function updatePageMetadata(post) {
        document.title = `HikayePortalı - ${post.title}`;
    }
    
    // Gönderi başlık ve kategori bilgilerini güncelle
    function updatePostHeader(post) {
        if (postCategory) {
            postCategory.textContent = getCategoryName(post.category);
            postCategory.className = `post-category category-${post.category}`;
        }
        
        if (postTitle) {
            postTitle.textContent = post.title;
        }
    }
    
    // Yazar bilgilerini güncelle
    function updateAuthorInfo(post) {
        if (authorAvatar && post.profile_image) {
            authorAvatar.style.backgroundImage = `url('${post.profile_image}')`;
        }
        
        if (authorName) {
            authorName.textContent = post.real_name || post.username;
        }
        
        if (postDate) {
            const date = new Date(post.created_at);
            postDate.textContent = formatDate(date);
        }
    }
    
    // İstatistikleri güncelle
    function updatePostStats(post) {
        if (viewCount) {
            viewCount.textContent = `👁️ ${post.view_count || 0} Görüntülenme`;
        }
        
        if (commentCount) {
            commentCount.textContent = `💬 ${post.comment_count || 0} Yorum`;
        }
    }
    
    // Kapak görselini güncelle
    function updatePostImage(post) {
        if (postImage && post.image_url) {
            postImage.src = post.image_url;
            postImage.alt = post.title;
        } else if (postImage) {
            postImage.style.display = 'none';
        }
    }
    
    // İçerik bloklarını güncelle
    function updatePostContent(post) {
        if (!postContent) return;
        
        // İçerik JSON formatında geliyorsa parse et
        const blocks = parseContentBlocks(post.content);
        renderContentBlocks(blocks, postContent);
    }
    
    // İçerik bloklarını parse et
    function parseContentBlocks(content) {
        let blocks = [];
        
        if (typeof content === 'string') {
            try {
                const parsedContent = JSON.parse(content);
                // İçerik doğrudan bir dizi olabilir veya blocks özelliği içerebilir
                if (Array.isArray(parsedContent)) {
                    blocks = parsedContent;
                } else if (parsedContent && parsedContent.blocks) {
                    blocks = parsedContent.blocks;
                }
            } catch (e) {
                console.error('İçerik JSON formatında değil:', e);
                // Düz metin olarak göster
                blocks = [{
                    type: 'full',
                    contentType: 'text',
                    content: content
                }];
            }
        } else if (content && Array.isArray(content)) {
            blocks = content;
        } else if (content && content.blocks) {
            blocks = content.blocks;
        }
        
        return blocks;
    }
    
    // Etiketleri güncelle
    function updatePostTags(post) {
        if (!postTags || !post.tags) return;
        
        const tags = post.tags.split(',').map(tag => tag.trim());
        postTags.innerHTML = '';
        
        tags.forEach(tag => {
            if (tag) {
                const tagElement = document.createElement('span');
                tagElement.className = 'post-tag';
                tagElement.textContent = tag;
                postTags.appendChild(tagElement);
            }
        });
    }
    
    // Etkileşim butonlarını ayarla
    function setupInteractionButtons(post) {
        // Beğeni ve kaydetme butonları
        const likeButton = document.querySelector('[data-action="like"]');
        const saveButton = document.querySelector('[data-action="save"]');
        
        if (likeButton) {
            likeButton.textContent = post.is_liked ? '❤️ Beğenildi' : '🤍 Beğen';
            likeButton.addEventListener('click', function() {
                toggleLike(post.id, likeButton);
            });
        }
        
        if (saveButton) {
            saveButton.textContent = post.is_saved ? '📑 Kaydedildi' : '📄 Kaydet';
            saveButton.addEventListener('click', function() {
                toggleSave(post.id, saveButton);
            });
        }
        
        // Paylaşım butonları
        const shareButtons = document.querySelectorAll('.share-button');
        shareButtons.forEach(button => {
            button.addEventListener('click', function() {
                const platform = button.dataset.platform;
                sharePost(post, platform);
            });
        });
        
        // Bildir butonu
        const reportButton = document.querySelector('[data-action="report"]');
        if (reportButton) {
            reportButton.addEventListener('click', function() {
                showReportDialog(post.id);
            });
        }
    }
    
    // İçerik bloklarını oluştur
    function renderContentBlocks(blocks, container) {
        container.innerHTML = '';
        
        if (!blocks || blocks.length === 0) {
            container.innerHTML = '<p class="no-content">Bu gönderinin içeriği bulunmamaktadır.</p>';
            return;
        }
        
        blocks.forEach(block => {
            let blockElement;
            
            switch (block.type) {
                case 'full':
                    blockElement = renderFullWidthBlock(block);
                    break;
                case 'split':
                    blockElement = renderSplitBlock(block);
                    break;
                case 'gallery':
                    blockElement = renderGalleryBlock(block);
                    break;
                case 'quote':
                    blockElement = renderQuoteBlock(block);
                    break;
                case 'video':
                    blockElement = renderVideoBlock(block);
                    break;
                case 'embed':
                    blockElement = renderEmbedBlock(block);
                    break;
                case '3d-model':
                    blockElement = render3DModelBlock(block);
                    break;
                default:
                    console.warn('Bilinmeyen blok tipi:', block.type);
                    return;
            }
            
            if (blockElement) {
                container.appendChild(blockElement);
            }
        });
    }
    
    // Tam genişlik blok oluştur
    function renderFullWidthBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block full-width-block';
        
        if (!block || !block.contentType) {
            blockElement.innerHTML = '<p>Geçersiz blok içeriği</p>';
            return blockElement;
        }
        
        switch (block.contentType) {
            case 'text':
                if (block.content) {
                    blockElement.innerHTML = block.content;
                } else {
                    blockElement.innerHTML = '<p>İçerik bulunamadı</p>';
                }
                break;
            case 'image':
                if (block.content) {
                    const img = document.createElement('img');
                    img.src = block.content;
                    img.alt = 'Görsel';
                    img.className = 'block-image';
                    img.onerror = function() {
                        this.src = '../images/placeholder.jpg';
                        this.alt = 'Görsel yüklenemedi';
                    };
                    blockElement.appendChild(img);
                } else {
                    blockElement.innerHTML = '<p>Görsel bulunamadı</p>';
                }
                break;
            case 'code':
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = block.content || '';
                pre.appendChild(code);
                blockElement.appendChild(pre);
                break;
            default:
                blockElement.innerHTML = `<p>Desteklenmeyen içerik tipi: ${block.contentType}</p>`;
        }
        
        return blockElement;
    }
    
    // Bölünmüş blok oluştur
    function renderSplitBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block split-block';
        
        const leftElement = document.createElement('div');
        leftElement.className = 'split-left';
        
        const rightElement = document.createElement('div');
        rightElement.className = 'split-right';
        
        // Sol içerik
        if (block.left && block.left.contentType) {
            switch (block.left.contentType) {
                case 'text':
                    if (block.left.content) {
                        leftElement.innerHTML = block.left.content;
                    } else {
                        leftElement.innerHTML = '<p>İçerik bulunamadı</p>';
                    }
                    break;
                case 'image':
                    if (block.left.content) {
                        const img = document.createElement('img');
                        img.src = block.left.content;
                        img.alt = 'Görsel';
                        img.className = 'block-image';
                        img.onerror = function() {
                            this.src = '../images/placeholder.jpg';
                            this.alt = 'Görsel yüklenemedi';
                        };
                        leftElement.appendChild(img);
                    } else {
                        leftElement.innerHTML = '<p>Görsel bulunamadı</p>';
                    }
                    break;
                case 'code':
                    const leftPre = document.createElement('pre');
                    const leftCode = document.createElement('code');
                    leftCode.textContent = block.left.content || '';
                    leftPre.appendChild(leftCode);
                    leftElement.appendChild(leftPre);
                    break;
                default:
                    leftElement.innerHTML = '<p>Desteklenmeyen içerik tipi</p>';
            }
        } else {
            leftElement.innerHTML = '<p>İçerik bulunamadı</p>';
        }
        
        // Sağ içerik
        if (block.right && block.right.contentType) {
            switch (block.right.contentType) {
                case 'text':
                    if (block.right.content) {
                        rightElement.innerHTML = block.right.content;
                    } else {
                        rightElement.innerHTML = '<p>İçerik bulunamadı</p>';
                    }
                    break;
                case 'image':
                    if (block.right.content) {
                        const img = document.createElement('img');
                        img.src = block.right.content;
                        img.alt = 'Görsel';
                        img.className = 'block-image';
                        img.onerror = function() {
                            this.src = '../images/placeholder.jpg';
                            this.alt = 'Görsel yüklenemedi';
                        };
                        rightElement.appendChild(img);
                    } else {
                        rightElement.innerHTML = '<p>Görsel bulunamadı</p>';
                    }
                    break;
                case 'code':
                    const rightPre = document.createElement('pre');
                    const rightCode = document.createElement('code');
                    rightCode.textContent = block.right.content || '';
                    rightPre.appendChild(rightCode);
                    rightElement.appendChild(rightPre);
                    break;
                default:
                    rightElement.innerHTML = '<p>Desteklenmeyen içerik tipi</p>';
            }
        } else {
            rightElement.innerHTML = '<p>İçerik bulunamadı</p>';
        }
        
        blockElement.appendChild(leftElement);
        blockElement.appendChild(rightElement);
        return blockElement;
    }
    
    // Galeri blok oluştur
    function renderGalleryBlock(block) {
        if (!block.items || !Array.isArray(block.items) || block.items.length === 0) {
            const blockElement = document.createElement('div');
            blockElement.className = 'content-block gallery-block';
            blockElement.innerHTML = '<p>Galeri öğeleri bulunamadı</p>';
            return blockElement;
        }
        
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block gallery-block';
        
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'gallery-container';
        
        // Geçerli öğeleri filtrele
        const validItems = block.items.filter(item => item && item.src);
        
        if (validItems.length === 0) {
            blockElement.innerHTML = '<p>Geçerli galeri öğesi bulunamadı</p>';
            return blockElement;
        }
        
        validItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption || 'Galeri görseli';
            img.onerror = function() {
                this.src = '../images/placeholder.jpg';
                this.alt = 'Görsel yüklenemedi';
            };
            
            galleryItem.appendChild(img);
            
            if (item.caption) {
                const caption = document.createElement('div');
                caption.className = 'gallery-caption';
                caption.textContent = item.caption;
                galleryItem.appendChild(caption);
            }
            
            galleryContainer.appendChild(galleryItem);
        });
        
        blockElement.appendChild(galleryContainer);
        
        // Galeri gezinme kontrollerini ekle
        if (validItems.length > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'gallery-nav prev';
            prevButton.innerHTML = '&#10094;';
            prevButton.setAttribute('aria-label', 'Önceki görsel');
            
            const nextButton = document.createElement('button');
            nextButton.className = 'gallery-nav next';
            nextButton.innerHTML = '&#10095;';
            nextButton.setAttribute('aria-label', 'Sonraki görsel');
            
            blockElement.appendChild(prevButton);
            blockElement.appendChild(nextButton);
            
            // Galeri gezinme işlevselliği
            setupGalleryNavigation(blockElement, prevButton, nextButton);
        }
        
        return blockElement;
    }
    
    // Galeri gezinme işlevselliğini ayarla
    function setupGalleryNavigation(galleryBlock, prevButton, nextButton) {
        const galleryContainer = galleryBlock.querySelector('.gallery-container');
        const galleryItems = galleryBlock.querySelectorAll('.gallery-item');
        let currentIndex = 0;
        
        // İlk öğe dışındakileri gizle
        for (let i = 1; i < galleryItems.length; i++) {
            galleryItems[i].style.display = 'none';
        }
        
        // Önceki butonu tıklama olayı
        prevButton.addEventListener('click', function() {
            galleryItems[currentIndex].style.display = 'none';
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            galleryItems[currentIndex].style.display = 'block';
        });
        
        // Sonraki butonu tıklama olayı
        nextButton.addEventListener('click', function() {
            galleryItems[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % galleryItems.length;
            galleryItems[currentIndex].style.display = 'block';
        });
    }
    
    // Alıntı blok oluştur
    function renderQuoteBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block quote-block';
        
        const quoteContent = document.createElement('div');
        quoteContent.className = 'quote-content';
        quoteContent.innerHTML = block.content;
        
        const quoteAuthor = document.createElement('div');
        quoteAuthor.className = 'quote-author';
        quoteAuthor.innerHTML = block.author || '';
        
        blockElement.appendChild(quoteContent);
        blockElement.appendChild(quoteAuthor);
        
        return blockElement;
    }
    
    // Video blok oluştur
    function renderVideoBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block video-block';
        
        if (!block.url) {
            blockElement.innerHTML = '<p>Video URL\'si bulunamadı</p>';
            return blockElement;
        }
        
        const videoContent = document.createElement('div');
        videoContent.className = 'video-content';
        
        // URL'yi güvenli hale getir
        let safeUrl = block.url.trim();
        
        // YouTube URL'sini kontrol et ve düzelt
        if (safeUrl.includes('youtube.com/watch')) {
            const videoId = new URL(safeUrl).searchParams.get('v');
            if (videoId) {
                safeUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } else if (safeUrl.includes('youtu.be')) {
            const videoId = safeUrl.split('/').pop().split('?')[0];
            if (videoId) {
                safeUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } else if (safeUrl.includes('vimeo.com') && !safeUrl.includes('/video/')) {
            const videoId = safeUrl.split('/').pop().split('?')[0];
            if (videoId && !isNaN(videoId)) {
                safeUrl = `https://player.vimeo.com/video/${videoId}`;
            }
        }
        
        try {
            // Güvenli URL'yi iframe'e ekle
            const iframe = document.createElement('iframe');
            iframe.src = safeUrl;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('loading', 'lazy');
            videoContent.appendChild(iframe);
        } catch (error) {
            console.error('Video URL işleme hatası:', error);
            videoContent.innerHTML = '<p>Video yüklenirken bir hata oluştu</p>';
        }
        
        blockElement.appendChild(videoContent);
        return blockElement;
    }
    
    // Gömülü içerik blok oluştur
    function renderEmbedBlock(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block embed-block';
        
        if (!block.content) {
            blockElement.innerHTML = '<p>Gömülü içerik bulunamadı</p>';
            return blockElement;
        }
        
        const embedContent = document.createElement('div');
        embedContent.className = 'embed-content';
        
        try {
            // Gömülü içeriği güvenli bir şekilde ekle
            // Not: Bu hala potansiyel XSS riski taşıyabilir, daha güvenli bir çözüm için
            // bir HTML temizleme kütüphanesi kullanılabilir
            embedContent.innerHTML = block.content;
            
            // iframe'lere güvenlik özellikleri ekle
            const iframes = embedContent.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                // Güvenlik için sandbox özelliği ekle
                if (!iframe.hasAttribute('sandbox')) {
                    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
                }
                // Lazy loading ekle
                iframe.setAttribute('loading', 'lazy');
            });
        } catch (error) {
            console.error('Gömülü içerik işleme hatası:', error);
            embedContent.innerHTML = '<p>Gömülü içerik yüklenirken bir hata oluştu</p>';
        }
        
        blockElement.appendChild(embedContent);
        return blockElement;
    }
    
    // 3D Model blok oluştur
    function render3DModelBlock(block) {
        if (!block.url) return null;
        
        const blockElement = document.createElement('div');
        blockElement.className = 'content-block model-block';
        
        const modelPreview = document.createElement('div');
        modelPreview.className = 'model-preview';
        modelPreview.dataset.modelUrl = block.url;
        modelPreview.innerHTML = `<div class="model-placeholder">3D Model: ${block.url}</div>`;
        
        blockElement.appendChild(modelPreview);
        return blockElement;
    }
      // Benzer gönderileri yükle
    async function loadRelatedPosts(category, currentPostId) {
        try {
            // staticData kullanarak kategoriye göre hikayeleri al
            const posts = await staticData.getStories({category: category, limit: 4});
            
            // Mevcut gönderiyi filtrele
            const relatedPosts = posts.filter(post => post.id !== parseInt(currentPostId)).slice(0, 3);
            
            if (relatedPostsContainer) {
                if (relatedPosts.length === 0) {
                    relatedPostsContainer.innerHTML = '<p class="no-content">Benzer gönderi bulunamadı.</p>';
                    return;
                }
                    
                    relatedPostsContainer.innerHTML = '';
                    
                    relatedPosts.forEach(post => {
                        const postCard = document.createElement('div');
                        postCard.className = 'card';
                        postCard.innerHTML = `
                            <a href="post_detail.html?id=${post.id}" class="card-link">
                                <div class="card-image" style="background-image: url('${post.image_url || '../images/placeholder.jpg'}');"></div>
                                <div class="card-content">
                                    <div class="card-category category-${post.category}">${getCategoryName(post.category)}</div>
                                    <h3 class="card-title">${post.title}</h3>
                                    <div class="card-meta">
                                        <span class="card-author">${post.real_name || post.username}</span>
                                        <span class="card-date">${formatDate(new Date(post.created_at))}</span>
                                    </div>
                                </div>
                            </a>
                        `;
                        
                        relatedPostsContainer.appendChild(postCard);
                    });
                }
            })
            .catch(error => {
                console.error('Benzer gönderiler yüklenirken hata:', error);
                if (relatedPostsContainer) {
                    relatedPostsContainer.innerHTML = '<p class="error-message">Benzer gönderiler yüklenirken bir hata oluştu.</p>';
                }
            });
    }      // Yorumları yükle
    async function loadComments(postId) {
        try {
            const comments = await staticData.getCommentsByStoryId(parseInt(postId));
            
            if (commentsCount) {
                commentsCount.textContent = comments.length;
            }
                
            if (commentsList) {
                if (comments.length === 0) {
                    commentsList.innerHTML = '<p class="no-comments">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
                    return;
                }
                
                commentsList.innerHTML = '';
                
                comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <div class="comment-avatar" style="background-image: url('${comment.profile_image || '../images/default-avatar.jpg'}');"></div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">${comment.real_name || comment.username}</span>
                                <span class="comment-date">${formatDate(new Date(comment.created_at))}</span>
                            </div>
                            <div class="comment-text">${comment.content}</div>
                        </div>
                    `;
                    
                    commentsList.appendChild(commentElement);
                });
            }
        } catch (error) {
            console.error('Yorumlar yüklenirken hata:', error);
            if (commentsList) {
                commentsList.innerHTML = '<p class="error-message">Yorumlar yüklenirken bir hata oluştu.</p>';
            }
        }
    }
    
    // Yorum gönderme
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const commentInput = commentForm.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            
            if (!commentText) {
                showNotification('Lütfen bir yorum yazın', 'error');
                return;
            }
            
            // Yorum verilerini hazırla
            const commentData = {
                content: commentText
            };
            
            // API'ye yorum gönder
            fetch(`/api/stories/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Yorum gönderilemedi');
                }
                return response.json();
            })
            .then(data => {
                // Yeni yorumu ekle
                const newComment = data.comment || {
                    id: Date.now(),
                    post_id: postId,
                    user_id: 1,
                    content: commentText,
                    created_at: new Date().toISOString(),
                    username: 'Kullanıcı',
                    real_name: 'Aktif Kullanıcı',
                    profile_image: '../images/default-avatar.jpg'
                };
                
                // Yeni yorumu ekle
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="comment-avatar" style="background-image: url('${newComment.profile_image}');"></div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${newComment.real_name || newComment.username}</span>
                            <span class="comment-date">Az önce</span>
                        </div>
                        <div class="comment-text">${newComment.content}</div>
                    </div>
                `;
                
                // Yorum yoksa mesajı kaldır
                const noComments = commentsList.querySelector('.no-comments');
                if (noComments) {
                    noComments.remove();
                }
                
                // Yorumu listenin başına ekle
                commentsList.insertBefore(commentElement, commentsList.firstChild);
                
                // Yorum sayısını güncelle
                if (commentsCount) {
                    commentsCount.textContent = parseInt(commentsCount.textContent) + 1;
                }
                
                // Formu temizle
                commentInput.value = '';
                
                showNotification('Yorumunuz başarıyla eklendi', 'success');
            })
            .catch(error => {
                console.error('Yorum gönderme hatası:', error);
                showNotification('Yorum gönderilirken bir hata oluştu', 'error');
            });
        });
    }
    
    // Beğeni durumunu değiştir
    function toggleLike(postId, button) {
        fetch(`/api/stories/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Beğeni işlemi başarısız oldu');
            }
            return response.json();
        })
        .then(data => {
            // Beğeni durumunu güncelle
            if (button.textContent.includes('Beğenildi')) {
                button.textContent = '🤍 Beğen';
            } else {
                button.textContent = '❤️ Beğenildi';
            }
            
            // Beğeni sayısını güncelle (eğer API dönüyorsa)
            if (data.like_count !== undefined) {
                const likeCountElement = document.querySelector('.like-count');
                if (likeCountElement) {
                    likeCountElement.textContent = data.like_count;
                }
            }
        })
        .catch(error => {
            console.error('Beğeni hatası:', error);
            showNotification('Beğeni işlemi sırasında bir hata oluştu', 'error');
        });
    }
    
    // Kaydetme durumunu değiştir
    function toggleSave(postId, button) {
        fetch(`/api/stories/${postId}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Kaydetme işlemi başarısız oldu');
            }
            return response.json();
        })
        .then(data => {
            // Kaydetme durumunu güncelle
            if (button.textContent.includes('Kaydedildi')) {
                button.textContent = '📄 Kaydet';
            } else {
                button.textContent = '📑 Kaydedildi';
            }
        })
        .catch(error => {
            console.error('Kaydetme hatası:', error);
            showNotification('Kaydetme işlemi sırasında bir hata oluştu', 'error');
        });
    }
    
    // Gönderi paylaşma
    function sharePost(post, platform) {
        const postUrl = window.location.href;
        const postTitle = post.title;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(postTitle + ' ' + postUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(postUrl)
                    .then(() => {
                        showNotification('Bağlantı panoya kopyalandı', 'success');
                    })
                    .catch(err => {
                        console.error('Kopyalama hatası:', err);
                        showNotification('Bağlantı kopyalanamadı', 'error');
                    });
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    }
    
    // Yardımcı fonksiyonlar
    function getCategoryName(categorySlug) {
        const categories = {
            'technology': 'Teknoloji',
            'travel': 'Seyahat',
            'food': 'Yemek',
            'lifestyle': 'Yaşam Tarzı',
            'art': 'Sanat',
            'science': 'Bilim',
            'other': 'Diğer'
        };
        
        return categories[categorySlug] || 'Kategori';
    }
    
    function formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Az önce';
        } else if (diffMin < 60) {
            return `${diffMin} dakika önce`;
        } else if (diffHour < 24) {
            return `${diffHour} saat önce`;
        } else if (diffDay < 7) {
            return `${diffDay} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
    
    // Bildirim gösterme fonksiyonu
    function showNotification(message, type) {
        // Mevcut bildirimleri temizle
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Bildirim stillerini ekle
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = '#fff';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Bildirim tipine göre arka plan rengini ayarla
        if (type === 'success') {
            notification.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#F44336';
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#FF9800';
        } else {
            notification.style.backgroundColor = '#2196F3';
        }
        
        // Bildirimi sayfaya ekle
        document.body.appendChild(notification);
        
        // Bildirimi göster
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Bildirimi otomatik kapat
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
// static-data-handler.js
// Bu dosya sunucu olmadan JSON dosyalarına erişmek için kullanılır

class StaticDataHandler {
    constructor() {
        // Ana veri kaynaklarımız
        this.usersPath = '/static_data/users.json';
        this.storiesPath = '/static_data/stories.json';
        this.commentsPath = '/static_data/comments.json';
        
        // Önbellek objeleri
        this.usersCache = null;
        this.storiesCache = null;
        this.commentsCache = null;
        
        // LocalStorage anahtarları
        this.userStorageKey = 'hikaye_portali_users';
        this.storyStorageKey = 'hikaye_portali_stories';
        this.commentStorageKey = 'hikaye_portali_comments';
        this.authUserKey = 'hikaye_portali_auth_user';
    }
    
    // Kullanıcı verisini yükler
    async loadUsers() {
        // Önce önbellekten kontrol et
        if (this.usersCache) {
            return this.usersCache;
        }
        
        // LocalStorage'dan kontrol et
        const cachedUsers = localStorage.getItem(this.userStorageKey);
        if (cachedUsers) {
            try {
                this.usersCache = JSON.parse(cachedUsers);
                return this.usersCache;
            } catch (error) {
                console.error('Kullanıcı önbelleği okuma hatası:', error);
            }
        }
        
        // JSON dosyasından yükle
        try {
            const response = await fetch(this.usersPath);
            if (!response.ok) {
                throw new Error('Kullanıcı verisi yüklenemedi');
            }
            
            this.usersCache = await response.json();
            
            // LocalStorage'a kaydet
            localStorage.setItem(this.userStorageKey, JSON.stringify(this.usersCache));
            
            return this.usersCache;
        } catch (error) {
            console.error('Kullanıcı verisi yükleme hatası:', error);
            return [];
        }
    }
    
    // Hikayeleri yükler
    async loadStories() {
        // Önce önbellekten kontrol et
        if (this.storiesCache) {
            return this.storiesCache;
        }
        
        // LocalStorage'dan kontrol et
        const cachedStories = localStorage.getItem(this.storyStorageKey);
        if (cachedStories) {
            try {
                this.storiesCache = JSON.parse(cachedStories);
                return this.storiesCache;
            } catch (error) {
                console.error('Hikaye önbelleği okuma hatası:', error);
            }
        }
        
        // JSON dosyasından yükle
        try {
            const response = await fetch(this.storiesPath);
            if (!response.ok) {
                throw new Error('Hikaye verisi yüklenemedi');
            }
            
            this.storiesCache = await response.json();
            
            // LocalStorage'a kaydet
            localStorage.setItem(this.storyStorageKey, JSON.stringify(this.storiesCache));
            
            return this.storiesCache;
        } catch (error) {
            console.error('Hikaye verisi yükleme hatası:', error);
            return [];
        }
    }
    
    // Yorumları yükler
    async loadComments() {
        // Önce önbellekten kontrol et
        if (this.commentsCache) {
            return this.commentsCache;
        }
        
        // LocalStorage'dan kontrol et
        const cachedComments = localStorage.getItem(this.commentStorageKey);
        if (cachedComments) {
            try {
                this.commentsCache = JSON.parse(cachedComments);
                return this.commentsCache;
            } catch (error) {
                console.error('Yorum önbelleği okuma hatası:', error);
            }
        }
        
        // JSON dosyasından yükle
        try {
            const response = await fetch(this.commentsPath);
            if (!response.ok) {
                throw new Error('Yorum verisi yüklenemedi');
            }
            
            this.commentsCache = await response.json();
            
            // LocalStorage'a kaydet
            localStorage.setItem(this.commentStorageKey, JSON.stringify(this.commentsCache));
            
            return this.commentsCache;
        } catch (error) {
            console.error('Yorum verisi yükleme hatası:', error);
            return [];
        }
    }
    
    // Tüm hikayeleri döndürür
    async getStories(options = {}) {
        const stories = await this.loadStories();
        let result = [...stories];
        
        // Kategori filtresi
        if (options.category && options.category !== 'all') {
            result = result.filter(story => story.category === options.category);
        }
        
        // Sıralama
        if (options.sort) {
            if (options.sort === 'newest') {
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (options.sort === 'oldest') {
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            } else if (options.sort === 'popular') {
                result.sort((a, b) => b.view_count - a.view_count || b.like_count - a.like_count);
            }
        }
        
        // Arama filtresi
        if (options.search) {
            const searchTerm = options.search.toLowerCase();
            result = result.filter(story => 
                story.title.toLowerCase().includes(searchTerm) ||
                story.summary.toLowerCase().includes(searchTerm) ||
                story.tags.toLowerCase().includes(searchTerm)
            );
        }
        
        // Limit ve offset
        if (options.limit) {
            const offset = options.offset || 0;
            result = result.slice(offset, offset + options.limit);
        }
        
        return result;
    }
    
    // ID'ye göre hikaye döndürür
    async getStoryById(id) {
        const stories = await this.loadStories();
        const story = stories.find(s => s.id === parseInt(id));
        
        if (story) {
            // Görüntülenme sayısını artır
            story.view_count++;
            this.saveStories(stories);
        }
        
        return story || null;
    }
    
    // ID'ye göre kullanıcı döndürür
    async getUserById(id) {
        const users = await this.loadUsers();
        const user = users.find(u => u.id === parseInt(id));
        
        if (user) {
            // Şifre hash'ini gizle
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        
        return null;
    }
    
    // Hikayeye göre yorum döndürür
    async getCommentsByStoryId(storyId) {
        const comments = await this.loadComments();
        return comments.filter(c => c.story_id === parseInt(storyId));
    }
    
    // Kullanıcı girişi
    async login(username, password) {
        const users = await this.loadUsers();
        // Not: Gerçek şifre kontrolü yapılmıyor, statik bir gösterim
        const user = users.find(u => u.username === username);
        
        if (user) {
            // Başarılı giriş simülasyonu (uyarı: gerçek kimlik doğrulama değil!)
            const { password_hash, ...userWithoutPassword } = user;
            
            // Kullanıcıyı localStorage'a kaydet
            localStorage.setItem(this.authUserKey, JSON.stringify({
                ...userWithoutPassword,
                token: 'fake-jwt-token-' + Date.now()
            }));
            
            return userWithoutPassword;
        }
        
        return null;
    }
    
    // Mevcut kullanıcı bilgisini döndürür
    getCurrentUser() {
        const userData = localStorage.getItem(this.authUserKey);
        return userData ? JSON.parse(userData) : null;
    }
    
    // Çıkış yapar
    logout() {
        localStorage.removeItem(this.authUserKey);
    }
    
    // Kullanıcı kaydı (simüle edilmiş)
    async register(userData) {
        const users = await this.loadUsers();
        
        // Kullanıcı adı kontrolü
        if (users.some(u => u.username === userData.username)) {
            throw new Error('Bu kullanıcı adı zaten alınmış');
        }
        
        // E-posta kontrolü
        if (users.some(u => u.email === userData.email)) {
            throw new Error('Bu e-posta adresi zaten kayıtlı');
        }
        
        // Yeni kullanıcı oluştur
        const newUser = {
            id: users.length + 1,
            username: userData.username,
            email: userData.email,
            password_hash: 'hashed_password', // Gerçek projede hash kullanılmalı
            real_name: userData.realName || '',
            bio: '',
            profile_image: '/images/default-avatar.png',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'user'
        };
        
        // Kullanıcıyı ekle ve kaydet
        users.push(newUser);
        this.saveUsers(users);
        
        // Şifre bilgisini geri döndürmeden önce kaldır
        const { password_hash, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
    
    // Yeni hikaye ekler
    async addStory(storyData) {
        const stories = await this.loadStories();
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('Hikaye eklemek için giriş yapmalısınız');
        }
        
        // Yeni hikaye oluştur
        const newStory = {
            id: stories.length + 1,
            title: storyData.title,
            content: storyData.content,
            summary: storyData.summary || '',
            category: storyData.category,
            tags: storyData.tags || '',
            status: storyData.status || 'published',
            image_url: storyData.image_url || '/images/default-cover.jpg',
            user_id: currentUser.id,
            username: currentUser.username,
            real_name: currentUser.real_name || '',
            profile_image: currentUser.profile_image || '/images/default-avatar.png',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            view_count: 0,
            like_count: 0,
            comment_count: 0
        };
        
        // Hikayeyi ekle ve kaydet
        stories.push(newStory);
        this.saveStories(stories);
        
        return newStory;
    }
    
    // Yeni yorum ekler
    async addComment(commentData) {
        const comments = await this.loadComments();
        const stories = await this.loadStories();
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('Yorum eklemek için giriş yapmalısınız');
        }
        
        // Hikaye kontrolü
        const storyIndex = stories.findIndex(s => s.id === parseInt(commentData.storyId));
        if (storyIndex === -1) {
            throw new Error('Hikaye bulunamadı');
        }
        
        // Yeni yorum oluştur
        const newComment = {
            id: comments.length + 1,
            story_id: parseInt(commentData.storyId),
            user_id: currentUser.id,
            username: currentUser.username,
            profile_image: currentUser.profile_image || '/images/default-avatar.png',
            content: commentData.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Yorumu ekle
        comments.push(newComment);
        this.saveComments(comments);
        
        // Hikayenin yorum sayısını güncelle
        stories[storyIndex].comment_count++;
        this.saveStories(stories);
        
        return newComment;
    }
    
    // Hikayeye beğeni ekler/kaldırır
    async toggleLike(storyId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Beğeni eklemek için giriş yapmalısınız');
        }
        
        const stories = await this.loadStories();
        const storyIndex = stories.findIndex(s => s.id === parseInt(storyId));
        
        if (storyIndex === -1) {
            throw new Error('Hikaye bulunamadı');
        }
        
        // Beğeni durumunu localStorage'da saklayalım
        const likeKey = `story_like_${storyId}_${currentUser.id}`;
        const isLiked = localStorage.getItem(likeKey) === 'true';
        
        if (isLiked) {
            // Beğeniyi kaldır
            stories[storyIndex].like_count = Math.max(0, stories[storyIndex].like_count - 1);
            localStorage.removeItem(likeKey);
        } else {
            // Beğeni ekle
            stories[storyIndex].like_count++;
            localStorage.setItem(likeKey, 'true');
        }
        
        this.saveStories(stories);
        
        return {
            storyId: parseInt(storyId),
            isLiked: !isLiked,
            likeCount: stories[storyIndex].like_count
        };
    }
    
    // Hikayeleri localStorage'a kaydeder
    saveStories(stories) {
        this.storiesCache = stories;
        localStorage.setItem(this.storyStorageKey, JSON.stringify(stories));
    }
    
    // Kullanıcıları localStorage'a kaydeder
    saveUsers(users) {
        this.usersCache = users;
        localStorage.setItem(this.userStorageKey, JSON.stringify(users));
    }
    
    // Yorumları localStorage'a kaydeder
    saveComments(comments) {
        this.commentsCache = comments;
        localStorage.setItem(this.commentStorageKey, JSON.stringify(comments));
    }
    
    // Kullanıcı profili güncelleme
    async updateUserProfile(userData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Profil güncellemek için giriş yapmalısınız');
        }
        
        const users = await this.loadUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            throw new Error('Kullanıcı bulunamadı');
        }
        
        // Kullanıcı bilgilerini güncelle
        users[userIndex] = {
            ...users[userIndex],
            real_name: userData.real_name || users[userIndex].real_name,
            bio: userData.bio || users[userIndex].bio,
            profile_image: userData.profile_image || users[userIndex].profile_image,
            updated_at: new Date().toISOString()
        };
        
        // Kullanıcıları kaydet
        this.saveUsers(users);
        
        // LocalStorage'daki oturum bilgisini güncelle
        const { password_hash, ...userWithoutPassword } = users[userIndex];
        const authData = {
            ...userWithoutPassword,
            token: currentUser.token
        };
        localStorage.setItem(this.authUserKey, JSON.stringify(authData));
        
        return userWithoutPassword;
    }
    
    // Hikaye güncelleme
    async updateStory(storyId, storyData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Hikaye güncellemek için giriş yapmalısınız');
        }
        
        const stories = await this.loadStories();
        const storyIndex = stories.findIndex(s => s.id === parseInt(storyId));
        
        if (storyIndex === -1) {
            throw new Error('Hikaye bulunamadı');
        }
        
        // Yetki kontrolü
        if (stories[storyIndex].user_id !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Bu hikayeyi düzenleme yetkiniz yok');
        }
        
        // Hikaye bilgilerini güncelle
        stories[storyIndex] = {
            ...stories[storyIndex],
            title: storyData.title || stories[storyIndex].title,
            content: storyData.content || stories[storyIndex].content,
            summary: storyData.summary || stories[storyIndex].summary,
            category: storyData.category || stories[storyIndex].category,
            tags: storyData.tags || stories[storyIndex].tags,
            status: storyData.status || stories[storyIndex].status,
            image_url: storyData.image_url || stories[storyIndex].image_url,
            updated_at: new Date().toISOString()
        };
        
        // Hikayeleri kaydet
        this.saveStories(stories);
        
        return stories[storyIndex];
    }
    
    // Hikayeyi sil
    async deleteStory(storyId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Hikaye silmek için giriş yapmalısınız');
        }
        
        const stories = await this.loadStories();
        const storyIndex = stories.findIndex(s => s.id === parseInt(storyId));
        
        if (storyIndex === -1) {
            throw new Error('Hikaye bulunamadı');
        }
        
        // Yetki kontrolü
        if (stories[storyIndex].user_id !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Bu hikayeyi silme yetkiniz yok');
        }
        
        // Hikayeyi sil
        const deletedStory = stories[storyIndex];
        stories.splice(storyIndex, 1);
        
        // Hikayeleri kaydet
        this.saveStories(stories);
        
        // İlgili yorumları sil
        const comments = await this.loadComments();
        const filteredComments = comments.filter(c => c.story_id !== parseInt(storyId));
        
        // Yorumları kaydet
        this.saveComments(filteredComments);
        
        return deletedStory;
    }
    
    // Yorumu sil
    async deleteComment(commentId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Yorum silmek için giriş yapmalısınız');
        }
        
        const comments = await this.loadComments();
        const commentIndex = comments.findIndex(c => c.id === parseInt(commentId));
        
        if (commentIndex === -1) {
            throw new Error('Yorum bulunamadı');
        }
        
        // Yetki kontrolü
        if (comments[commentIndex].user_id !== currentUser.id && currentUser.role !== 'admin') {
            throw new Error('Bu yorumu silme yetkiniz yok');
        }
        
        // Yorumun hikayesini al
        const storyId = comments[commentIndex].story_id;
        
        // Yorumu sil
        const deletedComment = comments[commentIndex];
        comments.splice(commentIndex, 1);
        
        // Yorumları kaydet
        this.saveComments(comments);
        
        // Hikayenin yorum sayısını güncelle
        const stories = await this.loadStories();
        const storyIndex = stories.findIndex(s => s.id === storyId);
        
        if (storyIndex !== -1) {
            stories[storyIndex].comment_count = Math.max(0, stories[storyIndex].comment_count - 1);
            this.saveStories(stories);
        }
        
        return deletedComment;
    }
}

// Singleton olarak kullanılabilmesi için global bir değişken oluştur
const staticData = new StaticDataHandler();

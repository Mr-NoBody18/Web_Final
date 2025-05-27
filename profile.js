// Profil sayfası için JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
    checkAuthStatus();
    
    // DOM elementlerini seç
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const postsGrid = document.getElementById('posts-grid');
    const noPostsMessage = document.getElementById('no-posts-message');
    const profileUsername = document.getElementById('profile-username');
    const profileInitial = document.getElementById('profile-initial');
    const profileBio = document.getElementById('profile-bio');
    const postCount = document.getElementById('post-count');
    
    // Sekme değiştirme işlevi
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Aktif sekme butonunu değiştir
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Aktif içeriği değiştir
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            // Mesajları temizle
            clearMessages();
        });
    });
    
    // Kullanıcı bilgilerini ve gönderilerini yükle
    loadUserProfile();
    loadUserPosts();
    
    // Profil formunu gönderme
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();
        
        // Form verilerini al
        const real_name = document.getElementById('real_name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;
        
        // Profil güncelleme işlemini gerçekleştir
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            }
            
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ real_name, email, age })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
            }
            
            showSuccessMessage(data.message || 'Profil başarıyla güncellendi');
            
            // Kullanıcı bilgilerini localStorage'da güncelle
            const user = JSON.parse(localStorage.getItem('user'));
            user.real_name = real_name;
            user.email = email;
            user.age = age;
            localStorage.setItem('user', JSON.stringify(user));
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
    
    // Şifre değiştirme formunu gönderme
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();
        
        // Form verilerini al
        const current_password = document.getElementById('current_password').value;
        const new_password = document.getElementById('new_password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        
        // Şifre doğrulama
        if (new_password !== confirm_password) {
            showErrorMessage('Yeni şifreler eşleşmiyor');
            return;
        }
        
        if (new_password.length < 6) {
            showErrorMessage('Şifre en az 6 karakter olmalıdır');
            return;
        }
        
        // Şifre değiştirme işlemini gerçekleştir
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            }
            
            const response = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password, new_password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Şifre değiştirilirken bir hata oluştu');
            }
            
            // Formu temizle
            passwordForm.reset();
            
            showSuccessMessage(data.message || 'Şifre başarıyla değiştirildi');
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
    
    // Hesap silme formunu gönderme
    deleteAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();
        
        // Form verilerini al
        const delete_password = document.getElementById('delete_password').value;
        const confirm_delete = document.getElementById('confirm_delete').checked;
        
        if (!confirm_delete) {
            showErrorMessage('Hesabınızı silmek için onay kutusunu işaretlemelisiniz');
            return;
        }
        
        // Hesap silme işlemini gerçekleştir
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            }
            
            // Şifre doğrulama için önce giriş yap
            const user = JSON.parse(localStorage.getItem('user'));
            
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: user.username, 
                    password: delete_password 
                })
            });
            
            if (!loginResponse.ok) {
                throw new Error('Şifre yanlış. Hesap silme işlemi iptal edildi.');
            }
            
            // Hesabı sil
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Hesap silinirken bir hata oluştu');
            }
            
            // Kullanıcı bilgilerini temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            showSuccessMessage('Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...');
            
            // Ana sayfaya yönlendir
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
    
    // Kullanıcı profil bilgilerini yükle
    async function loadUserProfile() {
        try {
            // Önce localStorage'dan kullanıcı bilgilerini al
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (!user || !token) {
                throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            }
            
            // Form alanlarını doldur
            document.getElementById('username').value = user.username;
            document.getElementById('real_name').value = user.real_name;
            document.getElementById('email').value = user.email;
            
            // Profil üst bilgi alanını güncelle
            profileUsername.textContent = user.username;
            profileInitial.textContent = user.username.charAt(0).toUpperCase();
            profileBio.textContent = user.real_name ? `${user.real_name} - Hikaye Portalı Üyesi` : 'Hikaye Portalı Üyesi';
            
            // Sunucudan güncel kullanıcı bilgilerini al
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                // Sunucu hatası varsa sessizce devam et, zaten localStorage'dan bilgileri gösteriyoruz
                console.error('Profil bilgileri alınamadı:', response.statusText);
                return;
            }
            
            const data = await response.json();
            
            // Güncel bilgilerle formu güncelle
            document.getElementById('username').value = data.user.username;
            document.getElementById('real_name').value = data.user.real_name;
            document.getElementById('email').value = data.user.email;
            document.getElementById('age').value = data.user.age;
            
            // localStorage'daki kullanıcı bilgilerini güncelle
            localStorage.setItem('user', JSON.stringify(data.user));
            
        } catch (error) {
            console.error('Profil yükleme hatası:', error.message);
            // Oturum hatası varsa giriş sayfasına yönlendir
            if (error.message.includes('Oturum')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        }
    }
    
    // Kullanıcının gönderilerini yükleme işlevi
    async function loadUserPosts() {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            
            // API'den kullanıcının gönderilerini al
            const response = await fetch('/api/stories/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Gönderiler yüklenirken bir hata oluştu');
            }
            
            const posts = await response.json();
            
            // Gönderi sayısını güncelle
            postCount.textContent = posts.length;
            
            // Gönderileri göster veya boş mesajı göster
            if (posts.length > 0) {
                noPostsMessage.style.display = 'none';
                renderPosts(posts);
            } else {
                noPostsMessage.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Gönderiler yüklenirken bir hata oluştu:', error);
            // Hata durumunda boş mesajı göster
            noPostsMessage.style.display = 'block';
        }
    }
    
    // Gönderileri render etme işlevi
    function renderPosts(posts) {
        // Mevcut gönderileri temizle (boş mesaj hariç)
        Array.from(postsGrid.children).forEach(child => {
            if (child !== noPostsMessage) {
                postsGrid.removeChild(child);
            }
        });
        
        // Her gönderi için kart oluştur
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            // Gönderi içeriğini oluştur
            postCard.innerHTML = `
                <img src="${post.cover_image || 'https://via.placeholder.com/300x180?text=Hikaye+Görseli'}" alt="${post.title}" class="post-image">
                <div class="post-content">
                    <span class="post-category">${post.category || 'Genel'}</span>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span>${formatDate(post.created_at)}</span>
                        <span>${post.view_count || 0} görüntülenme</span>
                    </div>
                </div>
            `;
            
            // Gönderi kartına tıklama olayı ekle
            postCard.addEventListener('click', () => {
                window.location.href = `post_detail.html?id=${post.id}`;
            });
            
            // Gönderi kartını grid'e ekle
            postsGrid.appendChild(postCard);
        });
    }
    
    // Tarih formatı işlevi
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Kullanıcının giriş durumunu kontrol et
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (!token) {
            // Token yoksa giriş sayfasına yönlendir
            window.location.href = '/login.html';
        }
    }
    
    // Hata mesajı göster
    function showErrorMessage(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Sayfayı mesaja kaydır
        errorMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Başarı mesajı göster
    function showSuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Sayfayı mesaja kaydır
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Mesajları temizle
    function clearMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }
});
// Header Loader - Modüler navigasyon barını tüm sayfalara yükler
document.addEventListener('DOMContentLoaded', function() {
    // Header içeriğini yükle
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Header yüklenemedi');
            }
            return response.text();
        })
        .then(data => {
            // Header içeriğini sayfaya ekle
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
                
                // Mobil navigasyon script'ini yükle
                const mobileNavScript = document.createElement('script');
                mobileNavScript.src = 'mobile-nav.js';
                document.body.appendChild(mobileNavScript);
                
                // Kullanıcı oturum durumunu kontrol et ve menüyü güncelle
                updateAuthUI();
                
                // Çıkış yapma butonuna tıklama olayı ekle
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', handleLogout);
                }
            } else {
                console.error('Header placeholder bulunamadı');
            }
        })
        .catch(error => {
            console.error('Header yüklenirken hata oluştu:', error);
        });
    // Sayfa yüklendiğinde aktif sayfayı belirle
    setTimeout(() => {
        const currentPage = window.location.pathname.split('/').pop();
        const navItems = document.querySelectorAll('.nav-links a');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                item.classList.add('active');
            }
        });
    }, 100); // Header yüklendikten sonra çalışması için kısa bir gecikme
});

// Kullanıcı oturum durumuna göre UI'ı güncelle
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const authButtons = document.getElementById('auth-buttons');
    const userProfileContainer = document.getElementById('user-profile-container');
    const userInitial = document.getElementById('user-initial');
    
    if (token && user) {
        // Kullanıcı giriş yapmış
        if (authButtons) authButtons.style.display = 'none';
        if (userProfileContainer) userProfileContainer.style.display = 'block';
        if (userInitial) userInitial.textContent = user.username.charAt(0).toUpperCase();
        
        // Profil dropdown menüsünü ayarla
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', function() {
                const profileDropdown = document.getElementById('profile-dropdown');
                if (profileDropdown) {
                    profileDropdown.classList.toggle('active');
                }
            });
            
            // Dropdown dışına tıklandığında menüyü kapat
            document.addEventListener('click', function(event) {
                const profileDropdown = document.getElementById('profile-dropdown');
                if (profileDropdown && !userProfile.contains(event.target) && !profileDropdown.contains(event.target)) {
                    profileDropdown.classList.remove('active');
                }
            });
        }
    } else {
        // Kullanıcı giriş yapmamış
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfileContainer) userProfileContainer.style.display = 'none';
    }
}

// Çıkış yapma işlemi
async function handleLogout(event) {
    event.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Sunucuya çıkış isteği gönder
            const response = await fetch('/api/auth/logout', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Sunucu yanıtını beklemeden localStorage'ı temizle
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Anasayfaya yönlendir
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Çıkış yapılırken hata oluştu:', error);
        // Hata olsa bile localStorage'ı temizle ve anasayfaya yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}
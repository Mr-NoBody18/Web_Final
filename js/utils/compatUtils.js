// Header yükleyici (tüm eski sayfalar için geçerli)
document.addEventListener('DOMContentLoaded', function() {
    // header-container veya header-placeholder'i ara
    const headerContainer = document.getElementById('header-container') || 
                           document.getElementById('header-placeholder');
                           
    if (headerContainer) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerContainer.innerHTML = data;
                
                // Kullanıcı kimlik bilgilerini güncelle
                updateUserUI();
            })
            .catch(error => {
                console.error('Header yükleme hatası:', error);
                headerContainer.innerHTML = '<p>Header yüklenemedi</p>';
            });
    }
    
    // API isteklerini sunucusuz yapıya yönlendir
    patchFetch();
});

// Kullanıcı UI'ını güncelle
function updateUserUI() {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    // Eğer giriş yapmışsa
    if (token && userInfo) {
        try {
            const user = JSON.parse(userInfo);
            
            // Kullanıcı menüsünü güncelle
            const authButtons = document.getElementById('auth-buttons');
            const userMenu = document.getElementById('user-menu');
            
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                
                const userAvatar = document.getElementById('user-avatar');
                const userName = document.getElementById('user-name');
                
                if (userAvatar) userAvatar.src = user.avatar || './images/avatars/default.svg';
                if (userName) userName.textContent = user.username;
            }
        } catch (error) {
            console.error('Kullanıcı bilgisi okuma hatası:', error);
        }
    }
}

// fetch API'sini değiştir
function patchFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        
        // API isteklerini yakaladık, bunları JSON dosyalara yönlendirelim
        if (url.startsWith('/api/')) {
            console.log('API isteği yakalandı:', url);
            
            // "/api/stories" isteklerini "/data/posts.json" dosyasına yönlendir
            if (url.startsWith('/api/stories')) {
                return originalFetch('/data/posts.json', init).then(response => {
                    return response.json().then(data => {
                        // URL parametrelerini işle
                        const urlObj = new URL(url, window.location.origin);
                        const limit = parseInt(urlObj.searchParams.get('limit')) || 10;
                        
                        // Verileri filtrele (gerçek bir API gibi davran)
                        return new Response(JSON.stringify(
                            data.posts.slice(0, limit)
                        ), {
                            status: 200,
                            headers: {'Content-Type': 'application/json'}
                        });
                    });
                });
            }
            
            // "/api/auth/login" isteklerini işle
            if (url === '/api/auth/login') {
                return new Promise((resolve, reject) => {
                    originalFetch('/data/users.json', init)
                        .then(response => response.json())
                        .then(data => {
                            // İstek gövdesinden kullanıcı adı ve şifreyi al
                            const body = init && init.body ? JSON.parse(init.body) : {};
                            const { username, password } = body;
                            
                            // Kullanıcıyı bul
                            const user = data.users.find(u => 
                                u.username === username && u.password === password);
                            
                            if (!user) {
                                // Kullanıcı bulunamadı
                                resolve(new Response(JSON.stringify({
                                    success: false,
                                    message: 'Geçersiz kullanıcı adı veya şifre'
                                }), {
                                    status: 401,
                                    headers: {'Content-Type': 'application/json'}
                                }));
                                return;
                            }
                            
                            // Token oluştur (basit simülasyon)
                            const token = btoa(username + '_' + new Date().getTime());
                            
                            // Kullanıcı bilgilerini sakla
                            localStorage.setItem('token', token);
                            localStorage.setItem('user', JSON.stringify({
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                avatar: user.avatar,
                                bio: user.bio
                            }));
                            
                            // Başarılı yanıt döndür
                            resolve(new Response(JSON.stringify({
                                success: true,
                                token,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email
                                }
                            }), {
                                status: 200,
                                headers: {'Content-Type': 'application/json'}
                            }));
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
            }
            
            // Diğer API isteklerini JSON dosyalara yönlendir
            const endpoint = url.split('/')[2]; // "/api/endpoint" -> "endpoint"
            return originalFetch(`/data/${endpoint}.json`, init);
        }
        
        // API isteği değilse orijinal fetch'i kullan
        return originalFetch(input, init);
    };
}

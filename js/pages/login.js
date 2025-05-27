// Giriş sayfası için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlatma fonksiyonu
    initPage('Giriş', 'Hesabınıza giriş yapın', 'giriş, login, kullanıcı');
    
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // Form gönderildiğinde
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Hata mesajını temizle
            if (errorMessage) errorMessage.style.display = 'none';
            
            // Form verilerini al
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked || false;
            
            try {
                // DataUtils'den login fonksiyonunu kullan
                const result = await DataUtils.login(username, password);
                
                if (result.success) {
                    // Başarılı mesajı göster ve ana sayfaya yönlendir
                    showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
                    setTimeout(() => {
                        // Yönlendirilecek sayfayı kontrol et
                        const urlParams = new URLSearchParams(window.location.search);
                        const redirectUrl = urlParams.get('redirect') || '/';
                        window.location.href = redirectUrl;
                    }, 1500);
                }
            } catch (error) {
                // Hata mesajını göster
                if (errorMessage) {
                    errorMessage.textContent = error.message;
                    errorMessage.style.display = 'block';
                } else {
                    showErrorMessage(error.message);
                }
            }
        });
    }
});

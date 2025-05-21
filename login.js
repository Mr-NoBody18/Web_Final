// Giriş işlemleri için JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    checkAuthStatus();    // Form gönderildiğinde
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hata mesajını temizle
        errorMessage.style.display = 'none';
        
        // Form verilerini al
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Giriş işlemini staticData handler ile gerçekleştir
        try {
            // StaticDataHandler ile giriş yap
            const user = await staticData.login(username, password);
            
            if (!user) {
                throw new Error('Kullanıcı adı veya şifre hatalı');
            }
            
            // Kullanıcı verileri static handler tarafından localStorage'a kaydediliyor

            // Başarılı mesajı göster ve ana sayfaya yönlendir
            showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            // Hata mesajını göster
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });

    // Kullanıcının giriş durumunu kontrol et
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // Token varsa ana sayfaya yönlendir
            window.location.href = '/';
        }
    }

    // Başarı mesajı göster
    function showSuccessMessage(message) {
        // Hata mesajı elementini başarı mesajı olarak kullan
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-success';
        errorMessage.style.display = 'block';
    } 
});
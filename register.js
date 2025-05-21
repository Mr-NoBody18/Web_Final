// Kayıt işlemleri için JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    checkAuthStatus();

    // Form gönderildiğinde
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hata mesajını temizle
        errorMessage.style.display = 'none';
        
        // Form verilerini al
        const username = document.getElementById('username').value;
        const real_name = document.getElementById('real_name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        const terms = document.getElementById('terms').checked;
        
        // Form doğrulama
        if (!terms) {
            showError('Kullanım şartlarını kabul etmelisiniz');
            return;
        }
        
        if (password !== confirm_password) {
            showError('Şifreler eşleşmiyor');
            return;
        }
        
        if (password.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır');
            return;
        }
        
        // Kayıt işlemini gerçekleştir
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, real_name, email, age, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Kayıt olurken bir hata oluştu');
            }

            // Token'ı localStorage'a kaydet
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Başarılı mesajı göster ve ana sayfaya yönlendir
            showSuccessMessage('Kayıt başarılı! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            // Hata mesajını göster
            showError(error.message);
        }
    });

    // Hata mesajı göster
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-error';
        errorMessage.style.display = 'block';
    }

    // Başarı mesajı göster
    function showSuccessMessage(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-success';
        errorMessage.style.display = 'block';
    }

    // Kullanıcının giriş durumunu kontrol et
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // Token varsa ana sayfaya yönlendir
            window.location.href = '/';
        }
    }
});
// Kayıt sayfası için JavaScript kodları
document.addEventListener('DOMContentLoaded', function() {
    // Sayfa başlatma fonksiyonu
    initPage('Kayıt Ol', 'Yeni hesap oluşturun', 'kayıt, register, kullanıcı');
    
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Form gönderildiğinde
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Mesajları temizle
            if (errorMessage) errorMessage.style.display = 'none';
            if (successMessage) successMessage.style.display = 'none';
            
            // Form verilerini al
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const agreeTerms = document.getElementById('agree-terms')?.checked || false;
            
            // Doğrulama
            if (password !== confirmPassword) {
                if (errorMessage) {
                    errorMessage.textContent = 'Şifreler eşleşmiyor.';
                    errorMessage.style.display = 'block';
                } else {
                    showErrorMessage('Şifreler eşleşmiyor.');
                }
                return;
            }
            
            if (!agreeTerms) {
                if (errorMessage) {
                    errorMessage.textContent = 'Kullanım koşullarını kabul etmelisiniz.';
                    errorMessage.style.display = 'block';
                } else {
                    showErrorMessage('Kullanım koşullarını kabul etmelisiniz.');
                }
                return;
            }
            
            try {
                // Mevcut kullanıcıları yükle
                const usersData = await DataUtils.loadData('users');
                if (!usersData) {
                    throw new Error('Kullanıcı verileri yüklenemedi');
                }
                
                // Kullanıcı adı veya e-posta zaten kullanılıyor mu kontrol et
                const existingUser = usersData.users.find(u => 
                    u.username === username || u.email === email);
                
                if (existingUser) {
                    throw new Error('Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor.');
                }
                
                // Yeni kullanıcı oluştur
                const newUser = {
                    id: usersData.users.length + 1,
                    username,
                    email,
                    password, // Gerçek projede şifre hash'lenmelidir!
                    avatar: './images/avatars/default.svg',
                    bio: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                // Kullanıcıyı users dizisine ekle
                usersData.users.push(newUser);
                
                // Verileri kaydet (gerçek uygulamada bir API çağrısı olacaktı)
                await DataUtils.saveData('users', usersData);
                
                // Başarılı mesajı göster
                if (successMessage) {
                    successMessage.textContent = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
                    successMessage.style.display = 'block';
                } else {
                    showSuccessMessage('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
                }
                
                // Giriş sayfasına yönlendir
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                
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

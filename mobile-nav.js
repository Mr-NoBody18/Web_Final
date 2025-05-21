// Mobile Navigation Script
// toggleMobileMenu fonksiyonu tanımı - header.html'deki onclick olayı için
function toggleMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.getElementById('nav-links');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (mobileMenuButton && mainNav && menuOverlay) {
        mainNav.classList.toggle('active');
        mobileMenuButton.classList.toggle('menu-active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        
        // Menü açık/kapalı durumuna göre buton içeriğini değiştir
        const menuIcon = mobileMenuButton.querySelector('.menu-icon');
        if (menuIcon) {
            menuIcon.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
        }
        
        // Menü açıldığında z-index değerini artır
        if (mainNav.classList.contains('active')) {
            mobileMenuButton.style.zIndex = '1002';
        } else {
            mobileMenuButton.style.zIndex = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü butonunu ve ilgili elementleri seç
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.getElementById('nav-links');
    const menuOverlay = document.getElementById('menu-overlay');
    
    // Header yüklendikten sonra profil dropdown elementlerini seçmek için bir gecikme ekleyelim
    setTimeout(() => {
        const userProfileButton = document.getElementById('user-profile-button');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        // Profil dropdown menüsü işlevselliği
        if (userProfileButton && profileDropdown) {
            // Profil butonuna tıklama olayı ekle
            userProfileButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Tıklama olayının dışarı yayılmasını engelle
                profileDropdown.classList.toggle('active');
            });
            
            // Dropdown menü dışında bir yere tıklandığında menüyü kapat
            document.addEventListener('click', function(e) {
                if (!userProfileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('active');
                }
            });
            
            // Dropdown menü öğelerine tıklama olayları ekle
            const dropdownItems = profileDropdown.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', function() {
                    // Burada ilgili işlevselliği ekleyebilirsiniz
                    profileDropdown.classList.remove('active');
                });
            });
        }
    }, 300); // Header yüklenmesi için yeterli süre
    
    // Mobil menü işlevselliği
    if (mobileMenuButton && mainNav && menuOverlay) {
        // Menü butonuna tıklama olayı ekle
        mobileMenuButton.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            mobileMenuButton.classList.toggle('menu-active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
            
            // Menü açık/kapalı durumuna göre buton içeriğini değiştir
            const menuIcon = this.querySelector('.menu-icon');
            if (menuIcon) {
                menuIcon.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
            }
            
            // Menü açıldığında z-index değerini artır
            if (mainNav.classList.contains('active')) {
                this.style.zIndex = '1002';
            } else {
                this.style.zIndex = '';
            }
        });
        
        // Overlay'e tıklama olayı ekle
        menuOverlay.addEventListener('click', function() {
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileMenuButton) {
                const menuIcon = mobileMenuButton.querySelector('.menu-icon');
                if (menuIcon) {
                    menuIcon.textContent = '☰';
                }
                mobileMenuButton.classList.remove('menu-active');
                mobileMenuButton.style.zIndex = '';
            }
        });
    }
    
    // Profil dropdown menüsü işlevselliği setTimeout içine taşındı
    
    // Pencere boyutu değiştiğinde menüyü kapat
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            if (mainNav) mainNav.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileMenuButton) {
                const menuIcon = mobileMenuButton.querySelector('.menu-icon');
                if (menuIcon) {
                    menuIcon.textContent = '☰';
                }
                mobileMenuButton.classList.remove('menu-active');
                mobileMenuButton.style.zIndex = '';
            }
        }
    });
});
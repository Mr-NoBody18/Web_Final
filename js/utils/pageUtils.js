// Sayfa yükleme ve navigasyon için genel yardımcı fonksiyonlar

// Sayfa header'ını yükle
async function loadHeader() {
  try {
    const response = await fetch('./header.html');
    if (!response.ok) {
      throw new Error('Header yüklenemedi');
    }
    const headerHtml = await response.text();
    document.getElementById('header-container').innerHTML = headerHtml;

    // Giriş durumunu kontrol et ve UI'ı güncelle
    updateHeaderUI();
    
    // Mobil menü işlevselliğini ekle
    initMobileMenu();
  } catch (error) {
    console.error('Header yükleme hatası:', error);
  }
}

// Header UI'ını kullanıcı giriş durumuna göre güncelle
function updateHeaderUI() {
  const isLoggedIn = localStorage.getItem('token') !== null;
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  
  if (!authButtons || !userMenu) return;
  
  if (isLoggedIn) {
    // Kullanıcı giriş yapmış
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    
    // Kullanıcı bilgilerini göster
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('user-avatar').src = user.avatar || './images/avatars/default.svg';
    document.getElementById('user-name').textContent = user.username;
  } else {
    // Kullanıcı giriş yapmamış
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

// Mobil menü işlevselliğini başlat
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
}

// Sayfa başlığını ve meta verilerini ayarla
function setPageMeta(title, description, keywords) {
  document.title = title ? `${title} - Trae` : 'Trae';
  
  // Meta açıklama
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description || 'Trae - Hikayeler ve Paylaşımlar';
  
  // Meta anahtar kelimeler
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.content = keywords || 'trae, hikayeler, paylaşım, blog';
}

// URL parametrelerini almak için yardımcı fonksiyon
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Kullanıcı giriş durumunu kontrol et
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const currentPath = window.location.pathname;
  
  const publicPages = ['/', '/index.html', '/login.html', '/register.html'];
  const authRequiredPages = ['/profile.html', '/post_editor.html'];
  
  if (!token && authRequiredPages.some(page => currentPath.endsWith(page))) {
    // Giriş yapılmamış ve korumalı bir sayfa
    window.location.href = '/login.html?redirect=' + encodeURIComponent(currentPath);
    return false;
  }
  
  if (token && (currentPath.endsWith('/login.html') || currentPath.endsWith('/register.html'))) {
    // Zaten giriş yapılmışsa ana sayfaya yönlendir
    window.location.href = '/';
    return false;
  }
  
  return true;
}

// Başarı mesajı göster
function showSuccessMessage(message) {
  const messageElement = document.getElementById('success-message') || 
    document.querySelector('.success-message');
    
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // 5 saniye sonra mesajı kapat
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// Hata mesajı göster
function showErrorMessage(message) {
  const messageElement = document.getElementById('error-message') || 
    document.querySelector('.error-message');
    
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // 5 saniye sonra mesajı kapat
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
}

// Sayfa yükleme döngüsü
async function initPage(pageTitle, pageDesc, pageKeywords, needsAuth = false) {
  // Meta verileri ayarla
  setPageMeta(pageTitle, pageDesc, pageKeywords);
  
  // Header'ı yükle
  await loadHeader();
  
  // Kullanıcı doğrulaması gerekiyorsa kontrol et
  if (needsAuth) {
    return checkAuthStatus();
  }
  
  return true;
}

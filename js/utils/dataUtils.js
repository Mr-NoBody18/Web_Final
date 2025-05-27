// Veri işleme için merkezi fonksiyonları içeren yardımcı dosya

// JSON dosyasından veri yükleme
async function loadData(fileName) {
  try {
    const response = await fetch(`./data/${fileName}.json`);
    if (!response.ok) {
      throw new Error(`${fileName} verisi yüklenemedi`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Veri yükleme hatası (${fileName}):`, error);
    return null;
  }
}

// JSON verisini güncelleme (gerçek bir API olmadığı için simüle edilmiş)
// Not: Gerçek bir uygulamada, bu işlev sunucu olmadan çalışamaz
// localStorage kullanımı eklenebilir
async function saveData(fileName, data) {
  // Gerçek bir uygulamada, burada fetch API ile POST isteği yapılacaktır
  // Ancak, sunucu olmadan bunu simüle ediyoruz
  console.log(`${fileName} verisi kaydedildi (simülasyon):`, data);
  localStorage.setItem(`${fileName}_data`, JSON.stringify(data));
  return { success: true, message: 'Veriler kaydedildi (simüle edilmiş)' };
}

// Kullanıcı kimlik doğrulama işlemleri (localStorage tabanlı)
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

function login(username, password) {
  return new Promise(async (resolve, reject) => {
    try {
      // Kullanıcıları yükle
      const usersData = await loadData('users');
      if (!usersData) {
        throw new Error('Kullanıcı verileri yüklenemedi');
      }
      
      // Kullanıcıyı bul (gerçek uygulamada şifre hash kontrolü yapılmalı)
      const user = usersData.users.find(u => 
        u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Geçersiz kullanıcı adı veya şifre');
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
      
      resolve({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Ortak kullanılacak yardımcı fonksiyonlar
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Dışa aktarılan fonksiyonlar
const DataUtils = {
  loadData,
  saveData,
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  formatDate
};

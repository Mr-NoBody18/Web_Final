/**
 * Güncel Haberler Sitesi - Sohbet Botu JavaScript Dosyası
 * Bu dosya, siteye entegre edilmiş kompakt ve açılır-kapanır sohbet botunun işlevselliğini sağlar.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sohbet botu arayüzünü oluştur
    createChatbotInterface();
    
    // Sohbet botu işlevselliğini ayarla
    setupChatbotFunctionality();
});

/**
 * Sohbet botu arayüzünü oluşturur ve sayfaya ekler
 */
function createChatbotInterface() {
    // Ana sohbet botu konteynerini oluştur
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    // Sohbet botu içeriğini oluştur
    chatbotContainer.innerHTML = `
        <div class="chatbot-toggle">
            <div class="chatbot-icon">
                <i class="chat-icon">💬</i>
                <i class="close-icon">✖</i>
            </div>
        </div>
        <div class="chatbot-box">
            <div class="chatbot-header">
                <div class="chatbot-title">Sohbet Asistanı</div>
                <div class="chatbot-minimize">_</div>
            </div>
            <div class="chatbot-messages">
                <div class="message bot-message">
                    <div class="message-content">Merhaba! Güncel Haberler sitesinde size nasıl yardımcı olabilirim? 📰</div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" class="chatbot-input" placeholder="Mesajınızı yazın...">
                <button class="chatbot-send">Gönder</button>
            </div>
        </div>
    `;
    
    // Sohbet botunu sayfaya ekle
    document.body.appendChild(chatbotContainer);
    
    // Sohbet botu için CSS stillerini ekle
    addChatbotStyles();
}

/**
 * Sohbet botu için CSS stillerini oluşturur ve sayfaya ekler
 */
function addChatbotStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .chatbot-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #e94560;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s, background-color 0.3s;
        }
        
        .chatbot-toggle:hover {
            transform: scale(1.05);
            background-color: #d13354;
        }
        
        .chatbot-icon {
            color: white;
            font-size: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .chat-icon, .close-icon {
            position: absolute;
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .close-icon {
            opacity: 0;
            transform: scale(0);
        }
        
        .chatbot-container.open .chat-icon {
            opacity: 0;
            transform: scale(0);
        }
        
        .chatbot-container.open .close-icon {
            opacity: 1;
            transform: scale(1);
        }
        
        .chatbot-box {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 320px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s, opacity 0.3s;
            transform: scale(0);
            transform-origin: bottom right;
            opacity: 0;
            height: 400px;
        }
        
        .chatbot-container.open .chatbot-box {
            transform: scale(1);
            opacity: 1;
        }
        
        .chatbot-header {
            background-color: #1a1a2e;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-title {
            font-weight: bold;
            font-size: 16px;
        }
        
        .chatbot-minimize {
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
        }
        
        .chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 18px;
            margin-bottom: 5px;
        }
        
        .bot-message {
            align-self: flex-start;
            background-color: #f1f1f1;
            color: #333;
        }
        
        .user-message {
            align-self: flex-end;
            background-color: #e94560;
            color: white;
        }
        
        .chatbot-input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid #eee;
        }
        
        .chatbot-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        
        .chatbot-send {
            background-color: #e94560;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 15px;
            margin-left: 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .chatbot-send:hover {
            background-color: #d13354;
        }
        
        .loading .message-content {
            display: flex;
            align-items: center;
        }
        
        .loading .message-content:after {
            content: "";
            width: 20px;
            height: 20px;
            margin-left: 10px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #e94560;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .chatbot-box {
                width: 280px;
                right: 0;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Sohbet botu işlevselliğini ayarlar
 */
function setupChatbotFunctionality() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotMinimize = document.querySelector('.chatbot-minimize');
    const chatbotInput = document.querySelector('.chatbot-input');
    const chatbotSend = document.querySelector('.chatbot-send');
    const chatbotMessages = document.querySelector('.chatbot-messages');
    
    // API Anahtarı (Gerçek uygulamada bu değer güvenli bir şekilde saklanmalıdır)
    const API_KEY = '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';
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Sohbet botunu aç/kapat
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.toggle('open');
    });
    
    // Sohbet botunu küçült
    chatbotMinimize.addEventListener('click', function() {
        chatbotContainer.classList.remove('open');
    });
    
    // Mesaj gönderme işlevi
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message === '') return;
        
        // Kullanıcı mesajını ekle
        addMessage(message, 'user');
        
        // Giriş alanını temizle
        chatbotInput.value = '';
        
        // Yükleniyor mesajı göster
        const loadingId = showLoadingMessage();
        
        // Yapay zeka API'sine istek gönder
        getAIResponse(message)
            .then(response => {
                // Yükleniyor mesajını kaldır
                removeLoadingMessage(loadingId);
                // Bot yanıtını ekle
                addMessage(response, 'bot');
            })
            .catch(error => {
                // Yükleniyor mesajını kaldır
                removeLoadingMessage(loadingId);
                // Hata durumunda yedek yanıt kullan
                console.error('AI API Hatası:', error);
                const fallbackResponse = getFallbackResponse(message);
                addMessage(fallbackResponse, 'bot');
            });
    }
    
    // Yükleniyor mesajı göster
    function showLoadingMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'message bot-message loading';
        loadingElement.innerHTML = '<div class="message-content">Yanıt hazırlanıyor...</div>';
        
        const loadingId = 'loading-' + Date.now();
        loadingElement.id = loadingId;
        
        chatbotMessages.appendChild(loadingElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        return loadingId;
    }
    
    // Yükleniyor mesajını kaldır
    function removeLoadingMessage(id) {
        const loadingElement = document.getElementById(id);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    // Yapay zeka API'sine istek gönder
    async function getAIResponse(message) {
        try {
            // API isteği için veri hazırla
            const requestData = {
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: [
                    {
                        role: "system",
                        content: `Sen Güncel Haberler web sitesinin uzman sohbet asistanısın. Bu sitenin özelliklerini biliyorsun:
                        
                        SİTE ÖZELLİKLERİ:
                        - Ana Sayfa: Güncel haberler ve trending konular
                        - Forum: Kullanıcıların güncel konuları tartıştığı alan
                        - Profil: Kullanıcı profil yönetimi
                        - Today: Günün öne çıkan haberleri
                        - Discover: Keşfet sayfası, çeşitli içerikler
                        - İletişim: Site ile iletişim kurma
                        - Hakkında: Site hakkında bilgiler
                        
                        YANIT İLKELERİN:
                        - Türkçe yanıt ver
                        - Kısa ve öz ol (max 150 karakter)
                        - Site özelliklerini tanıt
                        - Yardımcı ve samimi ol
                        - Haber içeriği sorularında sitenin ilgili bölümlerini öner
                        
                        Kullanıcıları sitenin farklı sayfalarına yönlendir ve site içeriğiyle alakalı yardım et.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            };

            // API isteği gönder
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Güncel Haberler Sitesi'
                },
                body: JSON.stringify(requestData)
            });

            // Yanıtı işle
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Yanıt Detayı:', errorText);
                throw new Error(`API yanıt hatası: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API yanıtı beklenenden farklı format');
            }
            
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error('API isteği sırasında hata:', error);
            throw error;
        }
    }
    
    // Gönder butonuna tıklama
    chatbotSend.addEventListener('click', sendMessage);
    
    // Enter tuşuna basma
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Mesaj ekleme fonksiyonu
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `<div class="message-content">${message}</div>`;
        
        chatbotMessages.appendChild(messageElement);
        
        // Otomatik kaydırma
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // API bağlantısı başarısız olduğunda site-odaklı yedek yanıtlar
    function getFallbackResponse(message) {
        message = message.toLowerCase();
        
        // Selamlama ve nezaket
        if (message.includes('merhaba') || message.includes('selam') || message.includes('hey')) {
            return 'Merhaba! Güncel Haberler sitesinde size nasıl yardımcı olabilirim? 📰';
        } 
        else if (message.includes('teşekkür') || message.includes('sağol')) {
            return 'Rica ederim! Sitemizdeki diğer sayfalarla ilgili sorularınız varsa sorabilirsiniz. 😊';
        }
        
        // Site navigasyonu ve özellikler
        else if (message.includes('haber') || message.includes('gündem') || message.includes('haberler')) {
            return 'En güncel haberleri ana sayfamızdan, günün öne çıkanlarını ise "Today" sayfasından takip edebilirsiniz! 📰';
        }
        else if (message.includes('forum') || message.includes('tartış') || message.includes('konu')) {
            return 'Forum sayfamızda güncel konuları tartışabilir ve kendi konunuzu açabilirsiniz. Toplulukla buluşun! 💬';
        }
        else if (message.includes('profil') || message.includes('hesap')) {
            return 'Profil sayfanızdan hesap bilgilerinizi düzenleyebilir ve yayınlarınızı yönetebilirsiniz. 👤';
        }
        else if (message.includes('keşif') || message.includes('discover') || message.includes('keşfet')) {
            return 'Discover sayfamızda ilginç içerikleri keşfedebilir ve yeni konular bulabilirsiniz! 🔍';
        }
        else if (message.includes('iletişim') || message.includes('ulaş') || message.includes('destek')) {
            return 'İletişim sayfamızdan bize kolayca ulaşabilirsiniz. Her türlü sorunuz için buradayız! 📞';
        }
        else if (message.includes('hakkında') || message.includes('site') || message.includes('kim')) {
            return 'Hakkında sayfamızdan sitemizin misyonu ve vizyonu hakkında bilgi alabilirsiniz! ℹ️';
        }
        
        // Teknik sorular
        else if (message.includes('giriş') || message.includes('login') || message.includes('üye ol')) {
            return 'Giriş yapmak için sağ üst köşedeki "Giriş" butonunu kullanabilirsiniz. Henüz üye değilseniz hemen kayıt olun! 🔐';
        }
        else if (message.includes('kayıt') || message.includes('register') || message.includes('üyelik')) {
            return 'Ücretsiz üyelik için "Kayıt Ol" sayfasını ziyaret edin. Sadece birkaç dakika sürer! ✅';
        }
        else if (message.includes('mobil') || message.includes('telefon')) {
            return 'Sitemiz mobil uyumludur! Telefonunuzdan da rahatlıkla kullanabilirsiniz. 📱';
        }
        
        // İçerik soruları
        else if (message.includes('yeni') || message.includes('son') || message.includes('güncel')) {
            return 'En son haberleri ana sayfamızda bulabilirsiniz. Sürekli güncelliyoruz! 🆕';
        }
        else if (message.includes('spor') || message.includes('ekonomi') || message.includes('teknoloji')) {
            return 'Aradığınız kategori haberlerini ana sayfamızdan ve Discover bölümünden bulabilirsiniz! 🏆💰💻';
        }
        
        // Genel yardım
        else if (message.includes('yardım') || message.includes('nasıl') || message.includes('nerede')) {
            return 'Size yardım etmek için buradayım! Ana menüden istediğiniz sayfaya ulaşabilirsiniz. Spesifik bir konuda yardım ister misiniz? 🤝';
        }
        else if (message.includes('problem') || message.includes('sorun') || message.includes('hata')) {
            return 'Bir sorunla karşılaştınız mı? İletişim sayfamızdan teknik destek alabilir veya burada anlatabilisiniz. 🔧';
        }
        
        // Varsayılan yanıt
        else {
            return 'Anlayamadım, ancak size yardım etmek istiyorum! Ana sayfa, Forum, Profil, Today, Discover, İletişim veya Hakkında sayfalarından hangisiyle ilgili bilgi almak istiyorsunuz? 🤔';
        }
    }
}

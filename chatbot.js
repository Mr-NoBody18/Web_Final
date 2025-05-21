/**
 * Hikaye Portalı - Sohbet Botu JavaScript Dosyası
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
                <i class="chat-icon">📚</i>
                <i class="close-icon">✖</i>
            </div>
        </div>
        <div class="chatbot-box">
            <div class="chatbot-header">
                <div class="chatbot-title">📖 Hikaye Rehberiniz</div>
                <div class="chatbot-minimize">_</div>
            </div>
            <div class="chatbot-messages">
                <div class="message bot-message">
                    <div class="message-content">Merhaba! Hikaye dünyasında size nasıl yardımcı olabilirim? Öneriler, kategoriler veya yazarlar hakkında bilgi almak için sorabilirsiniz.</div>
                </div>
            </div>
            <div class="chatbot-input-container">
                <input type="text" class="chatbot-input" placeholder="Bir soru sorun veya hikaye önerin...">
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
            width: 65px;
            height: 65px;
            border-radius: 50%;
            background-color: #4a6fa5;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
            transition: transform 0.3s, background-color 0.3s;
        }
        
        .chatbot-toggle:hover {
            transform: scale(1.08);
            background-color: #3a5a8c;
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
            bottom: 75px;
            right: 0;
            width: 340px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s, opacity 0.3s;
            transform: scale(0);
            transform-origin: bottom right;
            opacity: 0;
            height: 450px;
            border: 1px solid #e1e5eb;
        }
        
        .chatbot-container.open .chatbot-box {
            transform: scale(1);
            opacity: 1;
        }
        
        .chatbot-header {
            background-color: #4a6fa5;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 10px 10px 0 0;
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
            background-color: #f0f4f8;
            color: #333;
            border-radius: 18px 18px 18px 0;
        }
        
        .user-message {
            align-self: flex-end;
            background-color: #4a6fa5;
            color: white;
            border-radius: 18px 18px 0 18px;
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
            background-color: #4a6fa5;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 18px;
            margin-left: 10px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        
        .chatbot-send:hover {
            background-color: #3a5a8c;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
            border-top: 3px solid #4a6fa5;
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
    const API_KEY = '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'; // Bu kısmı kendi API anahtarınızla değiştirin
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Site içeriği ile ilgili bilgiler
    const SITE_CONTENT = {
        sayfalar: ['Ana Sayfa', 'Keşfet', 'Tarihte Bugün', 'Forum', 'Hakkında', 'İletişim'],
        kategoriler: ['Fantastik', 'Romantik', 'Polisiye', 'Bilim Kurgu', 'Tarih', 'Macera', 'Korku', 'Dram', 'Komedi'],
        popülerHikayeler: ['Zamanın İzinde', 'Gölgeler Vadisi', 'Son Nefes', 'Kayıp Dünya', 'Gece Yolcuları'],
        yazarlar: ['Ahmet Ümit', 'Elif Şafak', 'Sabahattin Ali', 'Orhan Pamuk', 'Zülfü Livaneli']
    };
    
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
        
        chatbotMessages.appendChild(loadingElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        return loadingElement.id = 'loading-' + Date.now();
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
                model: "gpt-3.5-turbo", // veya kullanmak istediğiniz başka bir model
                messages: [
                    {
                        role: "system",
                        content: "Sen Hikaye Portalı web sitesinin interaktif sohbet asistanısın. Görevin kullanıcılara hikayeler, yazarlar, kategoriler, okuma önerileri, site özellikleri ve genel sorular hakkında yardımcı olmaktır. Hikaye Portalı'nda farklı türlerde (fantastik, romantik, polisiye, bilim kurgu, tarih, macera vb.) hikayeler bulunmaktadır. Kullanıcılara hikaye önerilerinde bulunabilir, popüler yazarlar hakkında bilgi verebilir ve site içeriğini nasıl keşfedecekleri konusunda rehberlik edebilirsin. Yanıtların kısa, samimi, bilgilendirici ve her zaman Türkçe olmalıdır. Kullanıcıları forum sayfasına yönlendirebilir, yeni hikayeleri keşfetmelerine yardımcı olabilirsin."
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
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestData)
            });

            // Yanıtı işle
            if (!response.ok) {
                throw new Error(`API yanıt hatası: ${response.status}`);
            }

            const data = await response.json();
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
    
    // API bağlantısı başarısız olduğunda yedek yanıtlar
    function getFallbackResponse(message) {
        message = message.toLowerCase();
        
        if (message.includes('merhaba') || message.includes('selam')) {
            return 'Merhaba! Hikaye dünyasına hoş geldiniz. Size nasıl yardımcı olabilirim?';
        } else if (message.includes('teşekkür')) {
            return 'Rica ederim! Keyifli okumalar dilerim. Başka bir konuda yardıma ihtiyacınız olursa buradayım.';
        } else if (message.includes('hikaye') || message.includes('öykü')) {
            return 'Hikaye Portalı\'nda farklı kategorilerde binlerce hikaye bulabilirsiniz. Fantastik, romantik, polisiye, bilim kurgu, tarih ve macera türlerinde popüler hikayelere ana sayfadan ulaşabilir veya kategoriler üzerinden detaylı arama yapabilirsiniz.';
        } else if (message.includes('yazar') || message.includes('yazar')) {
            return 'Portalımızda yerli ve yabancı birçok ünlü yazarın eserleri bulunmaktadır. Yazar sayfamızdan tüm yazarları görebilir ve eserlerine ulaşabilirsiniz. En çok okunan yazarlarımız arasında klasikler ve modern yazarlar yer almaktadır.';
        } else if (message.includes('kategori') || message.includes('tür')) {
            return 'Hikaye Portalı\'nda fantastik, romantik, polisiye, bilim kurgu, tarih, macera, korku, dram, komedi ve daha birçok kategoride hikayeler bulabilirsiniz. Kategoriler sayfamızdan ilgi alanınıza göre hikayeleri filtreleyebilirsiniz.';
        } else if (message.includes('öneri') || message.includes('tavsiye')) {
            return 'Size özel hikaye önerileri için ilgi alanlarınızı belirtebilirsiniz. En popüler hikayelerimiz arasında "Zamanın İzinde", "Gölgeler Vadisi" ve "Son Nefes" bulunmaktadır. Ayrıca haftanın önerilen hikayeleri ana sayfada yer almaktadır.';
        } else if (message.includes('forum') || message.includes('konu') || message.includes('tartışma')) {
            return 'Forum sayfamızda hikayeler hakkında tartışabilir, yazarlarla iletişime geçebilir ve kendi konunuzu açabilirsiniz. Ayrıca okuma gruplarına katılabilir ve diğer okuyucularla fikir alışverişinde bulunabilirsiniz.';
        } else if (message.includes('iletişim') || message.includes('destek')) {
            return 'İletişim sayfamızdan bize ulaşabilirsiniz. Ayrıca sosyal medya hesaplarımızı takip ederek güncel duyuru ve etkinliklerden haberdar olabilirsiniz. Teknik destek için destek@hikayeportali.com adresine e-posta gönderebilirsiniz.';
        } else if (message.includes('üyelik') || message.includes('hesap') || message.includes('kayıt')) {
            return 'Hikaye Portalı\'na üye olarak kişisel kitaplığınızı oluşturabilir, favori hikayelerinizi kaydedebilir ve okuma listenizi yönetebilirsiniz. Üyelik tamamen ücretsizdir ve sadece bir e-posta adresi ile kayıt olabilirsiniz.';
        } else if (message.includes('yeni') || message.includes('güncel')) {
            return 'Portalımıza her gün yeni hikayeler eklenmektedir. Ana sayfadaki "Yeni Eklenenler" bölümünden en son hikayeleri görebilir veya haftalık bültenimize abone olarak güncellemelerden haberdar olabilirsiniz.';
        } else {
            return 'Şu anda yanıt verirken bir sorun oluştu. Hikayeler, yazarlar, kategoriler veya site özellikleri hakkında sorularınızı daha net bir şekilde iletebilirsiniz. Alternatif olarak, iletişim sayfamızdan bize ulaşabilirsiniz.';
        }
    }
}
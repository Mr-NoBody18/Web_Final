// json-editor.js - JSON dosyalarını doğrudan düzenlemek için yardımcı araç

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elemanları
    const fileSelector = document.getElementById('file-selector');
    const editorContainer = document.getElementById('editor-container');
    const jsonEditor = document.getElementById('json-editor');
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');
    const statusMessage = document.getElementById('status-message');
    
    // JSON Dosyaları
    const jsonFiles = {
        users: '/static_data/users.json',
        stories: '/static_data/stories.json',
        comments: '/static_data/comments.json'
    };
    
    let currentFile = null;
    
    // Dosya seçicisi değiştiğinde
    fileSelector.addEventListener('change', function() {
        const selectedFile = this.value;
        if (selectedFile && jsonFiles[selectedFile]) {
            loadJsonFile(jsonFiles[selectedFile]);
        }
    });
    
    // JSON dosyasını yükle
    function loadJsonFile(filePath) {
        showStatus('Dosya yükleniyor...', 'info');
        currentFile = filePath;
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Dosya yüklenemedi');
                }
                return response.json();
            })
            .then(data => {
                // JSON'u güzel bir şekilde formatlayarak editöre yükle
                jsonEditor.value = JSON.stringify(data, null, 2);
                editorContainer.style.display = 'block';
                showStatus('Dosya başarıyla yüklendi', 'success');
            })
            .catch(error => {
                console.error('Dosya yükleme hatası:', error);
                showStatus('Dosya yükleme hatası: ' + error.message, 'error');
                jsonEditor.value = '';
                editorContainer.style.display = 'none';
            });
    }
    
    // Değişiklikleri kaydet
    saveButton.addEventListener('click', function() {
        if (!currentFile) {
            showStatus('Lütfen önce bir dosya seçin', 'warning');
            return;
        }
        
        try {
            // JSON formatını doğrula
            const jsonData = JSON.parse(jsonEditor.value);
            
            // LocalStorage'a kaydet
            const fileKey = Object.keys(jsonFiles).find(key => jsonFiles[key] === currentFile);
            
            if (fileKey === 'users') {
                localStorage.setItem('hikaye_portali_users', JSON.stringify(jsonData));
            } else if (fileKey === 'stories') {
                localStorage.setItem('hikaye_portali_stories', JSON.stringify(jsonData));
            } else if (fileKey === 'comments') {
                localStorage.setItem('hikaye_portali_comments', JSON.stringify(jsonData));
            }
            
            showStatus('Değişiklikler kaydedildi! Sayfayı yenileyin.', 'success');
            
            // StaticDataHandler sınıfı varsa önbelleklerini temizle
            if (window.staticData) {
                if (fileKey === 'users') window.staticData.usersCache = null;
                if (fileKey === 'stories') window.staticData.storiesCache = null;
                if (fileKey === 'comments') window.staticData.commentsCache = null;
            }
            
        } catch (error) {
            console.error('JSON ayrıştırma hatası:', error);
            showStatus('Geçersiz JSON formatı', 'error');
        }
    });
    
    // Değişiklikleri sıfırla
    resetButton.addEventListener('click', function() {
        if (!currentFile) {
            showStatus('Lütfen önce bir dosya seçin', 'warning');
            return;
        }
        
        if (confirm('Yaptığınız değişiklikler kaybolacak. Emin misiniz?')) {
            loadJsonFile(currentFile);
        }
    });
    
    // Durum mesajı göster
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        
        // Tüm stil sınıflarını temizle
        statusMessage.className = '';
        
        // Tür sınıfını ekle
        statusMessage.classList.add('status', type);
        
        // Mesajı göster
        statusMessage.style.display = 'block';
        
        // Belirli bir süre sonra otomatik gizle (başarı ve bilgi mesajları için)
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }
});

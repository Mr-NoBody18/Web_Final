document.addEventListener('DOMContentLoaded', function() {

    
    // Kartlar için hover efektleri ve tıklama olayları
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        // Hikaye paylaş kartı değilse tıklama olayı ekle
        if (!card.classList.contains('share-story-card')) {
            card.style.cursor = 'pointer';
            
            card.addEventListener('click', function() {
                // Hikaye detay sayfasına yönlendirme
                window.location.href = 'story.html';
            });
        }
        
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = `0 15px 30px rgba(0, 0, 0, 0.4)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = `0 10px 20px rgba(0, 0, 0, 0.3)`;
        });
    });
    
    // Hikaye Paylaş butonu (kalem simgesi) için yönlendirme
    const submitStoryButton = document.querySelector('.submit-story');
    if (submitStoryButton) {
        submitStoryButton.addEventListener('click', function() {
            window.location.href = 'editor.html';
        });
    }
    
    // Arama çubuğu işlevselliği
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.1)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // Arama işlevi (ileride eklenecek)
                alert(`"${this.value}" için arama sonuçları yakında gösterilecek!`);
            }
        });
    }
    
    // Günün tarihini otomatik güncelleme
    const todayDateElement = document.querySelector('.today-date');
    if (todayDateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('tr-TR', options);
        todayDateElement.textContent = `${formattedDate} - Bugün Tarihte`;
    }
});
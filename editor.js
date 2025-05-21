// Bildirim gösterme fonksiyonu
function showNotification(message, type) {
    // Mevcut bildirimleri temizle
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Bildirim stillerini ekle
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = '#fff';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Bildirim tipine göre arka plan rengini ayarla
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#F44336';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#FF9800';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }
    
    // Bildirimi sayfaya ekle
    document.body.appendChild(notification);
    
    // Bildirimi göster
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Bildirimi otomatik kapat
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Düzenleyici Bileşenleri
    const editorWorkspace = document.querySelector('.editor-workspace');
    const editorPages = document.querySelectorAll('.editor-page');
    const propertiesPanel = document.querySelector('.block-properties-panel');
    const noBlockSelected = document.querySelector('.no-block-selected');
    const textBlockProperties = document.querySelector('.text-block-properties');
    const imageBlockProperties = document.querySelector('.image-block-properties');
    const commonBlockProperties = document.querySelector('.common-block-properties');
    
    // Araç Çubuğu Butonları
    const addTextBtn = document.querySelector('[data-action="add-text"]');
    const addImageBtn = document.querySelector('[data-action="add-image"]');
    const toggleGridBtn = document.querySelector('[data-action="toggle-grid"]');
    const undoBtn = document.querySelector('[data-action="undo"]');
    const redoBtn = document.querySelector('[data-action="redo"]');
    const bgColorBtn = document.querySelector('[data-action="background-color"]');
    const bgColorPicker = document.getElementById('background-color-picker');
    const saveButton = document.querySelector('.save-button');
    const previewButton = document.querySelector('.preview-button');
    
    // Sekme Butonları
    const tabButtons = document.querySelectorAll('.tab-button');
    const addPageButton = document.querySelector('.add-page-button');
    
    // Düzenleyici Durumu
    let selectedBlock = null;
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = null;
    let dragOffset = { x: 0, y: 0 };
    let currentPage = 1;
    let pageCount = 7;
    let history = [];
    let historyIndex = -1;
    
    // Izgara Durumu
    let gridEnabled = false;
    let gridSize = 20; // Izgara boyutu (piksel)
    
    // Blok Sayacı (benzersiz ID'ler için)
    let blockCounter = 0;
    
    // Düzenleyici Başlatma
    initEditor();
    
    // Düzenleyici Başlatma Fonksiyonu
    function initEditor() {
        // Araç çubuğu butonları için olay dinleyicileri
        addTextBtn.addEventListener('click', addTextBlock);
        addImageBtn.addEventListener('click', addImageBlock);
        toggleGridBtn.addEventListener('click', toggleGrid);
        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        bgColorBtn.addEventListener('click', () => bgColorPicker.click());
        bgColorPicker.addEventListener('change', changeBackgroundColor);
        saveButton.addEventListener('click', saveContent);
        previewButton.addEventListener('click', previewContent);
        
        // Izgara boyutu kontrolü için olay dinleyicisi
        const gridSizeInput = document.getElementById('grid-size-input');
        if (gridSizeInput) {
            gridSizeInput.addEventListener('change', function() {
                gridSize = parseInt(this.value) || 20;
                if (gridEnabled) {
                    const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
                    currentPageEl.style.setProperty('--grid-size', `${gridSize}px`);
                }
            });
        }
        
        // Sekme butonları için olay dinleyicileri
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchPage(parseInt(button.dataset.page)));
        });
        
        addPageButton.addEventListener('click', addNewPage);
        
        // Çalışma alanı için olay dinleyicileri
        editorWorkspace.addEventListener('mousedown', handleWorkspaceMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Mobil dokunmatik olayları
        editorWorkspace.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        
        // Ekran boyutu değişikliği için olay dinleyicisi
        window.addEventListener('resize', handleWindowResize);
        
        // İlk durumu kaydet
        saveHistoryState();
        
        // İlk yükleme sırasında blokları düzenle
        adjustBlocksForScreenSize();
        
        // İlk sayfayı göster
        switchPage(1);
    }
    
    // Metin Bloğu Ekleme
    function addTextBlock() {
        const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
        const blockId = `block-${++blockCounter}`;
        
        // Ekran genişliğine göre uygun boyutları belirle
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // Mobil cihazlar için daha uygun boyutlar
        const blockWidth = isSmallMobile ? '200px' : (isMobile ? '250px' : '300px');
        const blockHeight = isSmallMobile ? '100px' : (isMobile ? '120px' : '150px');
        
        // Blok oluştur
        const block = document.createElement('div');
        block.className = 'editor-block text-block';
        block.id = blockId;
        block.dataset.type = 'text';
        
        // Mobil cihazlarda daha merkezi bir konum
        const leftPos = isMobile ? `${Math.max(10, (currentPageEl.clientWidth - parseInt(blockWidth)) / 2)}px` : '50px';
        
        block.style.left = leftPos;
        block.style.top = '50px';
        block.style.width = blockWidth;
        block.style.height = blockHeight;
        block.style.zIndex = blockCounter;
        
        const content = document.createElement('div');
        content.className = 'text-block-content';
        content.contentEditable = 'true';
        content.innerHTML = 'Buraya metin girin...';
        
        // Mobil cihazlar için daha büyük yazı tipi
        if (isMobile) {
            content.style.fontSize = isSmallMobile ? '14px' : '16px';
        }
        
        block.appendChild(content);
        addResizeHandles(block);
        currentPageEl.appendChild(block);
        
        selectBlock(block);
        saveHistoryState();
    }
    
    // Görsel Bloğu Ekleme
    function addImageBlock() {
        const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
        const blockId = `block-${++blockCounter}`;
        
        // Ekran genişliğine göre uygun boyutları belirle
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // Mobil cihazlar için daha uygun boyutlar
        const blockWidth = isSmallMobile ? '200px' : (isMobile ? '250px' : '300px');
        const blockHeight = isSmallMobile ? '150px' : (isMobile ? '180px' : '200px');
        
        // Blok oluştur
        const block = document.createElement('div');
        block.className = 'editor-block image-block';
        block.id = blockId;
        block.dataset.type = 'image';
        
        // Mobil cihazlarda daha merkezi bir konum
        const leftPos = isMobile ? `${Math.max(10, (currentPageEl.clientWidth - parseInt(blockWidth)) / 2)}px` : '50px';
        
        block.style.left = leftPos;
        block.style.top = '50px';
        block.style.width = blockWidth;
        block.style.height = blockHeight;
        block.style.zIndex = blockCounter;
        
        const img = document.createElement('img');
        img.src = 'https://via.placeholder.com/300x200?text=Görsel+Ekleyin';
        img.alt = 'Örnek görsel';
        img.style.objectFit = 'contain'; // Mobil için daha iyi görünüm
        
        block.appendChild(img);
        addResizeHandles(block);
        currentPageEl.appendChild(block);
        
        selectBlock(block);
        saveHistoryState();
    }
    
    // Boyutlandırma Tutamaçları Ekleme
    function addResizeHandles(block) {
        const positions = ['nw', 'ne', 'sw', 'se'];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            handle.dataset.handle = pos;
            block.appendChild(handle);
        });
    }
    
    // Izgara Gösterme/Gizleme
    function toggleGrid() {
        const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
        gridEnabled = !gridEnabled;
        
        if (gridEnabled) {
            // Izgara boyutunu CSS değişkeni olarak ayarla
            currentPageEl.style.setProperty('--grid-size', `${gridSize}px`);
            currentPageEl.classList.add('show-grid');
            toggleGridBtn.innerHTML = '<i class="toolbar-icon">📏</i> Izgarayı Gizle';
        } else {
            currentPageEl.classList.remove('show-grid');
            toggleGridBtn.innerHTML = '<i class="toolbar-icon">📏</i> Izgarayı Göster';
        }
    }
    
    // Arka Plan Rengi Değiştirme
    function changeBackgroundColor(e) {
        const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
        currentPageEl.style.backgroundColor = e.target.value;
        saveHistoryState();
    }
    
    // Yeni Sayfa Ekleme
    function addNewPage() {
        // Yeni sayfa numarası her zaman mevcut sayfa sayısının bir fazlası olmalı
        pageCount++;
        const newPageNumber = pageCount;
        
        // Yeni sekme butonu ekleme
        const tabButtonsContainer = document.querySelector('.tab-buttons');
        const newTabButton = document.createElement('button');
        newTabButton.className = 'tab-button';
        newTabButton.dataset.page = newPageNumber;
        newTabButton.textContent = `Sayfa ${newPageNumber}`;
        newTabButton.addEventListener('click', () => switchPage(newPageNumber));
        
        // Silme butonu ekleme
        if (newPageNumber > 1) { // İlk sayfa silinemez
            const deleteButton = document.createElement('span');
            deleteButton.className = 'delete-page-button';
            deleteButton.innerHTML = '&times;';
            deleteButton.title = 'Sayfayı Sil';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Sekme tıklamasını engelle
                deletePage(newPageNumber);
            });
            newTabButton.appendChild(deleteButton);
        }
        
        tabButtonsContainer.appendChild(newTabButton);
        
        // Yeni sayfa ekleme
        const newPage = document.createElement('div');
        newPage.className = 'editor-page';
        newPage.dataset.page = newPageNumber;
        newPage.style.display = 'none';
        editorWorkspace.appendChild(newPage);
        
        // Yeni sayfaya geçiş
        switchPage(newPageNumber);
        saveHistoryState();
    }
    
    // Sayfa Silme
    function deletePage(pageNumber) {
        // İlk sayfayı silmeye izin verme
        if (pageNumber === 1 || pageCount <= 1) {
            alert('İlk sayfa silinemez!');
            return;
        }
        
        // Kullanıcıya onay sor
        if (!confirm(`Sayfa ${pageNumber} silinecek. Devam etmek istiyor musunuz?`)) {
            return;
        }
        
        // Sayfayı ve sekme butonunu kaldır
        const pageToRemove = document.querySelector(`.editor-page[data-page="${pageNumber}"]`);
        const tabToRemove = document.querySelector(`.tab-button[data-page="${pageNumber}"]`);
        
        if (pageToRemove && tabToRemove) {
            // Eğer aktif sayfa siliniyorsa, başka bir sayfaya geç
            if (currentPage === pageNumber) {
                // Önceki sayfaya geç, yoksa sonraki sayfaya
                const newPageNumber = pageNumber > 1 ? pageNumber - 1 : pageNumber + 1;
                switchPage(newPageNumber);
            }
            
            // Sayfayı ve sekme butonunu kaldır
            pageToRemove.remove();
            tabToRemove.remove();
            
            // Kalan sayfaları yeniden numaralandır
            const remainingPages = Array.from(document.querySelectorAll('.editor-page')).sort((a, b) => 
                parseInt(a.dataset.page) - parseInt(b.dataset.page)
            );
            
            const remainingTabs = Array.from(document.querySelectorAll('.tab-button')).sort((a, b) => 
                parseInt(a.dataset.page) - parseInt(b.dataset.page)
            );
            
            // pageCount değerini güncelle
            pageCount = remainingPages.length;
            
            // Sayfaları ve sekmeleri sırayla yeniden numaralandır
            for (let i = 0; i < remainingPages.length; i++) {
                const newPageNum = i + 1;
                const page = remainingPages[i];
                const tab = remainingTabs[i];
                
                // Sayfa numarasını güncelle
                const oldPageNum = parseInt(page.dataset.page);
                page.dataset.page = newPageNum;
                
                // Sekme numarasını ve metnini güncelle
                tab.dataset.page = newPageNum;
                tab.textContent = `Sayfa ${newPageNum}`;
                
                // Silme butonunu yeniden ekle (ilk sayfa hariç)
                if (newPageNum > 1) {
                    // Önce eski silme butonunu kaldır
                    const oldDeleteButton = tab.querySelector('.delete-page-button');
                    if (oldDeleteButton) {
                        oldDeleteButton.remove();
                    }
                    
                    // Yeni silme butonu ekle
                    const deleteButton = document.createElement('span');
                    deleteButton.className = 'delete-page-button';
                    deleteButton.innerHTML = '&times;';
                    deleteButton.title = 'Sayfayı Sil';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Sekme tıklamasını engelle
                        deletePage(newPageNum);
                    });
                    tab.appendChild(deleteButton);
                }
                
                // Eğer bu sayfa aktif sayfaysa, currentPage değişkenini güncelle
                if (oldPageNum === currentPage) {
                    currentPage = newPageNum;
                }
            }
            
            // Geçmiş durumunu kaydet
            saveHistoryState();
        }
    }
    
    // Sayfa Değiştirme
    function switchPage(pageNumber) {
        // Sayfa numarasını integer'a çevir ve geçerlilik kontrolü yap
        const pageNum = parseInt(pageNumber);
        
        // Sayfa numarası undefined veya geçersizse ilk sayfaya dön
        if (!pageNum || isNaN(pageNum) || pageNum < 1 || pageNum > pageCount) {
            console.warn('Geçersiz sayfa numarası, ilk sayfaya yönlendiriliyor');
            return switchPage(1);
        }
        
        // Seçilen sayfayı ve sekme butonunu bul
        const selectedPage = document.querySelector(`.editor-page[data-page="${pageNum}"]`);
        const selectedTabButton = document.querySelector(`.tab-button[data-page="${pageNum}"]`);
        
        if (!selectedPage || !selectedTabButton) {
            console.error(`Sayfa ${pageNum} bulunamadı`);
            return;
        }
        
        // Önce mevcut sayfayı kaydet
        currentPage = pageNum;
        
        // Tüm sayfaları gizle
        document.querySelectorAll('.editor-page').forEach(page => {
            page.style.display = 'none';
        });
        
        // Tüm sekme butonlarını pasif yap
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Seçilen sayfayı göster
        selectedPage.style.display = 'block';
        selectedTabButton.classList.add('active');
        
        // Izgara durumunu güncelle
        if (gridEnabled) {
            selectedPage.classList.add('show-grid');
        } else {
            selectedPage.classList.remove('show-grid');
        }
        
        // Blok seçimini temizle
        clearBlockSelection();
        
        console.log(`Sayfa ${pageNum} gösteriliyor`);
    }
    
    // Çalışma Alanı Fare Olayları
    function handleWorkspaceMouseDown(e) {
        // Eğer tıklanan öğe bir blok veya bloğun içindeki bir öğe ise
        const block = findParentBlock(e.target);
        
        if (block) {
            // Boyutlandırma tutamacına tıklandıysa
            if (e.target.classList.contains('resize-handle')) {
                startResizing(block, e.target, e.clientX, e.clientY);
            } 
            // Bloğa tıklandıysa
            else {
                startDragging(block, e.clientX, e.clientY);
                selectBlock(block);
            }
        } else {
            // Boş alana tıklandıysa seçimi temizle
            clearBlockSelection();
        }
    }
    
    // Fare Hareket Olayı
    function handleMouseMove(e) {
        if (isDragging && selectedBlock) {
            moveBlock(e.clientX, e.clientY);
        } else if (isResizing && selectedBlock && resizeHandle) {
            resizeBlock(e.clientX, e.clientY);
        }
    }
    
    // Fare Bırakma Olayı
    function handleMouseUp() {
        if (isDragging || isResizing) {
            saveHistoryState();
        }
        
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    }
    
    // Dokunmatik Başlangıç Olayı
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Sadece blok etkileşimlerinde varsayılan davranışı engelle
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const block = findParentBlock(target);
            
            if (block) {
                e.preventDefault(); // Sadece blok etkileşiminde engelle
                
                // Dokunmatik hassasiyeti artırmak için küçük bir gecikme ekle
                setTimeout(() => {
                    if (target.classList.contains('resize-handle')) {
                        startResizing(block, target, touch.clientX, touch.clientY);
                    } else {
                        startDragging(block, touch.clientX, touch.clientY);
                        selectBlock(block);
                    }
                }, 10);
            } else {
                // Blok dışına dokunulduğunda seçimi temizle
                clearBlockSelection();
            }
        }
    }
    
    // Dokunmatik Hareket Olayı
    function handleTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            
            // Sadece sürükleme veya boyutlandırma yapılıyorsa varsayılan davranışı engelle
            if ((isDragging && selectedBlock) || (isResizing && selectedBlock && resizeHandle)) {
                e.preventDefault();
                
                // Mobil cihazlarda daha hassas hareket için pozisyon hesaplaması
                const isMobile = window.innerWidth <= 768;
                const sensitivity = isMobile ? 1.2 : 1; // Mobil cihazlarda daha hassas hareket
                
                if (isDragging && selectedBlock) {
                    moveBlock(touch.clientX * sensitivity, touch.clientY * sensitivity);
                } else if (isResizing && selectedBlock && resizeHandle) {
                    resizeBlock(touch.clientX, touch.clientY);
                }
            }
        }
    }
    
    // Dokunmatik Bitiş Olayı
    function handleTouchEnd(e) {
        if (isDragging || isResizing) {
            // Mobil cihazlarda daha iyi deneyim için küçük bir gecikme ekle
            setTimeout(() => {
                saveHistoryState();
                
                isDragging = false;
                isResizing = false;
                resizeHandle = null;
            }, 50);
        } else {
            isDragging = false;
            isResizing = false;
            resizeHandle = null;
        }
    }
    
    // Blok Sürükleme Başlatma
    function startDragging(block, clientX, clientY) {
        isDragging = true;
        selectedBlock = block;
        
        const rect = block.getBoundingClientRect();
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;
    }
    
    // Blok Boyutlandırma Başlatma
    function startResizing(block, handle, clientX, clientY) {
        isResizing = true;
        selectedBlock = block;
        resizeHandle = handle.dataset.handle;
        
        const rect = block.getBoundingClientRect();
        dragOffset.x = clientX;
        dragOffset.y = clientY;
        dragOffset.width = rect.width;
        dragOffset.height = rect.height;
        dragOffset.left = rect.left;
        dragOffset.top = rect.top;
    }
    
    // Izgara Noktasına Yapıştırma
    function snapToGrid(value) {
        if (!gridEnabled) return value;
        return Math.round(value / gridSize) * gridSize;
    }
    
    // Blok Taşıma
    function moveBlock(clientX, clientY) {
        if (!selectedBlock || !isDragging) return;
        
        const workspaceRect = editorWorkspace.getBoundingClientRect();
        const blockRect = selectedBlock.getBoundingClientRect();
        
        // Yeni pozisyonu hesapla
        let newLeft = clientX - dragOffset.x - workspaceRect.left + editorWorkspace.scrollLeft;
        let newTop = clientY - dragOffset.y - workspaceRect.top + editorWorkspace.scrollTop;
        
        // Çalışma alanı sınırları içinde kal
        newLeft = Math.max(0, Math.min(newLeft, workspaceRect.width - blockRect.width));
        newTop = Math.max(0, Math.min(newTop, workspaceRect.height - blockRect.height));
        
        // Izgara aktifse, ızgara noktalarına yapıştır
        if (gridEnabled) {
            newLeft = snapToGrid(newLeft);
            newTop = snapToGrid(newTop);
        }
        
        // Pozisyonu güncelle
        selectedBlock.style.left = `${newLeft}px`;
        selectedBlock.style.top = `${newTop}px`;
        
        // Özellik panelini güncelle
        updatePositionInputs();
    }
    
    // Blok Boyutlandırma
    function resizeBlock(clientX, clientY) {
        if (!selectedBlock || !isResizing || !resizeHandle) return;
        
        const workspaceRect = editorWorkspace.getBoundingClientRect();
        const deltaX = clientX - dragOffset.x;
        const deltaY = clientY - dragOffset.y;
        
        let newWidth = dragOffset.width;
        let newHeight = dragOffset.height;
        let newLeft = parseInt(selectedBlock.style.left);
        let newTop = parseInt(selectedBlock.style.top);
        
        // Tutamaca göre boyutlandırma
        switch (resizeHandle) {
            case 'se':
                newWidth = Math.max(50, dragOffset.width + deltaX);
                newHeight = Math.max(50, dragOffset.height + deltaY);
                break;
            case 'sw':
                newWidth = Math.max(50, dragOffset.width - deltaX);
                newLeft = Math.min(dragOffset.left + deltaX - workspaceRect.left + editorWorkspace.scrollLeft, dragOffset.left + dragOffset.width - 50 - workspaceRect.left + editorWorkspace.scrollLeft);
                newHeight = Math.max(50, dragOffset.height + deltaY);
                break;
            case 'ne':
                newWidth = Math.max(50, dragOffset.width + deltaX);
                newHeight = Math.max(50, dragOffset.height - deltaY);
                newTop = Math.min(dragOffset.top + deltaY - workspaceRect.top + editorWorkspace.scrollTop, dragOffset.top + dragOffset.height - 50 - workspaceRect.top + editorWorkspace.scrollTop);
                break;
            case 'nw':
                newWidth = Math.max(50, dragOffset.width - deltaX);
                newLeft = Math.min(dragOffset.left + deltaX - workspaceRect.left + editorWorkspace.scrollLeft, dragOffset.left + dragOffset.width - 50 - workspaceRect.left + editorWorkspace.scrollLeft);
                newHeight = Math.max(50, dragOffset.height - deltaY);
                newTop = Math.min(dragOffset.top + deltaY - workspaceRect.top + editorWorkspace.scrollTop, dragOffset.top + dragOffset.height - 50 - workspaceRect.top + editorWorkspace.scrollTop);
                break;
        }
        
        // Izgara aktifse, ızgara noktalarına yapıştır
        if (gridEnabled) {
            newWidth = snapToGrid(newWidth);
            newHeight = snapToGrid(newHeight);
            newLeft = snapToGrid(newLeft);
            newTop = snapToGrid(newTop);
        }
        
        // Boyutu ve pozisyonu güncelle
        selectedBlock.style.width = `${newWidth}px`;
        selectedBlock.style.height = `${newHeight}px`;
        selectedBlock.style.left = `${newLeft}px`;
        selectedBlock.style.top = `${newTop}px`;
        
        // Özellik panelini güncelle
        updatePositionInputs();
    }
    
    // Blok Seçme
    function selectBlock(block) {
        // Önceki seçimi temizle
        clearBlockSelection();
        
        // Yeni bloğu seç
        selectedBlock = block;
        selectedBlock.classList.add('selected');
        
        // Özellik panelini göster
        noBlockSelected.style.display = 'none';
        
        // Blok tipine göre özellik panelini göster
        if (block.dataset.type === 'text') {
            textBlockProperties.style.display = 'block';
            imageBlockProperties.style.display = 'none';
        } else if (block.dataset.type === 'image') {
            textBlockProperties.style.display = 'none';
            imageBlockProperties.style.display = 'block';
        }
        
        // Ortak özellikleri göster
        commonBlockProperties.style.display = 'block';
        
        // Özellik panelini güncelle
        updatePropertiesPanel();
    }
    
    // Blok Seçimini Temizleme
    function clearBlockSelection() {
        if (selectedBlock) {
            selectedBlock.classList.remove('selected');
        }
        
        selectedBlock = null;
        
        // Özellik panelini güncelle
        noBlockSelected.style.display = 'block';
        textBlockProperties.style.display = 'none';
        imageBlockProperties.style.display = 'none';
        commonBlockProperties.style.display = 'none';
    }
    
    // Özellik Panelini Güncelleme
    function updatePropertiesPanel() {
        if (!selectedBlock) return;
        
        // Konum ve boyut bilgilerini güncelle
        updatePositionInputs();
        
        // Blok tipine göre özel özellikleri güncelle
        if (selectedBlock.dataset.type === 'text') {
            updateTextProperties();
        } else if (selectedBlock.dataset.type === 'image') {
            updateImageProperties();
        }
        
        // Ortak özellikleri güncelle
        updateCommonProperties();
    }
    
    // Konum ve Boyut Girdilerini Güncelleme
    function updatePositionInputs() {
        if (!selectedBlock) return;
        
        const blockX = document.getElementById('block-x');
        const blockY = document.getElementById('block-y');
        const blockWidth = document.getElementById('block-width');
        const blockHeight = document.getElementById('block-height');
        
        blockX.value = parseInt(selectedBlock.style.left);
        blockY.value = parseInt(selectedBlock.style.top);
        blockWidth.value = parseInt(selectedBlock.style.width);
        blockHeight.value = parseInt(selectedBlock.style.height);
        
        // Konum ve boyut değişikliği olayları
        blockX.onchange = () => {
            selectedBlock.style.left = `${blockX.value}px`;
            saveHistoryState();
        };
        
        blockY.onchange = () => {
            selectedBlock.style.top = `${blockY.value}px`;
            saveHistoryState();
        };
        
        blockWidth.onchange = () => {
            selectedBlock.style.width = `${Math.max(50, blockWidth.value)}px`;
            saveHistoryState();
        };
        
        blockHeight.onchange = () => {
            selectedBlock.style.height = `${Math.max(50, blockHeight.value)}px`;
            saveHistoryState();
        };
    }
    
    // Metin Özelliklerini Güncelleme
    function updateTextProperties() {
        if (!selectedBlock || selectedBlock.dataset.type !== 'text') return;
        
        const textContent = selectedBlock.querySelector('.text-block-content');
        const fontFamily = document.getElementById('text-font-family');
        const fontSize = document.getElementById('text-font-size');
        const textBold = document.getElementById('text-bold');
        const textItalic = document.getElementById('text-italic');
        const textUnderline = document.getElementById('text-underline');
        const textColor = document.getElementById('text-color');
        const alignLeft = document.getElementById('align-left');
        const alignCenter = document.getElementById('align-center');
        const alignRight = document.getElementById('align-right');
        const alignJustify = document.getElementById('align-justify');
        
        // Mevcut değerleri ayarla
        fontFamily.value = textContent.style.fontFamily || 'Arial, sans-serif';
        fontSize.value = textContent.style.fontSize || '16px';
        textColor.value = rgbToHex(textContent.style.color || '#000000');
        
        // Stil butonlarını güncelle
        textBold.classList.toggle('active', textContent.style.fontWeight === 'bold');
        textItalic.classList.toggle('active', textContent.style.fontStyle === 'italic');
        textUnderline.classList.toggle('active', textContent.style.textDecoration === 'underline');
        
        // Hizalama butonlarını güncelle
        alignLeft.classList.toggle('active', textContent.style.textAlign === 'left' || !textContent.style.textAlign);
        alignCenter.classList.toggle('active', textContent.style.textAlign === 'center');
        alignRight.classList.toggle('active', textContent.style.textAlign === 'right');
        alignJustify.classList.toggle('active', textContent.style.textAlign === 'justify');
        
        // Metin özelliği değişikliği olayları
        fontFamily.onchange = () => {
            textContent.style.fontFamily = fontFamily.value;
            saveHistoryState();
        };
        
        fontSize.onchange = () => {
            textContent.style.fontSize = fontSize.value;
            saveHistoryState();
        };
        
        textBold.onclick = () => {
            textContent.style.fontWeight = textContent.style.fontWeight === 'bold' ? 'normal' : 'bold';
            textBold.classList.toggle('active');
            saveHistoryState();
        };
        
        textItalic.onclick = () => {
            textContent.style.fontStyle = textContent.style.fontStyle === 'italic' ? 'normal' : 'italic';
            textItalic.classList.toggle('active');
            saveHistoryState();
        };
        
        textUnderline.onclick = () => {
            textContent.style.textDecoration = textContent.style.textDecoration === 'underline' ? 'none' : 'underline';
            textUnderline.classList.toggle('active');
            saveHistoryState();
        };
        
        textColor.onchange = () => {
            textContent.style.color = textColor.value;
            saveHistoryState();
        };
        
        alignLeft.onclick = () => {
            textContent.style.textAlign = 'left';
            updateAlignButtons(alignLeft);
            saveHistoryState();
        };
        
        alignCenter.onclick = () => {
            textContent.style.textAlign = 'center';
            updateAlignButtons(alignCenter);
            saveHistoryState();
        };
        
        alignRight.onclick = () => {
            textContent.style.textAlign = 'right';
            updateAlignButtons(alignRight);
            saveHistoryState();
        };
        
        alignJustify.onclick = () => {
            textContent.style.textAlign = 'justify';
            updateAlignButtons(alignJustify);
            saveHistoryState();
        };
    }
    
    // Hizalama Butonlarını Güncelleme
    function updateAlignButtons(activeButton) {
        const alignButtons = [document.getElementById('align-left'), document.getElementById('align-center'), document.getElementById('align-right'), document.getElementById('align-justify')];
        
        alignButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        activeButton.classList.add('active');
    }
    
    // Görsel Özelliklerini Güncelleme
    function updateImageProperties() {
        if (!selectedBlock || selectedBlock.dataset.type !== 'image') return;
        
        const img = selectedBlock.querySelector('img');
        const imageUrl = document.getElementById('image-url');
        const imageAlt = document.getElementById('image-alt');
        const imageFit = document.getElementById('image-fit');
        const loadImageBtn = document.getElementById('load-image');
        
        // Mevcut değerleri ayarla
        imageUrl.value = img.src;
        imageAlt.value = img.alt;
        imageFit.value = img.style.objectFit || 'contain';
        
        // Görsel özelliği değişikliği olayları
        loadImageBtn.onclick = () => {
            if (imageUrl.value.trim() !== '') {
                img.src = imageUrl.value;
                saveHistoryState();
            }
        };
        
        imageAlt.onchange = () => {
            img.alt = imageAlt.value;
            saveHistoryState();
        };
        
        imageFit.onchange = () => {
            img.style.objectFit = imageFit.value;
            saveHistoryState();
        };
    }
    
    // Ortak Özellikleri Güncelleme
    function updateCommonProperties() {
        if (!selectedBlock) return;
        
        const blockBgColor = document.getElementById('block-bg-color');
        const blockOpacity = document.getElementById('block-opacity');
        const opacityValue = document.getElementById('opacity-value');
        const moveForward = document.getElementById('move-forward');
        const moveBackward = document.getElementById('move-backward');
        const deleteBlock = document.getElementById('delete-block');
        
        // Mevcut değerleri ayarla
        blockBgColor.value = rgbToHex(selectedBlock.style.backgroundColor || '#ffffff');
        blockOpacity.value = selectedBlock.style.opacity || 1;
        opacityValue.textContent = `${Math.round((blockOpacity.value * 100))}%`;
        
        // Ortak özellik değişikliği olayları
        blockBgColor.onchange = () => {
            selectedBlock.style.backgroundColor = blockBgColor.value;
            saveHistoryState();
        };
        
        blockOpacity.oninput = () => {
            selectedBlock.style.opacity = blockOpacity.value;
            opacityValue.textContent = `${Math.round((blockOpacity.value * 100))}%`;
        };
        
        blockOpacity.onchange = () => {
            saveHistoryState();
        };
        
        moveForward.onclick = () => {
            const zIndex = parseInt(selectedBlock.style.zIndex) || 0;
            selectedBlock.style.zIndex = zIndex + 1;
            saveHistoryState();
        };
        
        moveBackward.onclick = () => {
            const zIndex = parseInt(selectedBlock.style.zIndex) || 0;
            selectedBlock.style.zIndex = Math.max(0, zIndex - 1);
            saveHistoryState();
        };
        
        deleteBlock.onclick = () => {
            if (selectedBlock) {
                selectedBlock.remove();
                clearBlockSelection();
                saveHistoryState();
            }
        };
    }
    
    // RGB Renk Değerini Hex Formatına Dönüştürme
    function rgbToHex(rgb) {
        if (!rgb || rgb.indexOf('#') === 0) return rgb || '#ffffff';
        
        const rgbMatch = rgb.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (!rgbMatch) return '#ffffff';
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    // Ebeveyn Bloğu Bulma
    function findParentBlock(element) {
        while (element && !element.classList.contains('editor-block')) {
            element = element.parentElement;
        }
        return element;
    }
    
    // Geçmiş Durumunu Kaydetme
    function saveHistoryState() {
        // Geçmiş durumunu kaydet
        const state = {
            pages: [],
            currentPage: currentPage
        };
        
        // Tüm sayfaları kaydet
        document.querySelectorAll('.editor-page').forEach(page => {
            const pageState = {
                pageNumber: parseInt(page.dataset.page),
                backgroundColor: page.style.backgroundColor,
                blocks: []
            };
            
            // Sayfadaki tüm blokları kaydet
            page.querySelectorAll('.editor-block').forEach(block => {
                const blockState = {
                    id: block.id,
                    type: block.dataset.type,
                    left: block.style.left,
                    top: block.style.top,
                    width: block.style.width,
                    height: block.style.height,
                    zIndex: block.style.zIndex,
                    backgroundColor: block.style.backgroundColor,
                    opacity: block.style.opacity
                };
                
                // Blok tipine göre özel özellikleri kaydet
                if (block.dataset.type === 'text') {
                    const textContent = block.querySelector('.text-block-content');
                    blockState.content = textContent.innerHTML;
                    blockState.fontFamily = textContent.style.fontFamily;
                    blockState.fontSize = textContent.style.fontSize;
                    blockState.fontWeight = textContent.style.fontWeight;
                    blockState.fontStyle = textContent.style.fontStyle;
                    blockState.textDecoration = textContent.style.textDecoration;
                    blockState.color = textContent.style.color;
                    blockState.textAlign = textContent.style.textAlign;
                } else if (block.dataset.type === 'image') {
                    const img = block.querySelector('img');
                    blockState.src = img.src;
                    blockState.alt = img.alt;
                    blockState.objectFit = img.style.objectFit;
                }
                
                pageState.blocks.push(blockState);
            });
            
            state.pages.push(pageState);
        });
        
        // Geçmiş dizisini güncelle
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        history.push(state);
        historyIndex = history.length - 1;
        
        // Geri/İleri butonlarını güncelle
        updateUndoRedoButtons();
    }
    
    // Geri/İleri Butonlarını Güncelleme
    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= history.length - 1;
        
        undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
        redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
    }
    
    // Geri Alma
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState(history[historyIndex]);
            updateUndoRedoButtons();
        }
    }
    
    // İleri Alma
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            restoreState(history[historyIndex]);
            updateUndoRedoButtons();
        }
    }
    
    // Durumu Geri Yükleme
    function restoreState(state) {
        // Eğer durum verisi yoksa, varsayılan olarak tek sayfa oluştur
        if (!state || !state.pages || !Array.isArray(state.pages) || state.pages.length === 0) {
            // Tüm sayfaları temizle
            document.querySelectorAll('.editor-page').forEach(page => {
                page.remove();
            });
            
            // Tüm sekme butonlarını temizle
            document.querySelectorAll('.tab-button').forEach(button => {
                if (button.dataset.page !== '1') {
                    button.remove();
                }
            });
            
            // Sayfa sayısını sıfırla ve tek sayfa oluştur
            pageCount = 1;
            
            // İlk sayfayı oluştur
            const page = document.createElement('div');
            page.className = 'editor-page';
            page.dataset.page = '1';
            page.style.backgroundColor = '#ffffff';
            page.style.display = 'none';
            page.style.zIndex = '1';
            editorWorkspace.appendChild(page);
            
            // İlk sayfaya geç
            switchPage(1);
            return;
        }
        
        // Tüm sayfaları temizle
        document.querySelectorAll('.editor-page').forEach(page => {
            page.remove();
        });
        
        // Tüm sekme butonlarını temizle
        document.querySelectorAll('.tab-button').forEach(button => {
            if (button.dataset.page !== '1') {
                button.remove();
            }
        });
        
        // Sayfa sayısını sıfırla
        pageCount = 0;
        
        // Sayfaları geri yükle
        state.pages.forEach((pageState, index) => {
            // Sayfa numarasını doğru şekilde ayarla
            const pageNumber = index + 1;
            pageCount = Math.max(pageCount, pageNumber);
            
            // Sayfa oluştur
            const page = document.createElement('div');
            page.className = 'editor-page';
            page.dataset.page = pageNumber;
            page.style.backgroundColor = pageState.backgroundColor || '#ffffff';
            page.style.display = 'none';
            page.style.zIndex = '1';
            editorWorkspace.appendChild(page);
            
            // Sekme butonu oluştur (ilk sayfa için zaten var)
            if (pageNumber > 1) {
                const tabButtonsContainer = document.querySelector('.tab-buttons');
                const tabButton = document.createElement('button');
                tabButton.className = 'tab-button';
                tabButton.dataset.page = pageNumber;
                tabButton.textContent = `Sayfa ${pageNumber}`;
                tabButton.addEventListener('click', () => switchPage(pageNumber));
                
                // Silme butonu ekleme (ilk sayfa hariç)
                if (pageState.pageNumber > 1) {
                    const deleteButton = document.createElement('span');
                    deleteButton.className = 'delete-page-button';
                    deleteButton.innerHTML = '&times;';
                    deleteButton.title = 'Sayfayı Sil';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Sekme tıklamasını engelle
                        deletePage(pageState.pageNumber);
                    });
                    tabButton.appendChild(deleteButton);
                }
                
                tabButtonsContainer.appendChild(tabButton);
            }
            
            // Blokları geri yükle
            pageState.blocks.forEach(blockState => {
                // Blok oluştur
                const block = document.createElement('div');
                block.className = `editor-block ${blockState.type}-block`;
                block.id = blockState.id;
                block.dataset.type = blockState.type;
                block.style.left = blockState.left;
                block.style.top = blockState.top;
                block.style.width = blockState.width;
                block.style.height = blockState.height;
                block.style.zIndex = blockState.zIndex;
                block.style.backgroundColor = blockState.backgroundColor || '';
                block.style.opacity = blockState.opacity || 1;
                
                // Blok tipine göre içerik oluştur
                if (blockState.type === 'text') {
                    const content = document.createElement('div');
                    content.className = 'text-block-content';
                    content.contentEditable = 'true';
                    content.innerHTML = blockState.content || '';
                    content.style.fontFamily = blockState.fontFamily || '';
                    content.style.fontSize = blockState.fontSize || '';
                    content.style.fontWeight = blockState.fontWeight || '';
                    content.style.fontStyle = blockState.fontStyle || '';
                    content.style.textDecoration = blockState.textDecoration || '';
                    content.style.color = blockState.color || '';
                    content.style.textAlign = blockState.textAlign || '';
                    
                    block.appendChild(content);
                } else if (blockState.type === 'image') {
                    const img = document.createElement('img');
                    img.src = blockState.src || '';
                    img.alt = blockState.alt || '';
                    img.style.objectFit = blockState.objectFit || 'contain';
                    
                    block.appendChild(img);
                }
                
                // Boyutlandırma tutamaçları ekle
                addResizeHandles(block);
                
                // Sayfaya ekle
                page.appendChild(block);
            });
        });
        
        // Seçilen sayfaya geç
        switchPage(state.currentPage);
        
        // Blok seçimini temizle
        clearBlockSelection();
    }
    
    // İçeriği Kaydet
    function saveContent() {
        // Tüm sayfaları ve blokları içeren veri yapısını oluştur
        const editorData = {
            pages: [],
            createdAt: new Date().toISOString()
        };
        
        // Her sayfayı işle
        for (let i = 1; i <= pageCount; i++) {
            const pageEl = document.querySelector(`.editor-page[data-page="${i}"]`);
            const pageData = {
                backgroundColor: pageEl.style.backgroundColor || '#ffffff',
                blocks: []
            };
            
            // Sayfadaki tüm blokları işle
            const blocks = pageEl.querySelectorAll('.editor-block');
            blocks.forEach(block => {
                const blockId = block.id;
                const blockType = block.dataset.type;
                const blockData = {
                    id: blockId,
                    type: blockType,
                    position: {
                        x: parseInt(block.style.left) || 0,
                        y: parseInt(block.style.top) || 0,
                        width: parseInt(block.style.width) || 0,
                        height: parseInt(block.style.height) || 0
                    },
                    style: {}
                };
                
                // Blok tipine göre içerik ve stil bilgilerini ekle
                if (blockType === 'text') {
                    blockData.content = block.querySelector('.text-block-content').innerHTML;
                    blockData.style = {
                        fontFamily: block.style.fontFamily,
                        fontSize: block.style.fontSize,
                        color: block.style.color,
                        backgroundColor: block.style.backgroundColor,
                        textAlign: block.style.textAlign,
                        padding: block.style.padding,
                        borderRadius: block.style.borderRadius,
                        opacity: block.style.opacity
                    };
                } else if (blockType === 'image') {
                    const img = block.querySelector('img');
                    blockData.content = img ? img.src : '';
                    blockData.style = {
                        padding: block.style.padding,
                        borderRadius: block.style.borderRadius,
                        opacity: block.style.opacity
                    };
                }
                
                pageData.blocks.push(blockData);
            });
            
            editorData.pages.push(pageData);
        }
        
        // Veriyi JSON formatına dönüştür
        const jsonData = JSON.stringify(editorData, null, 2);
        
        // Veriyi localStorage'a kaydet
        localStorage.setItem('editorContent', jsonData);
        
        // Hikaye başlığını al
        const storyTitle = prompt('Hikaye başlığını girin:', 'Yeni Hikaye');
        if (!storyTitle) {
            showNotification('Hikaye başlığı gereklidir!', 'error');
            return;
        }
        
        // Hikaye kategorisini al
        const categories = ['disasters', 'cars', 'historic', 'creepy', 'science', 'tech'];
        const categoryPrompt = 'Hikaye kategorisini seçin:\n' + 
            categories.map((cat, index) => `${index + 1}. ${getCategoryName(cat)}`).join('\n');
        
        const categoryIndex = prompt(categoryPrompt, '1');
        if (!categoryIndex || isNaN(categoryIndex) || categoryIndex < 1 || categoryIndex > categories.length) {
            showNotification('Geçerli bir kategori seçmelisiniz!', 'error');
            return;
        }
        
        const category = categories[parseInt(categoryIndex) - 1];
        
        // Kapak görseli URL'si (opsiyonel)
        const imageUrl = prompt('Kapak görseli URL (opsiyonel):', '');
        
        // Kullanıcı giriş yapmış mı kontrol et
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Hikaye kaydetmek için giriş yapmalısınız!', 'error');
            return;
        }
        
        // Hikayeyi API'ye gönder
        fetch('/api/stories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: storyTitle,
                content: jsonData,
                category: category,
                image_url: imageUrl || null
            })
        })
        .then(response => {
            // Yanıt durumunu kontrol et ve yanıt içeriğini döndür
            if (!response.ok) {
                // HTTP yanıt durumu başarısız ise, yanıt içeriğini JSON olarak parse et
                // ve hata mesajını almak için kullan
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Hikaye kaydedilemedi');
                });
            }
            return response.json();
        })
        .then(data => {
            // Başarılı yanıt kontrolü
            if (!data || !data.storyId) {
                throw new Error('Sunucudan geçersiz yanıt alındı');
            }
            
            showNotification('Hikaye başarıyla kaydedildi!', 'success');
            console.log('Kaydedilen hikaye:', data);
            
            // Anasayfa, keşfet ve tarihte bugün sayfalarını güncelle
            updateHomePageStories();
            
            // Hikaye detay sayfasına yönlendir
            setTimeout(() => {
                window.location.href = `/story.html?id=${data.storyId}`;
            }, 1500);
        })
        .catch(error => {
            console.error('Hikaye kaydetme hatası:', error);
            showNotification('Hikaye kaydedilirken bir hata oluştu: ' + error.message, 'error');
        });
    }
    
    // Anasayfa, keşfet ve tarihte bugün sayfalarındaki hikayeleri güncelle
    function updateHomePageStories() {
        // Anasayfadaki hikayeleri güncelle
        fetch('/api/stories?limit=6&sort=newest')
            .then(response => response.json())
            .then(stories => {
                console.log('Anasayfa hikayeleri güncellendi');
                localStorage.setItem('homePageStories', JSON.stringify(stories));
            })
            .catch(error => {
                console.error('Anasayfa hikayeleri güncellenirken hata oluştu:', error);
            });
            
        // Keşfet sayfasındaki hikayeleri güncelle
        fetch('/api/stories?limit=20')
            .then(response => response.json())
            .then(stories => {
                console.log('Keşfet sayfası hikayeleri güncellendi');
                localStorage.setItem('discoverPageStories', JSON.stringify(stories));
            })
            .catch(error => {
                console.error('Keşfet sayfası hikayeleri güncellenirken hata oluştu:', error);
            });
            
        // Tarihte bugün sayfasındaki hikayeleri güncelle
        fetch('/api/stories?limit=5&sort=newest')
            .then(response => response.json())
            .then(stories => {
                console.log('Tarihte bugün sayfası hikayeleri güncellendi');
                localStorage.setItem('todayPageStories', JSON.stringify(stories));
            })
            .catch(error => {
                console.error('Tarihte bugün sayfası hikayeleri güncellenirken hata oluştu:', error);
            });
    }
    
    // Kategori adını getir
    function getCategoryName(category) {
        const categoryNames = {
            'disasters': 'Felaketler',
            'cars': 'Arabalar',
            'historic': 'Tarihi Mekanlar',
            'creepy': 'Creepy Hikayeler',
            'science': 'Bilim',
            'tech': 'Teknoloji'
        };
        
        return categoryNames[category] || category;
    }
    
    // İçeriği Önizleme
    function previewContent() {
        // Burada önizleme mantığı eklenebilir
        alert('Önizleme özelliği yakında eklenecek!');
    }
    
    // Ekran Boyutu Değişikliği İşleme
    function handleWindowResize() {
        // Ekran boyutu değiştiğinde blokları yeniden düzenle
        adjustBlocksForScreenSize();
    }
    
    // Blokları Ekran Boyutuna Göre Ayarlama
    function adjustBlocksForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const currentPageEl = document.querySelector(`.editor-page[data-page="${currentPage}"]`);
        
        if (!currentPageEl) return;
        
        // Sayfadaki tüm blokları seç
        const blocks = currentPageEl.querySelectorAll('.editor-block');
        
        blocks.forEach(block => {
            // Blok boyutlarını ve konumunu ekran boyutuna göre ayarla
            const blockWidth = parseInt(block.style.width);
            const blockLeft = parseInt(block.style.left);
            
            // Ekran genişliğini aşan blokları düzelt
            if (isMobile) {
                // Mobil cihazlarda maksimum genişliği sınırla
                const maxWidth = isSmallMobile ? 
                    Math.min(200, currentPageEl.clientWidth - 20) : 
                    Math.min(250, currentPageEl.clientWidth - 20);
                
                // Blok genişliği ekran genişliğini aşıyorsa düzelt
                if (blockWidth > maxWidth || blockWidth + blockLeft > currentPageEl.clientWidth) {
                    block.style.width = `${maxWidth}px`;
                    
                    // Blok sol konumu ekran dışına taşıyorsa düzelt
                    if (blockLeft + maxWidth > currentPageEl.clientWidth) {
                        block.style.left = `${Math.max(10, currentPageEl.clientWidth - maxWidth - 10)}px`;
                    }
                }
                
                // Mobil cihazlarda blokları merkeze hizala
                if (isSmallMobile) {
                    // Küçük mobil cihazlarda tam genişlik kullan
                    block.style.width = `${maxWidth}px`;
                    block.style.left = '10px';
                }
            } else {
                // Masaüstü görünümde orijinal boyutları koru, ancak ekran dışına taşmayı önle
                const maxDesktopWidth = Math.min(blockWidth, currentPageEl.clientWidth - 20);
                
                if (blockWidth > maxDesktopWidth || blockLeft + blockWidth > currentPageEl.clientWidth) {
                    block.style.width = `${maxDesktopWidth}px`;
                    
                    if (blockLeft + maxDesktopWidth > currentPageEl.clientWidth) {
                        block.style.left = `${Math.max(10, currentPageEl.clientWidth - maxDesktopWidth - 10)}px`;
                    }
                }
            }
            
            // Blok tipine göre içerik optimizasyonu
            if (block.dataset.type === 'text') {
                const textContent = block.querySelector('.text-block-content');
                if (textContent) {
                    textContent.style.fontSize = isSmallMobile ? '14px' : (isMobile ? '16px' : textContent.style.fontSize || '16px');
                }
            } else if (block.dataset.type === 'image') {
                const img = block.querySelector('img');
                if (img) {
                    img.style.objectFit = 'contain';
                }
            }
        });
    }
    
    // Sayfa yüklendiğinde kaydedilmiş içeriği kontrol et
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        try {
            const state = JSON.parse(savedContent);
            restoreState(state);
        } catch (e) {
            console.error('Kaydedilmiş içerik yüklenirken hata oluştu:', e);
            // Hata durumunda varsayılan tek sayfa oluştur
            restoreState(null);
        }
    } else {
        // localStorage'da veri yoksa varsayılan tek sayfa oluştur
        restoreState(null);
    }
});
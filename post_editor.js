// post_editor.js - Gönderi Düzenleme Sayfası JavaScript

// Global değişkenler
let autoSaveTimer;
const autoSaveInterval = 60000; // 60 saniye

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elemanları
    const contentBlocks = document.getElementById('content-blocks');
    const addFullBlockBtn = document.querySelector('[data-action="add-full-block"]');
    const addSplitBlockBtn = document.querySelector('[data-action="add-split-block"]');
    const addGalleryBlockBtn = document.querySelector('[data-action="add-gallery-block"]');
    const addQuoteBlockBtn = document.querySelector('[data-action="add-quote-block"]');
    const addVideoBlockBtn = document.querySelector('[data-action="add-video-block"]');
    const addEmbedBlockBtn = document.querySelector('[data-action="add-embed-block"]');
    const add3dModelBtn = document.querySelector('[data-action="add-3d-model"]');
    const postTitleInput = document.getElementById('post-title');
    const postCategorySelect = document.getElementById('post-category');
    const postTagsInput = document.getElementById('post-tags');
    const postCoverInput = document.getElementById('post-cover');
    const coverPreview = document.getElementById('cover-preview');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    const previewToggleBtn = document.getElementById('preview-toggle');
    const formatButtons = document.querySelectorAll('.rich-text-toolbar .toolbar-btn');
    const tagsCharCounter = document.getElementById('tags-char-counter');
    
    // Blok sayacı (benzersiz ID'ler için)
    let blockCounter = 0;
    
    // Etiketler için karakter sayacı
    if (postTagsInput && tagsCharCounter) {
        postTagsInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            tagsCharCounter.textContent = `${currentLength}/250`;
            
            // Karakter sınırına yaklaşıldığında uyarı
            if (currentLength > 200) {
                tagsCharCounter.classList.add('char-counter-warning');
            } else {
                tagsCharCounter.classList.remove('char-counter-warning');
            }
        });
    }
    
    // Kapak görseli yükleme
    if (postCoverInput && coverPreview) {
        postCoverInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    coverPreview.innerHTML = `<img src="${e.target.result}" alt="Kapak Görseli">`;
                };
                reader.readAsDataURL(file);
            }
        });}]},{"old_str":
        
        // Sürükle-bırak desteği
        coverPreview.addEventListener('dragover', function(e) {
            e.preventDefault();
            coverPreview.style.borderColor = 'var(--accent-purple)';
            coverPreview.style.background = 'rgba(60, 60, 60, 0.5)';
        });
        
        coverPreview.addEventListener('dragleave', function() {
            coverPreview.style.borderColor = 'var(--glass-border)';
            coverPreview.style.background = 'rgba(30, 30, 30, 0.5)';
        });
        
        coverPreview.addEventListener('drop', function(e) {
            e.preventDefault();
            coverPreview.style.borderColor = 'var(--glass-border)';
            coverPreview.style.background = 'rgba(30, 30, 30, 0.5)';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                postCoverInput.files = e.dataTransfer.files;
                const reader = new FileReader();
                reader.onload = function(e) {
                    coverPreview.innerHTML = `<img src="${e.target.result}" alt="Kapak Görseli">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Blok ekleme butonları için olay dinleyicileri
    if (addFullBlockBtn) {
        addFullBlockBtn.addEventListener('click', function() {
            addFullWidthBlock();
        });
    }
    
    if (addSplitBlockBtn) {
        addSplitBlockBtn.addEventListener('click', function() {
            addSplitBlock();
        });
    }
    
    if (addGalleryBlockBtn) {
        addGalleryBlockBtn.addEventListener('click', function() {
            addGalleryBlock();
        });
    }
    
    if (addQuoteBlockBtn) {
        addQuoteBlockBtn.addEventListener('click', function() {
            addQuoteBlock();
        });
    }
    
    if (addVideoBlockBtn) {
        addVideoBlockBtn.addEventListener('click', function() {
            addVideoBlock();
        });
    }
    
    if (addEmbedBlockBtn) {
        addEmbedBlockBtn.addEventListener('click', function() {
            addEmbedBlock();
        });
    }
    
    if (add3dModelBtn) {
        add3dModelBtn.addEventListener('click', function() {
            add3dModelBlock();
        });
    }
    
    // Zengin metin düzenleme butonları için olay dinleyicileri
    if (formatButtons) {
        formatButtons.forEach(button => {
            button.addEventListener('click', function() {
                const format = this.dataset.format;
                applyTextFormat(format);
            });
        });
    }
    
    // Tam genişlik blok oluşturma
    function addFullWidthBlock() {
        // Boş içerik mesajını kaldır
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="full-width-block draggable-block" data-block-type="full">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="content-type-selector">
                    <button class="type-btn active" data-type="text" title="Metin">T</button>
                    <button class="type-btn" data-type="image" title="Görsel">I</button>
                    <button class="type-btn" data-type="code" title="Kod">{ }</button>
                </div>
                <div class="text-content" contenteditable="true" placeholder="Metninizi buraya yazın..."></div>
            </div>
        `;
        
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
    }
    
    // Bölünmüş blok oluşturma
    function addSplitBlock() {
        // Boş içerik mesajını kaldır
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        const leftId = `${blockId}-left`;
        const rightId = `${blockId}-right`;
        
        const blockHTML = `
            <div id="${blockId}" class="split-block draggable-block" data-block-type="split">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div id="${leftId}" class="split-left">
                    <div class="content-type-selector">
                        <button class="type-btn active" data-type="text" title="Metin">T</button>
                        <button class="type-btn" data-type="image" title="Görsel">I</button>
                        <button class="type-btn" data-type="code" title="Kod">{ }</button>
                    </div>
                    <div class="text-content" contenteditable="true" placeholder="Sol içerik..."></div>
                </div>
                <div id="${rightId}" class="split-right">
                    <div class="content-type-selector">
                        <button class="type-btn active" data-type="text" title="Metin">T</button>
                        <button class="type-btn" data-type="image" title="Görsel">I</button>
                        <button class="type-btn" data-type="code" title="Kod">{ }</button>
                    </div>
                    <div class="text-content" contenteditable="true" placeholder="Sağ içerik..."></div>
                </div>
            </div>
        `;
        
        // HTML içeriğini ekle
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        const leftSide = document.getElementById(leftId);
        const rightSide = document.getElementById(rightId);
        
        // Olay dinleyicilerini ekle
        if (newBlock) addBlockEventListeners(newBlock);
        if (leftSide) addSplitSideEventListeners(leftSide);
        if (rightSide) addSplitSideEventListeners(rightSide);
        // Sürükle-bırak işlevselliğini yeniden başlat
        refreshDragAndDrop();
    }
    
    // Yardımcı fonksiyonlar
    function removeEmptyMessage() {
        const emptyMessage = contentBlocks.querySelector('.empty-content-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
    
    // Galeri blok oluşturma
    function addGalleryBlock() {
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="gallery-block draggable-block" data-block-type="gallery">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="gallery-content">
                    <div class="gallery-add">
                        <i class="upload-icon">+</i>
                    </div>
                </div>
            </div>
        `;
        
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
        setupGalleryBlock(newBlock);
    }
    
    // Alıntı blok oluşturma
    function addQuoteBlock() {
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="quote-block draggable-block" data-block-type="quote">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="quote-content" contenteditable="true" placeholder="Alıntınızı buraya yazın..."></div>
                <div class="quote-author" contenteditable="true" placeholder="Alıntı sahibi..."></div>
            </div>
        `;
        
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
    }
    
    // Video blok oluşturma
    function addVideoBlock() {
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="video-block draggable-block" data-block-type="video">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="video-content">
                    <div class="video-placeholder">
                        <i class="upload-icon">🎬</i>
                        <span>Video eklemek için tıklayın veya URL girin</span>
                        <input type="text" class="video-url-input" placeholder="YouTube veya Vimeo URL'si yapıştırın">
                        <button class="video-url-btn">Ekle</button>
                    </div>
                </div>
            </div>
        `;
        
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
        setupVideoBlock(newBlock);
    }
    
    // Gömülü içerik blok oluşturma
    function addEmbedBlock() {
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="embed-block draggable-block" data-block-type="embed">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="embed-content">
                    <div class="embed-placeholder">
                        <i class="upload-icon">📌</i>
                        <span>Gömülü içerik eklemek için HTML kodunu yapıştırın</span>
                        <textarea class="embed-code-input" placeholder="<iframe> veya diğer gömülü kodları buraya yapıştırın"></textarea>
                        <button class="embed-code-btn">Uygula</button>
                    </div>
                </div>
            </div>
        `;
        
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
        setupEmbedBlock(newBlock);
    }
    
    // 3D Model blok oluşturma
    function add3dModelBlock() {
        removeEmptyMessage();
        
        blockCounter++;
        const blockId = `block-${blockCounter}`;
        
        const blockHTML = `
            <div id="${blockId}" class="model-block draggable-block" data-block-type="3d-model">
                <div class="drag-handle" title="Sürükle ve Taşı">⋮⋮</div>
                <div class="block-controls">
                    <button class="block-control-btn" data-action="move-up" title="Yukarı Taşı">↑</button>
                    <button class="block-control-btn" data-action="move-down" title="Aşağı Taşı">↓</button>
                    <button class="block-control-btn" data-action="duplicate" title="Çoğalt">📋</button>
                    <button class="block-control-btn" data-action="delete" title="Sil">🗑️</button>
                </div>
                <div class="model-content">
                    <div class="model-placeholder">
                        <i class="upload-icon">🧊</i>
                        <span>3D Model eklemek için tıklayın veya sürükleyin</span>
                        <p class="model-info">Desteklenen formatlar: .glb, .gltf</p>
                        <input type="file" class="model-file-input" accept=".glb,.gltf" style="display:none;">
                    </div>
                    <div class="model-preview"></div>
                </div>
            </div>
        `;
        contentBlocks.insertAdjacentHTML('beforeend', blockHTML);
        
        // Yeni eklenen bloğa olay dinleyicileri ekle
        const newBlock = document.getElementById(blockId);
        if (newBlock) {
            addBlockEventListeners(newBlock);
            // Sadece 3D model içeriği varsa setup3dModelBlock fonksiyonunu çağır
            if (newBlock.querySelector('.model-content')) {
                setup3dModelBlock(newBlock);
            }
            // Sürükle-bırak işlevselliğini yeniden başlat
            refreshDragAndDrop();
        }
    }
    
    // Blok olay dinleyicileri ekleme
    function addBlockEventListeners(block) {
        // Blok kontrol butonları
        const moveUpBtn = block.querySelector('[data-action="move-up"]');
        const moveDownBtn = block.querySelector('[data-action="move-down"]');
        const duplicateBtn = block.querySelector('[data-action="duplicate"]');
        const deleteBtn = block.querySelector('[data-action="delete"]');
        
        if (moveUpBtn) {
            moveUpBtn.addEventListener('click', function() {
                const prevBlock = block.previousElementSibling;
                if (prevBlock) {
                    contentBlocks.insertBefore(block, prevBlock);
                }
            });
        }
        
        if (moveDownBtn) {
            moveDownBtn.addEventListener('click', function() {
                const nextBlock = block.nextElementSibling;
                if (nextBlock) {
                    contentBlocks.insertBefore(nextBlock, block);
                }
            });
        }
        
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', function() {
                const blockType = block.dataset.blockType;
                const blockClone = block.cloneNode(true);
                blockCounter++;
                const newBlockId = `block-${blockCounter}`;
                blockClone.id = newBlockId;
                
                // Bölünmüş blok ise alt ID'leri güncelle
                if (blockType === 'split') {
                    const leftSide = blockClone.querySelector('.split-left');
                    const rightSide = blockClone.querySelector('.split-right');
                    if (leftSide) leftSide.id = `${newBlockId}-left`;
                    if (rightSide) rightSide.id = `${newBlockId}-right`;
                }
                
                contentBlocks.insertBefore(blockClone, block.nextElementSibling);
                
                // Yeni klonlanmış bloğa olay dinleyicileri ekle
                addBlockEventListeners(blockClone);
                
                // Blok tipine göre özel işlevsellik ekle
                if (blockType === 'split') {
                    const leftSide = blockClone.querySelector('.split-left');
                    const rightSide = blockClone.querySelector('.split-right');
                    if (leftSide) addSplitSideEventListeners(leftSide);
                    if (rightSide) addSplitSideEventListeners(rightSide);
                } else if (blockType === 'gallery') {
                    setupGalleryBlock(blockClone);
                } else if (blockType === 'video') {
                    setupVideoBlock(blockClone);
                } else if (blockType === 'embed') {
                    setupEmbedBlock(blockClone);
                } else if (blockType === '3d-model') {
                    setup3dModelBlock(blockClone);
                }
                
                // Sürükle-bırak işlevselliğini yeniden başlat
                refreshDragAndDrop();
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Bu bloğu silmek istediğinize emin misiniz?')) {
                    block.remove();
                    
                    // Eğer hiç blok kalmadıysa boş mesajı göster
                    if (contentBlocks.children.length === 0) {
                        contentBlocks.innerHTML = `
                            <div class="empty-content-message">
                                <p>Gönderinize içerik eklemek için yukarıdaki butonları kullanın.</p>
                            </div>
                        `;
                    }
                }
            });
        }
        
        // Blok tipinin tam genişlik olup olmadığını kontrol et
        if (block.dataset.blockType === 'full') {
            const typeButtons = block.querySelectorAll('.type-btn');
            const contentArea = block.querySelector('.text-content');
            
            typeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Aktif sınıfını kaldır
                    typeButtons.forEach(b => b.classList.remove('active'));
                    // Tıklanan butona aktif sınıfını ekle
                    btn.classList.add('active');
                    
                    // İçerik tipini değiştir
                    const contentType = btn.dataset.type;
                    changeContentType(block, contentType);
                });
            });
        }
    }
    
    // Bölünmüş blok tarafları için olay dinleyicileri
    function addSplitSideEventListeners(side) {
        const typeButtons = side.querySelectorAll('.type-btn');
        const contentArea = side.querySelector('.text-content');
        
        typeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Aktif sınıfını kaldır
                typeButtons.forEach(b => b.classList.remove('active'));
                // Tıklanan butona aktif sınıfını ekle
                btn.classList.add('active');
                
                // İçerik tipini değiştir
                const contentType = btn.dataset.type;
                changeContentType(side, contentType);
            });
        });
    }
    
    // İçerik tipini değiştirme (metin/görsel/kod)
    function changeContentType(container, type) {
        // Mevcut içeriği temizle
        const existingContent = container.querySelector('.text-content, .image-content, .code-content');
        if (existingContent) {
            existingContent.remove();
        }
        
        if (type === 'text') {
            // Metin içeriği ekle
            const textContent = document.createElement('div');
            textContent.className = 'text-content';
            textContent.contentEditable = true;
            textContent.setAttribute('placeholder', 'Metninizi buraya yazın...');
            container.appendChild(textContent);
        } else if (type === 'image') {
            // Görsel içeriği ekle
            const imageContent = document.createElement('div');
            imageContent.className = 'image-content';
            imageContent.innerHTML = `
                <div class="image-placeholder">
                    <i class="upload-icon">🖼️</i>
                    <span>Görsel eklemek için tıklayın</span>
                </div>
                <input type="file" class="file-input" accept="image/*" style="display:none;">
            `;
            container.appendChild(imageContent);
            
            // Görsel yükleme işlevselliği
            const fileInput = imageContent.querySelector('.file-input');
            imageContent.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imageContent.innerHTML = `<img src="${e.target.result}" alt="Yüklenen Görsel">`;
                        // Gizli dosya girişini tekrar ekle
                        const newFileInput = document.createElement('input');
                        newFileInput.type = 'file';
                        newFileInput.className = 'file-input';
                        newFileInput.accept = 'image/*';
                        newFileInput.style.display = 'none';
                        imageContent.appendChild(newFileInput);
                        
                        // Yeni dosya girişine olay dinleyicisi ekle
                        newFileInput.addEventListener('change', function(e) {
                            fileInput.dispatchEvent(new Event('change'));
                        });
                        
                        // Görsel tıklandığında dosya seçiciyi aç
                        imageContent.querySelector('img').addEventListener('click', function(e) {
                            e.stopPropagation();
                            newFileInput.click();
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        } else if (type === 'code') {
            // Kod içeriği ekle
            const codeContent = document.createElement('div');
            codeContent.className = 'code-content';
            codeContent.innerHTML = `
                <div class="code-toolbar">
                    <select class="code-language-select">
                        <option value="javascript">JavaScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="swift">Swift</option>
                        <option value="go">Go</option>
                        <option value="typescript">TypeScript</option>
                        <option value="sql">SQL</option>
                    </select>
                </div>
                <textarea class="code-editor" placeholder="Kodunuzu buraya yazın..."></textarea>
            `;
            container.appendChild(codeContent);
        }
    }
    
    // Galeri blok işlevselliği
    function setupGalleryBlock(block) {
        const galleryContent = block.querySelector('.gallery-content');
        const galleryAdd = galleryContent.querySelector('.gallery-add');
        
        galleryAdd.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            fileInput.addEventListener('change', function(e) {
                const files = e.target.files;
                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const galleryItem = document.createElement('div');
                            galleryItem.className = 'gallery-item';
                            galleryItem.innerHTML = `<img src="${e.target.result}" alt="Galeri Görseli">`;
                            
                            // Silme işlevselliği için tıklama olayı
                            galleryItem.addEventListener('dblclick', function() {
                                if (confirm('Bu görseli galeriden kaldırmak istediğinize emin misiniz?')) {
                                    galleryItem.remove();
                                }
                            });
                            
                            galleryContent.insertBefore(galleryItem, galleryAdd);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                }
                
                document.body.removeChild(fileInput);
            });
            
            fileInput.click();
        });
        
        // Sürükle-bırak desteği
        galleryContent.addEventListener('dragover', function(e) {
            e.preventDefault();
            galleryContent.style.borderColor = 'var(--accent-purple)';
            galleryContent.style.background = 'rgba(60, 60, 60, 0.5)';
        });
        
        galleryContent.addEventListener('dragleave', function() {
            galleryContent.style.borderColor = 'var(--glass-border)';
            galleryContent.style.background = 'rgba(20, 20, 20, 0.5)';
        });
        
        galleryContent.addEventListener('drop', function(e) {
            e.preventDefault();
            galleryContent.style.borderColor = 'var(--glass-border)';
            galleryContent.style.background = 'rgba(20, 20, 20, 0.5)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            const galleryItem = document.createElement('div');
                            galleryItem.className = 'gallery-item';
                            galleryItem.innerHTML = `<img src="${e.target.result}" alt="Galeri Görseli">`;
                            
                            // Silme işlevselliği için tıklama olayı
                            galleryItem.addEventListener('dblclick', function() {
                                if (confirm('Bu görseli galeriden kaldırmak istediğinize emin misiniz?')) {
                                    galleryItem.remove();
                                }
                            });
                            
                            galleryContent.insertBefore(galleryItem, galleryAdd);
                        };
                        
                        reader.readAsDataURL(file);
                    }
                }
            }
        });
    }
    
    // Video blok işlevselliği
    function setupVideoBlock(block) {
        const videoContent = block.querySelector('.video-content');
        const videoPlaceholder = videoContent.querySelector('.video-placeholder');
        const videoUrlInput = videoContent.querySelector('.video-url-input');
        const videoUrlBtn = videoContent.querySelector('.video-url-btn');
        
        if (videoUrlBtn && videoUrlInput) {
            videoUrlBtn.addEventListener('click', function() {
                const videoUrl = videoUrlInput.value.trim();
                if (videoUrl) {
                    // YouTube URL'sini kontrol et
                    let videoId = '';
                    let embedUrl = '';
                    
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        // YouTube URL'sinden video ID'sini çıkar
                        if (videoUrl.includes('youtube.com/watch?v=')) {
                            videoId = videoUrl.split('v=')[1];
                            const ampersandPosition = videoId.indexOf('&');
                            if (ampersandPosition !== -1) {
                                videoId = videoId.substring(0, ampersandPosition);
                            }
                        } else if (videoUrl.includes('youtu.be/')) {
                            videoId = videoUrl.split('youtu.be/')[1];
                        }
                        
                        if (videoId) {
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                    } else if (videoUrl.includes('vimeo.com')) {
                        // Vimeo URL'sinden video ID'sini çıkar
                        const vimeoId = videoUrl.split('vimeo.com/')[1];
                        if (vimeoId) {
                            embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
                        }
                    }
                    
                    if (embedUrl) {
                        // Video iframe'ini oluştur
                        videoContent.innerHTML = `<iframe class="video-embed" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
                    } else {
                        alert('Geçerli bir YouTube veya Vimeo URL\'si girin.');
                    }
                }
            });
        }
        
        // Dosya yükleme işlevselliği (yerel video dosyaları için)
        videoPlaceholder.addEventListener('click', function(e) {
            if (e.target !== videoUrlInput && e.target !== videoUrlBtn) {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'video/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                fileInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const videoElement = document.createElement('video');
                        videoElement.className = 'video-embed';
                        videoElement.controls = true;
                        videoElement.src = URL.createObjectURL(file);
                        
                        videoContent.innerHTML = '';
                        videoContent.appendChild(videoElement);
                    }
                    
                    document.body.removeChild(fileInput);
                });
                
                fileInput.click();
            }
        });
    }
    
    // Gömülü içerik blok işlevselliği
    function setupEmbedBlock(block) {
        const embedContent = block.querySelector('.embed-content');
        const embedCodeInput = embedContent.querySelector('.embed-code-input');
        const embedCodeBtn = embedContent.querySelector('.embed-code-btn');
        
        if (embedCodeBtn && embedCodeInput) {
            embedCodeBtn.addEventListener('click', function() {
                const embedCode = embedCodeInput.value.trim();
                if (embedCode) {
                    // Gömülü kodu doğrudan ekle
                    embedContent.innerHTML = embedCode;
                }
            });
        }
    }
    
    // 3D Model blok işlevselliği
    function setup3dModelBlock(block) {
        const modelContent = block.querySelector('.model-content');
        // Eğer model-content sınıfı yoksa, fonksiyondan çık
        if (!modelContent) return;
        
        const modelPlaceholder = modelContent.querySelector('.model-placeholder');
        // Eğer model-placeholder sınıfı yoksa, fonksiyondan çık
        if (!modelPlaceholder) return;
        
        const modelFileInput = modelContent.querySelector('.model-file-input');
        // Eğer model-file-input sınıfı yoksa, fonksiyondan çık
        if (!modelFileInput) return;
        
        // Model yükleme işlevselliği
        modelPlaceholder.addEventListener('click', function() {
            modelFileInput.click();
        });
        
        modelFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // 3D model dosyasını yükle
                const modelUrl = URL.createObjectURL(file);
                
                // model-viewer bileşenini oluştur (Google'ın model-viewer kütüphanesi gerekli)
                const modelViewer = document.createElement('model-viewer');
                modelViewer.className = 'model-viewer';
                modelViewer.src = modelUrl;
                modelViewer.alt = '3D Model';
                modelViewer.setAttribute('auto-rotate', '');
                modelViewer.setAttribute('camera-controls', '');
                modelViewer.setAttribute('shadow-intensity', '1');
                
                // Model kontrol butonları
                const modelControls = document.createElement('div');
                modelControls.className = 'model-controls';
                modelControls.innerHTML = `
                    <button class="model-control-btn" data-action="rotate">Otomatik Döndür</button>
                    <button class="model-control-btn" data-action="fullscreen">Tam Ekran</button>
                `;
                
                // Placeholder'ı temizle ve model-viewer'ı ekle
                modelContent.innerHTML = '';
                modelContent.appendChild(modelViewer);
                modelContent.appendChild(modelControls);
                
                // Model kontrol butonları için olay dinleyicileri
                const rotateBtn = modelControls.querySelector('[data-action="rotate"]');
                const fullscreenBtn = modelControls.querySelector('[data-action="fullscreen"]');
                
                if (rotateBtn) {
                    rotateBtn.addEventListener('click', function() {
                        if (modelViewer.hasAttribute('auto-rotate')) {
                            modelViewer.removeAttribute('auto-rotate');
                            rotateBtn.textContent = 'Döndürmeyi Başlat';
                        } else {
                            modelViewer.setAttribute('auto-rotate', '');
                            rotateBtn.textContent = 'Döndürmeyi Durdur';
                        }
                    });
                }
                
                if (fullscreenBtn) {
                    fullscreenBtn.addEventListener('click', function() {
                        if (modelViewer.requestFullscreen) {
                            modelViewer.requestFullscreen();
                        } else if (modelViewer.webkitRequestFullscreen) {
                            modelViewer.webkitRequestFullscreen();
                        } else if (modelViewer.msRequestFullscreen) {
                            modelViewer.msRequestFullscreen();
                        }
                    });
                }
                
                // Model-viewer kütüphanesini dinamik olarak yükle
                if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
                    const script = document.createElement('script');
                    script.type = 'module';
                    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
                    document.head.appendChild(script);
                }
            }
        });
        
        // Sürükle-bırak desteği
        modelContent.addEventListener('dragover', function(e) {
            e.preventDefault();
            modelContent.style.borderColor = 'var(--accent-purple)';
            modelContent.style.background = 'rgba(60, 60, 60, 0.5)';
        });
        
        modelContent.addEventListener('dragleave', function() {
            modelContent.style.borderColor = 'var(--glass-border)';
            modelContent.style.background = 'rgba(20, 20, 20, 0.5)';
        });
        
        modelContent.addEventListener('drop', function(e) {
            e.preventDefault();
            modelContent.style.borderColor = 'var(--glass-border)';
            modelContent.style.background = 'rgba(20, 20, 20, 0.5)';
            
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
                modelFileInput.files = e.dataTransfer.files;
                modelFileInput.dispatchEvent(new Event('change'));
            } else {
                alert('Lütfen geçerli bir 3D model dosyası (.glb veya .gltf) yükleyin.');
            }
        });
    }
    
    // Zengin metin düzenleme işlevselliği
    function applyTextFormat(format) {
        // Seçili metin içeriğini al
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        // Seçili metnin içinde olduğu düzenlenebilir içerik alanını bul
        let textContent = null;
        let currentNode = selection.anchorNode;
        
        while (currentNode) {
            if (currentNode.classList && currentNode.classList.contains('text-content')) {
                textContent = currentNode;
                break;
            }
            currentNode = currentNode.parentNode;
        }
        
        if (!textContent) return;
        
        // Format uygula
        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'strikethrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'h1':
                document.execCommand('formatBlock', false, '<h1>');
                break;
            case 'h2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
            case 'h3':
                document.execCommand('formatBlock', false, '<h3>');
                break;
            case 'ul':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'ol':
                document.execCommand('insertOrderedList', false, null);
                break;
            case 'link':
                const url = prompt('Bağlantı URL\'sini girin:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'code':
                if (selectedText) {
                    const codeElement = document.createElement('code');
                    codeElement.textContent = selectedText;
                    range.deleteContents();
                    range.insertNode(codeElement);
                }
                break;
            case 'clear':
                document.execCommand('removeFormat', false, null);
                break;
        }
    }
    
    // Sürükle-bırak işlevselliği
    function setupDragAndDrop() {
        // Tüm sürüklenebilir bloklar için olay dinleyicileri ekle
        const draggableBlocks = document.querySelectorAll('.draggable-block');
        
        draggableBlocks.forEach(block => {
            const dragHandle = block.querySelector('.drag-handle');
            
            if (dragHandle) {
                dragHandle.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    
                    // Sürükleme başlangıcı
                    block.classList.add('dragging');
                    
                    // Fare konumunu kaydet
                    const startY = e.clientY;
                    const startTop = block.offsetTop;
                    
                    // Fare hareketi dinleyicisi
                    function onMouseMove(e) {
                        const currentY = e.clientY;
                        const deltaY = currentY - startY;
                        
                        // Bloğu taşı
                        block.style.top = `${startTop + deltaY}px`;
                        
                        // Diğer blokların konumlarını kontrol et
                        const allBlocks = Array.from(contentBlocks.querySelectorAll('.draggable-block'));
                        const blockIndex = allBlocks.indexOf(block);
                        
                        // Yukarı taşıma
                        if (deltaY < 0 && blockIndex > 0) {
                            const prevBlock = allBlocks[blockIndex - 1];
                            if (block.offsetTop < prevBlock.offsetTop + prevBlock.offsetHeight / 2) {
                                contentBlocks.insertBefore(block, prevBlock);
                            }
                        }
                        
                        // Aşağı taşıma
                        if (deltaY > 0 && blockIndex < allBlocks.length - 1) {
                            const nextBlock = allBlocks[blockIndex + 1];
                            if (block.offsetTop + block.offsetHeight > nextBlock.offsetTop + nextBlock.offsetHeight / 2) {
                                contentBlocks.insertBefore(nextBlock, block);
                            }
                        }
                    }
                    
                    // Fare bırakma dinleyicisi
                    function onMouseUp() {
                        // Sürükleme sonu
                        block.classList.remove('dragging');
                        block.style.top = '';
                        
                        // Dinleyicileri kaldır
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }
                    
                    // Dinleyicileri ekle
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            }
        });
    }
    
    // İçerik şablonları işlevselliği
    function setupTemplates() {
        // Şablonlar paneli oluştur
        const templatesPanel = document.createElement('div');
        templatesPanel.className = 'templates-panel';
        templatesPanel.innerHTML = `
            <div class="templates-title">
                <i class="template-icon">📋</i> İçerik Şablonları <span class="toggle-icon">▼</span>
            </div>
            <div class="templates-content">
                <div class="template-item" data-template="blog">
                    <div class="template-title">Blog Yazısı</div>
                    <div class="template-description">Giriş, ana bölümler ve sonuç içeren standart blog yazısı şablonu</div>
                </div>
                <div class="template-item" data-template="gallery">
                    <div class="template-title">Galeri Makalesi</div>
                    <div class="template-description">Görsel ağırlıklı galeri içeren makale şablonu</div>
                </div>
                <div class="template-item" data-template="tutorial">
                    <div class="template-title">Eğitim İçeriği</div>
                    <div class="template-description">Adım adım eğitim içeriği şablonu</div>
                </div>
                <div class="template-item" data-template="review">
                    <div class="template-title">İnceleme</div>
                    <div class="template-description">Ürün veya hizmet incelemesi şablonu</div>
                </div>
                <div class="template-item" data-template="news">
                    <div class="template-title">Haber</div>
                    <div class="template-description">Haber makalesi şablonu</div>
                </div>
            </div>
        `;
        
        // Şablonlar panelini içerik araç çubuğunun altına ekle
        const contentToolbar = document.querySelector('.content-toolbar');
        if (contentToolbar) {
            contentToolbar.parentNode.insertBefore(templatesPanel, contentToolbar.nextSibling);
            
            // Şablonlar başlığına tıklama olayı
            const templatesTitle = templatesPanel.querySelector('.templates-title');
            const templatesContent = templatesPanel.querySelector('.templates-content');
            
            templatesTitle.addEventListener('click', function() {
                templatesContent.classList.toggle('open');
                const toggleIcon = templatesTitle.querySelector('.toggle-icon');
                toggleIcon.textContent = templatesContent.classList.contains('open') ? '▲' : '▼';
            });
            
            // Şablon öğelerine tıklama olayları
            const templateItems = templatesPanel.querySelectorAll('.template-item');
            templateItems.forEach(item => {
                item.addEventListener('click', function() {
                    const templateType = this.dataset.template;
                    applyTemplate(templateType);
                });
            });
        }
    }
    
    // Şablon uygulama
    function applyTemplate(templateType) {
        // Mevcut içeriği temizle
        contentBlocks.innerHTML = '';
        
        // Şablon tipine göre bloklar ekle
        switch (templateType) {
            case 'blog':
                // Blog yazısı şablonu
                addFullWidthBlock(); // Giriş
                addFullWidthBlock(); // Ana Bölüm 1
                addFullWidthBlock(); // Ana Bölüm 2
                addQuoteBlock();     // Alıntı
                addFullWidthBlock(); // Sonuç
                break;
                
            case 'gallery':
                // Galeri makalesi şablonu
                addFullWidthBlock(); // Giriş
                addGalleryBlock();   // Galeri
                addSplitBlock();     // Bölünmüş içerik
                addFullWidthBlock(); // Sonuç
                break;
                
            case 'tutorial':
                // Eğitim içeriği şablonu
                addFullWidthBlock(); // Giriş
                addFullWidthBlock(); // Adım 1
                addSplitBlock();     // Adım 2 (Metin + Görsel)
                addFullWidthBlock(); // Adım 3
                addFullWidthBlock(); // Sonuç
                break;
                
            case 'review':
                // İnceleme şablonu
                addFullWidthBlock(); // Giriş
                addSplitBlock();     // Ürün Görseli + Özellikleri
                addFullWidthBlock(); // Detaylı İnceleme
                addQuoteBlock();     // Alıntı/Değerlendirme
                addFullWidthBlock(); // Sonuç
                break;
                
            case 'news':
                // Haber şablonu
                addFullWidthBlock(); // Haber Başlığı ve Özeti
                addSplitBlock();     // Ana Haber İçeriği + Yan Bilgiler
                addFullWidthBlock(); // Detaylar
                addFullWidthBlock(); // Sonuç
                break;
        }
    }
    
    // Sayfa yüklendiğinde çalıştırılacak işlevler
    function initializeEditor() {
        // Sürükle-bırak işlevselliğini başlat
        setupDragAndDrop();
        
        // İçerik şablonlarını başlat
        setupTemplates();
        
        // Otomatik kaydetmeyi başlat
        setupAutoSave();
    }
    
    // Tüm bloklar için sürükle-bırak işlevselliğini yeniden başlat
    function refreshDragAndDrop() {
        // Hata yakalama mekanizması ekle
        try {
            // Sürükle-bırak işlevselliğini başlat
            setupDragAndDrop();
        } catch (error) {
            console.error('Sürükle-bırak işlevselliği başlatılırken hata oluştu:', error);
        }
    }
    
    // Sayfa yüklendiğinde editörü başlat
    initializeEditor();
    
    // Gönderi kaydetme ve yayınlama
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            savePost('draft');
        });
    }
    
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            savePost('published');
        });
    }
    
    // Önizleme modu
    if (previewToggleBtn) {
        previewToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('preview-mode');
            previewToggleBtn.classList.toggle('active');
            
            if (previewToggleBtn.classList.contains('active')) {
                previewToggleBtn.innerHTML = '<i class="preview-icon">✏️</i> Düzenleme Modu';
            } else {
                previewToggleBtn.innerHTML = '<i class="preview-icon">👁️</i> Önizleme Modu';
            }
        });
    }
    
    // Otomatik kaydetme
    // Not: autoSaveTimer ve autoSaveInterval artık global olarak tanımlandı
    
    function setupAutoSave() {
        // Otomatik kaydetme göstergesi oluştur
        const autoSaveIndicator = document.createElement('div');
        autoSaveIndicator.className = 'autosave-indicator';
        autoSaveIndicator.innerHTML = `
            <div class="autosave-spinner"></div>
            <span class="autosave-text">Otomatik kaydediliyor...</span>
        `;
        document.querySelector('.post-actions').prepend(autoSaveIndicator);
        
        // İçerik değişikliklerini dinle
        [postTitleInput, postCategorySelect, postTagsInput].forEach(element => {
            element.addEventListener('change', resetAutoSaveTimer);
            element.addEventListener('input', resetAutoSaveTimer);
        });
        
        // İçerik bloklarındaki değişiklikleri dinle
        contentBlocks.addEventListener('input', resetAutoSaveTimer);
        
        // İlk otomatik kaydetme zamanlayıcısını başlat
        resetAutoSaveTimer();
    }
    
    function resetAutoSaveTimer() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(function() {
            autoSave();
        }, autoSaveInterval);
    }
    
    function autoSave() {
        // Otomatik kaydetme göstergesini göster
        const indicator = document.querySelector('.autosave-indicator');
        indicator.classList.add('visible');
        
        // Taslak olarak kaydet
        savePost('draft', true);
        
        // 3 saniye sonra göstergeyi gizle
        setTimeout(function() {
            indicator.classList.remove('visible');
        }, 3000);
        
        // Yeni zamanlayıcı başlat
        resetAutoSaveTimer();
    }
    
    // Not: Bu satır kaldırıldı çünkü initializeEditor() fonksiyonu içinde zaten setupAutoSave() çağrılıyor
    
    // Etiket giriş alanı işlevselliği
    function setupTagsInput() {
        const tagsContainer = document.getElementById('tags-container');
        const tagInput = document.getElementById('post-tags');
        const tags = [];
        
        if (!tagsContainer || !tagInput) return;
        
        // Enter tuşuna basıldığında veya virgül girildiğinde etiket ekle
        tagInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
            }
        });
        
        // Input alanından çıkıldığında etiket ekle
        tagInput.addEventListener('blur', addTag);
        
        function addTag() {
            const tagText = tagInput.value.trim().replace(/,/g, '');
            
            if (tagText && !tags.includes(tagText)) {
                // Etiket öğesi oluştur
                const tagElement = document.createElement('div');
                tagElement.className = 'tag-item';
                tagElement.innerHTML = `
                    <span class="tag-text">${tagText}</span>
                    <span class="remove-tag">×</span>
                `;
                
                // Etiket silme işlevselliği
                tagElement.querySelector('.remove-tag').addEventListener('click', function() {
                    tagElement.remove();
                    tags.splice(tags.indexOf(tagText), 1);
                    resetAutoSaveTimer(); // Değişiklik olduğunda otomatik kaydetme zamanlayıcısını sıfırla
                });
                
                // Etiketi konteyner'a ekle
                tagsContainer.insertBefore(tagElement, tagInput);
                tags.push(tagText);
                
                // Input alanını temizle
                tagInput.value = '';
                resetAutoSaveTimer(); // Değişiklik olduğunda otomatik kaydetme zamanlayıcısını sıfırla
            }
        }
    }
    
    // Etiket giriş alanını başlat
    setupTagsInput();
    
    // Gönderi kaydetme fonksiyonu
    function savePost(status, isAutoSave = false) {
        // Form doğrulama (otomatik kaydetme için atla)
        if (!validateForm(isAutoSave)) return;
        
        // Gönderi verilerini topla
        const postData = collectPostData(status);
        
        // İçerik bloklarını topla
        collectContentBlocks(postData);
        
        // Base64 görüntülerini optimize et
        optimizeImages(postData.blocks);
        
        // API'ye gönderilecek veriyi hazırla ve gönder
        sendToApi(postData, status);
    }
    
    // Form doğrulama fonksiyonu
    function validateForm(isAutoSave) {
        if (!isAutoSave) {
            if (!postTitleInput.value.trim()) {
                showNotification('Lütfen bir başlık girin', 'error');
                postTitleInput.focus();
                return false;
            }
            
            // Etiketleri doğrula
            if (postTagsInput && postTagsInput.value.length > 250) {
                showNotification('Etiketler 250 karakterden uzun olamaz. Lütfen etiketleri kısaltın.', 'error');
                postTagsInput.focus();
                return false;
            }
            
            // Geçersiz karakterleri kontrol et
            const invalidChars = /[^\w\sçğıöşüÇĞİÖŞÜ,]/g;
            if (postTagsInput && invalidChars.test(postTagsInput.value)) {
                const cleanedTags = postTagsInput.value.replace(invalidChars, '');
                postTagsInput.value = cleanedTags;
                showNotification('Etiketlerde geçersiz karakterler tespit edildi ve temizlendi. Lütfen kontrol edin.', 'warning');
                postTagsInput.focus();
                return false;
            }
        }
        
        if (!postCategorySelect.value) {
            showNotification('Lütfen bir kategori seçin', 'error');
            postCategorySelect.focus();
            return false;
        }
        
        // İçerik bloklarını kontrol et
        if (contentBlocks.querySelector('.empty-content-message')) {
            showNotification('Lütfen en az bir içerik bloğu ekleyin', 'error');
            return false;
        }
        
        return true;
    }
    
    // Gönderi verilerini toplama fonksiyonu
    function collectPostData(status) {
        const postData = {
            title: postTitleInput.value.trim(),
            category: postCategorySelect.value,
            tags: postTagsInput.value.trim(),
            status: status,
            blocks: []
        };
        
        // Kapak görseli
        if (postCoverInput.files.length > 0) {
            postData.coverImage = postCoverInput.files[0].name;
        }
        
        return postData;
    }
    
    // İçerik bloklarını toplama fonksiyonu
    function collectContentBlocks(postData) {
        const blocks = contentBlocks.querySelectorAll('.full-width-block, .split-block, .gallery-block, .quote-block, .video-block, .embed-block, .model-block');
        
        blocks.forEach(block => {
            if (block.classList.contains('full-width-block')) {
                collectFullWidthBlock(block, postData);
            } else if (block.classList.contains('split-block')) {
                collectSplitBlock(block, postData);
            } else if (block.classList.contains('gallery-block')) {
                collectGalleryBlock(block, postData);
            } else if (block.classList.contains('quote-block')) {
                collectQuoteBlock(block, postData);
            } else if (block.classList.contains('video-block')) {
                collectVideoBlock(block, postData);
            } else if (block.classList.contains('embed-block')) {
                collectEmbedBlock(block, postData);
            } else if (block.classList.contains('model-block')) {
                collect3DModelBlock(block, postData);
            }
        });
    }
    
    // Tam genişlik blok toplama
    function collectFullWidthBlock(block, postData) {
        const contentType = block.querySelector('.type-btn.active').dataset.type;
        let content = '';
        
        if (contentType === 'text') {
            content = block.querySelector('.text-content').innerHTML;
        } else if (contentType === 'image') {
            const img = block.querySelector('.image-content img');
            if (img) content = img.src;
        } else if (contentType === 'code') {
            const codeElement = block.querySelector('.code-content code');
            if (codeElement) content = codeElement.innerText;
        }
        
        postData.blocks.push({
            type: 'full',
            contentType: contentType,
            content: content
        });
    }
    
    // Bölünmüş blok toplama
    function collectSplitBlock(block, postData) {
        const leftSide = block.querySelector('.split-left');
        const rightSide = block.querySelector('.split-right');
        
        const leftType = leftSide.querySelector('.type-btn.active').dataset.type;
        const rightType = rightSide.querySelector('.type-btn.active').dataset.type;
        
        let leftContent = getContentByType(leftSide, leftType);
        let rightContent = getContentByType(rightSide, rightType);
        
        postData.blocks.push({
            type: 'split',
            left: {
                contentType: leftType,
                content: leftContent
            },
            right: {
                contentType: rightType,
                content: rightContent
            }
        });
    }
    
    // İçerik tipine göre içerik alma
    function getContentByType(container, contentType) {
        let content = '';
        
        if (contentType === 'text') {
            content = container.querySelector('.text-content').innerHTML;
        } else if (contentType === 'image') {
            const img = container.querySelector('.image-content img');
            if (img) content = img.src;
        } else if (contentType === 'code') {
            const codeElement = container.querySelector('.code-content code');
            if (codeElement) content = codeElement.innerText;
        }
        
        return content;
    }
    
    // Galeri blok toplama
    function collectGalleryBlock(block, postData) {
        const images = block.querySelectorAll('.gallery-item img');
        const galleryItems = [];
        
        images.forEach(img => {
            galleryItems.push({
                src: img.src,
                caption: img.alt || ''
            });
        });
        
        postData.blocks.push({
            type: 'gallery',
            items: galleryItems
        });
    }
    
    // Alıntı blok toplama
    function collectQuoteBlock(block, postData) {
        const quoteContent = block.querySelector('.quote-content').innerHTML;
        const quoteAuthor = block.querySelector('.quote-author').innerHTML;
        
        postData.blocks.push({
            type: 'quote',
            content: quoteContent,
            author: quoteAuthor
        });
    }
    
    // Video blok toplama
    function collectVideoBlock(block, postData) {
        const videoFrame = block.querySelector('.video-content iframe');
        let videoUrl = '';
        
        if (videoFrame) videoUrl = videoFrame.src;
        
        postData.blocks.push({
            type: 'video',
            url: videoUrl
        });
    }
    
    // Gömülü içerik blok toplama
    function collectEmbedBlock(block, postData) {
        const embedContent = block.querySelector('.embed-content').innerHTML;
        
        postData.blocks.push({
            type: 'embed',
            content: embedContent
        });
    }
    
    // 3D Model blok toplama
    function collect3DModelBlock(block, postData) {
        const modelPreview = block.querySelector('.model-preview');
        let modelUrl = '';
        
        if (modelPreview.dataset.modelUrl) modelUrl = modelPreview.dataset.modelUrl;
        
        postData.blocks.push({
            type: '3d-model',
            url: modelUrl
        });
    }
    
    // Base64 görüntülerini optimize etme fonksiyonu
    function optimizeImages(blocks) {
        blocks.forEach(block => {
            // Tam genişlik blokları için
            if (block.type === 'full' && block.contentType === 'image') {
                optimizeImageContent(block, 'content', 'image_full');
            }
            
            // Bölünmüş bloklar için
            if (block.type === 'split') {
                if (block.left && block.left.contentType === 'image') {
                    optimizeImageContent(block.left, 'content', 'image_split_left');
                }
                if (block.right && block.right.contentType === 'image') {
                    optimizeImageContent(block.right, 'content', 'image_split_right');
                }
            }
            
            // Galeri blokları için
            if (block.type === 'gallery' && Array.isArray(block.items)) {
                block.items.forEach((item, index) => {
                    optimizeImageContent(item, 'src', `image_gallery_${index}`);
                });
            }
        });
    }
    
    // Görüntü içeriğini optimize etme
    function optimizeImageContent(obj, propName, prefix) {
        if (obj[propName] && typeof obj[propName] === 'string' && obj[propName].startsWith('data:image')) {
            try {
                // Görüntü verisi çok büyükse kısalt (500KB'dan büyükse)
                if (obj[propName].length > 500000) {
                    const imageId = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    obj[propName] = imageId;
                    console.log(`Büyük görüntü optimize edildi: ${imageId}`);
                }
            } catch (e) {
                console.error('Görüntü işleme hatası:', e);
            }
        }
    }
      // StaticDataHandler ile veri kaydetme fonksiyonu
    async function sendToApi(postData, status) {
        // İçeriği JSON formatına dönüştür
        const contentJson = JSON.stringify(postData.blocks);
        console.log('İçerik JSON uzunluğu:', contentJson.length);
        
        // Mevcut kullanıcıyı al
        const currentUser = staticData.getCurrentUser();
        if (!currentUser) {
            showNotification('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        
        // StaticDataHandler'a gönderilecek veriyi hazırla
        const storyData = {
            title: postData.title,
            content: contentJson,
            category: postData.category,
            tags: postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            status: status,
            cover_image: postData.coverImage,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            view_count: 0,
            like_count: 0,
            comment_count: 0
        };
        
        // Mevcut gönderi ID'si varsa güncelleme yap
        const postId = new URLSearchParams(window.location.search).get('id');
        
        try {
            // İstek öncesi yükleniyor göstergesi
            showNotification('Gönderiniz kaydediliyor...', 'info');
            
            let data;
            
            if (postId) {
                // Var olan hikayeyi güncelle
                data = await staticData.updateStory(parseInt(postId), storyData);
            } else {
                // Yeni hikaye ekle
                data = await staticData.addStory(storyData);
            }
            
            handleApiSuccess(data, status, postId);
        } catch (error) {
            handleApiError(error);
        }
    }
      // Bu fonksiyon artık staticData kullanıldığından ihtiyaç duyulmuyor, ama
    // patlamayı önlemek için boş bir uygulama sağlıyoruz
    async function handleApiResponse(response) {
        return response;
    }
    
    // API başarı durumunu işleme
    function handleApiSuccess(data, status, postId) {
        // Başarı mesajı göster
        const successMessage = postId 
            ? 'Gönderiniz başarıyla güncellendi!' 
            : 'Gönderiniz başarıyla oluşturuldu!';
        
        showNotification(successMessage, 'success');
        
        // Yeni oluşturulan gönderinin ID'sini al
        const newPostId = data.id || (data.story ? data.story.id : null) || postId;
        
        // Otomatik kaydetme zamanlayıcısını temizle
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }
        
        // Yayınlandıysa gönderi sayfasına yönlendir
        if (status === 'published' && newPostId) {
            setTimeout(() => {
                window.location.href = `post_detail.html?id=${newPostId}`;
            }, 1500);
        } 
        // Taslak olarak kaydedildiyse URL'yi güncelle
        else if (!postId && newPostId) {
            // URL'yi güncelle ama sayfayı yenileme
            window.history.replaceState({}, '', `post_editor.html?id=${newPostId}`);
        }
    }
    
    // API hata durumunu işleme
    function handleApiError(error) {
        console.error('API hatası:', error);
        showNotification(error.message || 'Gönderi kaydedilirken bir hata oluştu', 'error');
    }
    
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
});
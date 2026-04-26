document.addEventListener('DOMContentLoaded', () => {
    // -- ARKA PLAN PARALAKS EFEKTİ (MOUSE İZLEME) --
    document.addEventListener('mousemove', (e) => {
        const hexBg = document.querySelector('.floating-hexagons');
        if (hexBg) {
            // Fare pozisyonunu ekranın merkezine göre normalize edip ters yönde itiyoruz (-1 çarpanı)
            // Çok hafif bir kaçış hissi için 40px sınır koyuyoruz
            const x = (e.clientX / window.innerWidth - 0.5) * 40; 
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            hexBg.style.setProperty('--mouseX', `${-x}px`);
            hexBg.style.setProperty('--mouseY', `${-y}px`);
        }
    });

    // -- ELEMENT TANIMLAMALARI --
    const soloPlayCard = document.getElementById('soloPlayCard');
    const duoPlayCard = document.getElementById('duoPlayCard');
    const rulesModal = document.getElementById('rulesModal');
    const settingsModal = document.getElementById('settingsModal');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const helpBtn = document.getElementById('helpBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const understandBtn = document.getElementById('understandBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // -- AYARLAR VERİ YÖNETİMİ --
    let selectedCategory = null;
    let selectedDifficulty = 'orta';

    const modalCategoryCards = document.querySelectorAll('#modalCategoryGrid .category-card');
    const modalDiffBtns = document.querySelectorAll('#modalDifficultyGroup .diff-btn');

    // Mevcut ayarları yükle
    const savedSettings = localStorage.getItem('petekGlobalSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        selectedCategory = settings.category;
        selectedDifficulty = settings.difficulty || 'orta';
        
        // UI Güncelle
        modalCategoryCards.forEach(card => {
            if (card.dataset.category === selectedCategory) card.classList.add('active');
        });
        modalDiffBtns.forEach(btn => {
            if (btn.dataset.diff === selectedDifficulty) btn.classList.add('active');
        });
    }

    modalCategoryCards.forEach(card => {
        card.addEventListener('click', () => {
            modalCategoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedCategory = card.dataset.category;
        });
    });

    modalDiffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalDiffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.diff;
        });
    });

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (!selectedCategory) {
                alert("Lütfen bir kategori seçin!");
                return;
            }
            localStorage.setItem('petekGlobalSettings', JSON.stringify({
                category: selectedCategory,
                difficulty: selectedDifficulty
            }));
            closeSettingsModal();
        });
    }

    // -- YÖNLENDİRME (ROUTING) İŞLEMLERİ --
    
    const checkSettingsAndGo = (targetUrl) => {
        const settingsRaw = localStorage.getItem('petekGlobalSettings');
        if (!settingsRaw) {
            alert("Oyuna başlamadan önce lütfen Ayarlar (⚙️) menüsünden bir kategori seçin!");
            openSettingsModal();
            return;
        }
        window.location.href = targetUrl;
    };

    if (soloPlayCard) soloPlayCard.addEventListener('click', () => checkSettingsAndGo('tek-kisilik.html'));
    if (duoPlayCard) duoPlayCard.addEventListener('click', () => checkSettingsAndGo('iki-kisilik-secim.html'));

    // -- MODAL (AÇILIR PENCERE) İŞLEMLERİ --
    
    const openModal = () => rulesModal && rulesModal.classList.add('active');
    const closeModal = () => rulesModal && rulesModal.classList.remove('active');
    
    const openSettingsModal = () => settingsModal && settingsModal.classList.add('active');
    const closeSettingsModal = () => settingsModal && settingsModal.classList.remove('active');

    if (howToPlayBtn) howToPlayBtn.addEventListener('click', openModal);
    if (helpBtn) helpBtn.addEventListener('click', openModal);
    if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (understandBtn) understandBtn.addEventListener('click', closeModal);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);

    if (rulesModal) {
        rulesModal.addEventListener('click', (e) => { if (e.target === rulesModal) closeModal(); });
    }
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // -- ELEMENT TANIMLAMALARI --
    const soloPlayCard = document.getElementById('soloPlayCard');
    const duoPlayCard = document.getElementById('duoPlayCard');
    const helpBtn = document.getElementById('helpBtn');

    const rulesModal = document.getElementById('rulesModal');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const understandBtn = document.getElementById('understandBtn');

    // -- YÖNLENDİRME (ROUTING) İŞLEMLERİ --
    
    // Tek Kişi Oyna Kartına Tıklanınca
    soloPlayCard.addEventListener('click', () => {
        window.location.href = 'tek-kisilik.html';
    });

    // İki Kişi Oyna Kartına Tıklanınca
    duoPlayCard.addEventListener('click', () => {
        window.location.href = 'iki-kisilik.html';
    });

    // -- MODAL (AÇILIR PENCERE) İŞLEMLERİ --
    
    // Modalı Açan Fonksiyon
    const openModal = () => {
        rulesModal.classList.add('active');
    };

    // Modalı Kapatan Fonksiyon
    const closeModal = () => {
        rulesModal.classList.remove('active');
    };

    // Butonlara modal açma olayı ekleme
    howToPlayBtn.addEventListener('click', openModal);
    helpBtn.addEventListener('click', openModal);

    // Kapatma butonlarına modal kapatma butonu ekleme
    closeModalBtn.addEventListener('click', closeModal);
    understandBtn.addEventListener('click', closeModal);

    // Modalın dışındaki siyah arka plana (overlay) tıklanınca kapatma
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            closeModal();
        }
    });
});

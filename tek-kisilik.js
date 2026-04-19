document.addEventListener('DOMContentLoaded', () => {
    const nicknameInput = document.getElementById('nickname');
    const avatarCards = document.querySelectorAll('.avatar-card');
    const categoryCards = document.querySelectorAll('.category-card');
    const diffBtns = document.querySelectorAll('.diff-btn');
    const startGameBtn = document.getElementById('startGameBtn');

    let selectedAvatar = null;
    let selectedCategory = null;
    let selectedDifficulty = null;

    // Formu kontrol edip butonu aktif/pasif yapar
    const checkForm = () => {
        const nickname = nicknameInput.value.trim();
        if (nickname.length > 0 && selectedAvatar !== null && selectedCategory !== null && selectedDifficulty !== null) {
            startGameBtn.disabled = false;
        } else {
            startGameBtn.disabled = true;
        }
    };

    // Avatar tıklama olayları
    avatarCards.forEach(card => {
        card.addEventListener('click', () => {
            avatarCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedAvatar = card.getAttribute('data-avatar');
            checkForm();
        });
    });

    // Kategori tıklama olayları
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Tüm kartlardan 'selected' (seçili) sınıfını kaldır
            categoryCards.forEach(c => c.classList.remove('selected'));
            
            // Tıklanan karta 'selected' sınıfını ekle
            card.classList.add('selected');
            selectedCategory = card.getAttribute('data-category');
            
            checkForm();
        });
    });

    // Zorluk seviyesi tıklama olayları
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDifficulty = btn.getAttribute('data-diff');
            checkForm();
        });
    });

    // İnput değiştiğinde kontrol et
    nicknameInput.addEventListener('input', checkForm);

    // Oyna butonu yönlendirmesi
    startGameBtn.addEventListener('click', () => {
        // Verileri local storage'a kaydet
        const gameData = {
            mode: 'tek-kisilik',
            nickname: nicknameInput.value.trim(),
            avatar: selectedAvatar,
            category: selectedCategory,
            difficulty: selectedDifficulty
        };
        localStorage.setItem('petekGameData', JSON.stringify(gameData));
        
        window.location.href = 'oyun.html';
    });
});

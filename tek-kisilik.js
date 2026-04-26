document.addEventListener('DOMContentLoaded', () => {
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const avatarCards = document.querySelectorAll('.avatar-card');
    const startGameBtn = document.getElementById('startGameBtn');

    let selectedAvatar = null;

    // E-mail Regex Kontrolü
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Formu kontrol edip butonu aktif/pasif yapar
    const checkForm = () => {
        const nickname = nicknameInput.value.trim();
        const email = emailInput.value.trim();
        const isEmailValid = validateEmail(email);

        if (nickname.length > 0 && isEmailValid && selectedAvatar !== null) {
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
            
            const imgElement = card.querySelector('img');
            selectedAvatar = imgElement.getAttribute('src');
            
            const playerPreviewImg = document.getElementById('selected-avatar-preview');
            if(playerPreviewImg) {
                playerPreviewImg.src = selectedAvatar;
                playerPreviewImg.style.display = 'block';
            }
            
            checkForm();
        });
    });

    // İnput değiştiğinde kontrol et
    nicknameInput.addEventListener('input', checkForm);
    emailInput.addEventListener('input', checkForm);

    // Oyna butonu yönlendirmesi
    startGameBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            alert("Lütfen geçerli bir e-mail adresi giriniz!");
            return;
        }

        // Global ayarları al
        const globalSettingsRaw = localStorage.getItem('petekGlobalSettings');
        const globalSettings = globalSettingsRaw ? JSON.parse(globalSettingsRaw) : { category: 'kultur', difficulty: 'orta' };

        // Verileri birleştirip kaydet
        const gameData = {
            mode: 'tek-kisilik',
            nickname: nickname,
            email: email,
            avatar: selectedAvatar,
            category: globalSettings.category,
            difficulty: globalSettings.difficulty
        };
        localStorage.setItem('petekGameData', JSON.stringify(gameData));
        
        window.location.href = 'oyun.html';
    });
});

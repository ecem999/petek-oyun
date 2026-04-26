document.addEventListener('DOMContentLoaded', () => {
    const hostNickname = document.getElementById('hostNickname');
    const hostEmail = document.getElementById('hostEmail');
    const hostAvatarGrid = document.querySelectorAll('#hostAvatarGrid .avatar-card');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    const roomStatusText = document.getElementById('roomStatusText');
    const startActionArea = document.getElementById('startActionArea');
    const opponentName = document.getElementById('opponentName');
    const startGameBtn = document.getElementById('startGameBtn');

    let hAvatar = null;
    let currentRoomCode = null;
    let pollInterval = null;

    // E-mail Regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Avatar Seçimi
    hostAvatarGrid.forEach(card => {
        card.addEventListener('click', () => {
            hostAvatarGrid.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            hAvatar = card.getAttribute('data-avatar');
            document.getElementById('hostPreviewImg').src = hAvatar;
            document.getElementById('hostPreviewImg').style.display = 'block';
            validateHostForm();
        });
    });

    hostNickname.addEventListener('input', validateHostForm);
    hostEmail.addEventListener('input', validateHostForm);

    function validateHostForm() {
        const emailVal = hostEmail.value.trim();
        const nickVal = hostNickname.value.trim();
        const isEmailValid = validateEmail(emailVal);

        if (hAvatar && nickVal.length > 0 && isEmailValid) {
            createRoomBtn.style.opacity = '1';
            createRoomBtn.style.pointerEvents = 'all';
        } else {
            createRoomBtn.style.opacity = '0.5';
            createRoomBtn.style.pointerEvents = 'none';
        }
    }

    createRoomBtn.addEventListener('click', () => {
        const emailVal = hostEmail.value.trim();
        if (!validateEmail(emailVal)) {
            alert("Lütfen geçerli bir e-mail adresi giriniz!");
            return;
        }

        // Global ayarları al
        const globalSettingsRaw = localStorage.getItem('petekGlobalSettings');
        const globalSettings = globalSettingsRaw ? JSON.parse(globalSettingsRaw) : { category: 'kultur', difficulty: 'orta' };

        // Kod Üret
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentRoomCode = code;
        roomCodeDisplay.textContent = code;

        // Odayı LS'a kaydet
        const roomData = {
            id: code,
            hostNickname: hostNickname.value.trim(),
            hostEmail: emailVal,
            hostAvatar: hAvatar,
            category: globalSettings.category,
            difficulty: globalSettings.difficulty,
            status: 'created',
            timestamp: Date.now()
        };
        localStorage.setItem(`room_${code}`, JSON.stringify(roomData));

        // UI Güncelle
        createRoomBtn.style.display = 'none';
        roomStatusText.style.display = 'block';
        hostNickname.disabled = true;
        hostEmail.disabled = true;
        hostAvatarGrid.forEach(c => c.style.pointerEvents = 'none');

        // Session'a kaydet
        sessionStorage.setItem('petekMultiData', JSON.stringify({ role: 'host', roomKey: `room_${code}` }));

        // Kopyala butonunu göster
        const copyBtn = document.getElementById('copyCodeBtn');
        if(copyBtn) copyBtn.style.display = 'flex';

        // Polling başlat
        startPolling(code);
    });

    // Kopyalama Mantığı
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            if (!currentRoomCode) return;
            
            navigator.clipboard.writeText(currentRoomCode).then(() => {
                const tooltip = document.getElementById('copyTooltip');
                if (tooltip) {
                    tooltip.classList.add('visible');
                    setTimeout(() => {
                        tooltip.classList.remove('visible');
                    }, 2000);
                }
            }).catch(err => {
                console.error('Kopyalama başarısız: ', err);
            });
        });
    }

    function startPolling(code) {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(() => {
            const roomRaw = localStorage.getItem(`room_${code}`);
            if (roomRaw) {
                const room = JSON.parse(roomRaw);
                if (room.status === 'joined') {
                    clearInterval(pollInterval);
                    showStartGame(room.joinerNickname);
                }
            }
        }, 2000);
    }

    function showStartGame(jName) {
        roomStatusText.textContent = "Rakip Katıldı! 🎉";
        roomStatusText.style.color = "#4CAF50";
        opponentName.textContent = jName;
        startActionArea.style.display = 'block';
    }

    startGameBtn.addEventListener('click', () => {
        const roomRaw = localStorage.getItem(`room_${currentRoomCode}`);
        if (roomRaw) {
            const room = JSON.parse(roomRaw);
            room.status = 'started';
            localStorage.setItem(`room_${currentRoomCode}`, JSON.stringify(room));
            window.location.href = 'oyun-2.html';
        }
    });
});

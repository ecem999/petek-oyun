document.addEventListener('DOMContentLoaded', () => {
    const joinerNickname = document.getElementById('joinerNickname');
    const joinerEmail = document.getElementById('joinerEmail');
    const joinerAvatarGrid = document.querySelectorAll('#joinerAvatarGrid .avatar-card');
    const joinCode = document.getElementById('joinCode');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const joinStatusText = document.getElementById('joinStatusText');

    let jAvatar = null;
    let pollInterval = null;

    // E-mail Regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Avatar Seçimi
    joinerAvatarGrid.forEach(card => {
        card.addEventListener('click', () => {
            joinerAvatarGrid.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            jAvatar = card.getAttribute('data-avatar');
            document.getElementById('joinerPreviewImg').src = jAvatar;
            document.getElementById('joinerPreviewImg').style.display = 'block';
            validateJoinerForm();
        });
    });

    joinerNickname.addEventListener('input', validateJoinerForm);
    joinerEmail.addEventListener('input', validateJoinerForm);
    joinCode.addEventListener('input', validateJoinerForm);

    function validateJoinerForm() {
        const emailVal = joinerEmail.value.trim();
        const nickVal = joinerNickname.value.trim();
        const codeVal = joinCode.value.trim();
        const isEmailValid = validateEmail(emailVal);

        if (jAvatar && nickVal.length > 0 && isEmailValid && codeVal.length === 4) {
            joinRoomBtn.style.opacity = '1';
            joinRoomBtn.style.pointerEvents = 'all';
        } else {
            joinRoomBtn.style.opacity = '0.5';
            joinRoomBtn.style.pointerEvents = 'none';
        }
    }

    joinRoomBtn.addEventListener('click', () => {
        const emailVal = joinerEmail.value.trim();
        if (!validateEmail(emailVal)) {
            alert("Lütfen geçerli bir e-mail adresi giriniz!");
            return;
        }

        const code = joinCode.value.trim().toUpperCase();
        const roomKey = `room_${code}`;

        const roomRaw = localStorage.getItem(roomKey);
        if (roomRaw) {
            const roomData = JSON.parse(roomRaw);
            if (roomData.status === 'created') {
                // Odaya gir!
                roomData.status = 'joined';
                roomData.joinerNickname = joinerNickname.value.trim();
                roomData.joinerEmail = emailVal;
                roomData.joinerAvatar = jAvatar;
                
                localStorage.setItem(roomKey, JSON.stringify(roomData));
                
                // UI Güncelle
                joinRoomBtn.style.display = 'none';
                joinStatusText.style.display = 'block';
                joinCode.disabled = true;
                joinerNickname.disabled = true;
                joinerEmail.disabled = true;
                joinerAvatarGrid.forEach(c => c.style.pointerEvents = 'none');

                // Session'a kaydet
                sessionStorage.setItem('petekMultiData', JSON.stringify({ role: 'joiner', roomKey: roomKey }));

                // Polling başlat (Oyun başlasın mı diye)
                startStartPoll(roomKey);

            } else {
                alert("Uyarı: Bu oda dolu veya oyun zaten başlamış.");
            }
        } else {
            alert("Hata: Geçersiz oda kodu!");
        }
    });

    function startStartPoll(roomKey) {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(() => {
            const roomRaw = localStorage.getItem(roomKey);
            if (roomRaw) {
                const room = JSON.parse(roomRaw);
                if (room.status === 'started') {
                    clearInterval(pollInterval);
                    window.location.href = 'oyun-2.html';
                }
            }
        }, 2000);
    }
});

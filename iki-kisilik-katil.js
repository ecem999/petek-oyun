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

        db.ref('rooms/' + code).once('value').then((snapshot) => {
            const roomData = snapshot.val();
            
            if (roomData) {
                if (roomData.status === 'created') {
                    // Odaya gir!
                    const updates = {
                        status: 'joined',
                        joinerNickname: joinerNickname.value.trim(),
                        joinerEmail: emailVal,
                        joinerAvatar: jAvatar
                    };
                    
                    db.ref('rooms/' + code).update(updates).then(() => {
                        // UI Güncelle
                        joinRoomBtn.style.display = 'none';
                        joinStatusText.style.display = 'block';
                        joinCode.disabled = true;
                        joinerNickname.disabled = true;
                        joinerEmail.disabled = true;
                        joinerAvatarGrid.forEach(c => c.style.pointerEvents = 'none');

                        // Session'a kaydet
                        sessionStorage.setItem('petekMultiData', JSON.stringify({ role: 'joiner', roomCode: code }));

                        // Firebase Dinleyici Başlat (Oyun başlasın mı diye)
                        listenForStart(code);
                    });
                } else {
                    alert("Uyarı: Bu oda dolu veya oyun zaten başlamış.");
                }
            } else {
                alert("Hata: Geçersiz oda kodu!");
            }
        });
    });

    function listenForStart(code) {
        db.ref('rooms/' + code).on('value', (snapshot) => {
            const room = snapshot.val();
            if (room && room.status === 'started') {
                window.location.href = 'oyun-2.html';
            }
        });
    }
});

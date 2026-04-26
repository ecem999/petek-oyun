document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. KATILIMCI (JOINER) MANTIĞI
    // ==========================================
    const joinerNickname = document.getElementById('joinerNickname');
    const joinerAvatarGrid = document.querySelectorAll('#joinerAvatarGrid .avatar-card');
    const joinCode = document.getElementById('joinCode');
    const joinGameBtn = document.getElementById('joinGameBtn');
    const joinStatusText = document.getElementById('joinStatusText');

    let jAvatar = null;
    let currentRoomCode = null;

    // Avatar Seçimi (Katılımcı)
    joinerAvatarGrid.forEach(card => {
        card.addEventListener('click', () => {
            joinerAvatarGrid.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const imgElement = card.querySelector('img');
            jAvatar = imgElement.getAttribute('src');
            
            const joinerPreviewImg = document.getElementById('joinerPreviewImg');
            if(joinerPreviewImg) {
                joinerPreviewImg.src = jAvatar;
                joinerPreviewImg.style.display = 'block';
            }
            
            validateJoinerForm();
        });
    });

    joinerNickname.addEventListener('input', validateJoinerForm);
    joinCode.addEventListener('input', validateJoinerForm);

    function validateJoinerForm() {
        if (jAvatar && joinerNickname.value.trim().length > 0 && joinCode.value.trim().length === 4) {
            joinGameBtn.style.opacity = '1';
            joinGameBtn.style.pointerEvents = 'all';
        } else {
            joinGameBtn.style.opacity = '0.5';
            joinGameBtn.style.pointerEvents = 'none';
        }
    }

    joinGameBtn.addEventListener('click', () => {
        const code = joinCode.value.trim().toUpperCase();
        const roomKey = `room_${code}`;
        currentRoomCode = roomKey;

        // Odayı LS'dan kontrol et
        const roomRaw = localStorage.getItem(roomKey);
        if (roomRaw) {
            const roomData = JSON.parse(roomRaw);
            if (roomData.status === 'created') {
                // Odaya gir!
                roomData.status = 'joined';
                roomData.joinerNickname = joinerNickname.value.trim();
                roomData.joinerAvatar = jAvatar;
                
                localStorage.setItem(roomKey, JSON.stringify(roomData));
                
                // Formu kilitle, bildirim ver
                joinGameBtn.style.display = 'none';
                joinStatusText.style.display = 'block';
                joinCode.disabled = true;
                joinerNickname.disabled = true;

                // Kendi lokal oturumu (SADECE BU SEKME İÇİN) kimlik oluştur
                sessionStorage.setItem('petekMultiData', JSON.stringify({ role: 'joiner', roomKey: roomKey }));

            } else if (roomData.status === 'joined') {
                alert("Uyarı: Bu oda zaten dolu.");
            } else {
                alert("Uyarı: Bu oyun çoktan başlamış veya bitmiş.");
            }
        } else {
            alert("Hata: Geçersiz veya süresi dolmuş oyun kodu!");
        }
    });

    // ==========================================
    // 2. KURUCU (HOST) MANTIĞI
    // ==========================================
    const hostNickname = document.getElementById('hostNickname');
    const hostAvatarGrid = document.querySelectorAll('#hostAvatarGrid .avatar-card');
    const categoryCards = document.querySelectorAll('.category-card');
    const generateCodeBtn = document.getElementById('generateCodeBtn');
    
    const codeDisplayArea = document.getElementById('codeDisplayArea');
    const generatedCodeBox = document.getElementById('generatedCodeBox');
    const hostStatusText = document.getElementById('hostStatusText');
    const startHostGameBtn = document.getElementById('startHostGameBtn');

    let hAvatar = null;
    let hCategory = null;
    let hostRoomKey = null;

    hostAvatarGrid.forEach(card => {
        card.addEventListener('click', () => {
            hostAvatarGrid.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const imgElement = card.querySelector('img');
            hAvatar = imgElement.getAttribute('src');
            
            const hostPreviewImg = document.getElementById('hostPreviewImg');
            if(hostPreviewImg) {
                hostPreviewImg.src = hAvatar;
                hostPreviewImg.style.display = 'block';
            }
            
            validateHostForm();
        });
    });

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            hCategory = card.getAttribute('data-category');
            validateHostForm();
        });
    });

    hostNickname.addEventListener('input', validateHostForm);

    function validateHostForm() {
        if (hAvatar && hCategory && hostNickname.value.trim().length > 0) {
            generateCodeBtn.style.opacity = '1';
            generateCodeBtn.style.pointerEvents = 'all';
        } else {
            generateCodeBtn.style.opacity = '0.5';
            generateCodeBtn.style.pointerEvents = 'none';
        }
    }

    generateCodeBtn.addEventListener('click', () => {
        // Rastgele 4 Haneli Kod (Sadece Harf Rakam)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        
        hostRoomKey = `room_${code}`;

        // Oda Bilgilerini LocalStorage'a kaydet
        const roomObj = {
            status: 'created',
            category: hCategory,
            hostNickname: hostNickname.value.trim(),
            hostAvatar: hAvatar,
            joinerNickname: null,
            joinerAvatar: null
        };
        localStorage.setItem(hostRoomKey, JSON.stringify(roomObj));

        // Formu kitle, UI göster
        generatedCodeBox.textContent = code;
        generateCodeBtn.style.display = 'none';
        codeDisplayArea.style.display = 'block';

        hostNickname.disabled = true;
        
        // Kendi lokal oturumu (SADECE BU SEKME İÇİN) kimlik kaydet
        sessionStorage.setItem('petekMultiData', JSON.stringify({ role: 'host', roomKey: hostRoomKey }));
    });

    // ==========================================
    // 3. ANLIK SİNKRONİZASYON (STORAGE EVENT)
    // ==========================================
    window.addEventListener('storage', (e) => {
        
        // Eğer ben Kurucu isem ve benim odamda değişiklik varsa
        if (hostRoomKey && e.key === hostRoomKey && e.newValue) {
            const newData = JSON.parse(e.newValue);
            if (newData.status === 'joined') {
                hostStatusText.innerHTML = `✅ <strong>${newData.joinerNickname}</strong> odaya katıldı!`;
                startHostGameBtn.style.opacity = '1';
                startHostGameBtn.style.pointerEvents = 'all';
            }
        }

        // Eğer ben Katılımcı isem ve benim beklediğim oda değişmişse
        if (currentRoomCode && e.key === currentRoomCode && e.newValue) {
            const newData = JSON.parse(e.newValue);
            if (newData.status === 'started') {
                // Kurucu oyunu başlattıysa ben de yönleniyorum
                window.location.href = 'oyun-2.html';
            }
        }
    });

    // ==========================================
    // 4. BAŞLAT BUTONU
    // ==========================================
    startHostGameBtn.addEventListener('click', () => {
        const roomRaw = localStorage.getItem(hostRoomKey);
        if (roomRaw) {
            const roomData = JSON.parse(roomRaw);
            roomData.status = 'started'; // Odayı Started moduna al (Bu Joiner'ı tetikler)
            
            // Oyun Motoru ilk kurulumunu yönlenmeden ÖNCE Host yapar (Yarışma Koşulu / Race Condition Bugfix)
            roomData.hostScore = 0;
            roomData.joinerScore = 0;
            roomData.gameState = {
                turn: 'host', 
                solver: 'host', // Varsayılan Başlangıç (otomatik olarak aktif oyuncu)
                isStolen: false,
                hexesCompleted: 0,
                activeHexVal: null,
                activeQuestionId: null,
                usedQuestions: [], // Soru tekrarını engelleme motoru
                shuffledIndices: [0, 1, 2, 3].sort(() => Math.random() - 0.5),
                lastAction: 'init',
                actionTimestamp: Date.now()
            };
            
            roomData.boardState = {};
            const pointsList = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
            pointsList.forEach(pts => roomData.boardState[`hex_${pts}`] = 'available');

            localStorage.setItem(hostRoomKey, JSON.stringify(roomData));
            
            // Host olarak hemen yönlen
            window.location.href = 'oyun-2.html';
        }
    });
});

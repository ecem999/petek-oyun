// Global Fonksiyonlar
function confirmExit(e) {
    if(e) e.preventDefault();
    const modal = document.getElementById('exitModal');
    if(modal) modal.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Modal Buton Dinleyicileri
    const exitModal = document.getElementById('exitModal');
    const confirmBtn = document.getElementById('confirmExitBtn');
    const cancelBtn = document.getElementById('cancelExitBtn');

    if(confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            exitModal.classList.remove('active');
        });
    }

    if(exitModal) {
        exitModal.addEventListener('click', (e) => {
            if(e.target === exitModal) {
                exitModal.classList.remove('active');
            }
        });
    }

    // 1. SORU BANKASI ENTEGRASYONU
    const pointsList = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
    let questionDB = [];

    if (window.PETEK_SORU_BANKASI) {
        window.PETEK_SORU_BANKASI.forEach(catObj => {
            catObj.sorular.forEach((q, idx) => {
                questionDB.push({
                    id: `${catObj.kategori}_${q.puan}_${idx}`, 
                    category: catObj.kategori,
                    points: q.puan,
                    question: q.soru,
                    options: q.options,
                    correctIndex: q.correctIndex
                });
            });
        });
    }

    // 2. OYUN KİMLİĞİ
    const localMetaRaw = sessionStorage.getItem('petekMultiData');
    if (!localMetaRaw) {
        alert("Kimlik hatası! Lütfen odanızı tekrar kurun.");
        window.location.href = 'index.html';
        return;
    }
    const localMeta = JSON.parse(localMetaRaw);
    const roomCode = localMeta.roomCode;
    const myRole = localMeta.role; // 'host' veya 'joiner'

    // DOM Elemanları
    const p1Name = document.getElementById('p1Name'); const p1Avatar = document.getElementById('p1Avatar'); const p1Score = document.getElementById('p1Score');
    const p2Name = document.getElementById('p2Name'); const p2Avatar = document.getElementById('p2Avatar'); const p2Score = document.getElementById('p2Score');
    const p1InfoBox = document.getElementById('p1InfoBox');
    const p2InfoBox = document.getElementById('p2InfoBox');
    
    const boardBlocker = document.getElementById('boardBlocker');
    const waitOverlayText = document.getElementById('waitOverlayText');
    const hexPoints = document.querySelectorAll('.hex-point');
    const questionText = document.getElementById('questionText');
    const answersGrid = document.getElementById('answersGrid');
    const ansBtns = document.querySelectorAll('.ans-btn');
    const countdownEl = document.getElementById('countdown');
    
    const turnOverlay = document.getElementById('turnOverlay');
    const turnText = document.getElementById('turnText');
    const endGameModal = document.getElementById('endGameModal');

    let timerInterval = null; 
    let localTimeRem = 15;
    let sCache = { lastActionTimestamp: 0 };

    // --- BAŞLANGIÇ AYARLARI (HOST İÇİN) ---
    if (myRole === 'host') {
        db.ref('rooms/' + roomCode).once('value').then(snap => {
            const room = snap.val();
            if (room && !room.gameState) {
                const initialBoard = {};
                pointsList.forEach(v => initialBoard[`hex_${v}`] = 'available');
                
                db.ref('rooms/' + roomCode).update({
                    hostScore: 0,
                    joinerScore: 0,
                    boardState: initialBoard,
                    gameState: {
                        turn: 'host',
                        solver: 'host',
                        isStolen: false,
                        activeHexVal: null,
                        activeQuestionId: null,
                        shuffledIndices: null,
                        hexesCompleted: 0,
                        lastAction: 'gameStarted',
                        actionTimestamp: firebase.database.ServerValue.TIMESTAMP,
                        usedQuestions: []
                    }
                });
            }
        });
    }

    // 3. FİREBASE DİNLEYİCİSİ (KALP ATIŞI)
    db.ref('rooms/' + roomCode).on('value', (snapshot) => {
        const room = snapshot.val();
        if (!room) return;
        
        applyStateToUI(room);
    });

    function applyStateToUI(room) {
        const gs = room.gameState;
        if (!gs) return;

        // --- Navbar ve Puanlar ---
        p1Name.textContent = (room.hostNickname || 'Kurucu').slice(0, 10);
        if(room.hostAvatar) p1Avatar.innerHTML = `<img src="${room.hostAvatar}" alt="${room.hostNickname}">`;
        p1Score.textContent = room.hostScore;
        
        p2Name.textContent = (room.joinerNickname || 'Katılımcı').slice(0, 10);
        if(room.joinerAvatar) p2Avatar.innerHTML = `<img src="${room.joinerAvatar}" alt="${room.joinerNickname}">`;
        p2Score.textContent = room.joinerScore;

        // --- Aktif Oyuncu Parlaması ---
        if (gs.solver === 'host') { 
            p1InfoBox.classList.add('active-turn'); 
            p2InfoBox.classList.remove('active-turn'); 
        } else { 
            p2InfoBox.classList.add('active-turn'); 
            p1InfoBox.classList.remove('active-turn'); 
        }

        // --- Board Kilit Mekanizması ---
        if (gs.solver !== myRole) {
            boardBlocker.classList.remove('hidden');
            waitOverlayText.textContent = "Rakip Seçim Yapıyor...";
        } else {
            boardBlocker.classList.add('hidden');
        }

        // --- Petek Durumları ---
        hexPoints.forEach(hex => {
            const val = hex.getAttribute('data-val');
            const state = room.boardState[`hex_${val}`];
            hex.classList.remove('host_won', 'joiner_won', 'dead', 'active');
            if (state === 'host_won') hex.classList.add('host_won');
            else if (state === 'joiner_won') hex.classList.add('joiner_won');
            else if (state === 'dead') hex.classList.add('dead');
            
            if (gs.activeHexVal == val) hex.classList.add('active');
        });

        // --- Aksiyon İşleme ---
        if (gs.actionTimestamp !== sCache.lastActionTimestamp) {
            sCache.lastActionTimestamp = gs.actionTimestamp;
            processEventAction(room, gs);
        }
    }

    function processEventAction(room, gs) {
        clearInterval(timerInterval);
        const act = gs.lastAction;

        if (act === 'hexSelected') {
            const qObj = questionDB.find(q => q.id === gs.activeQuestionId);
            if (qObj) renderQuestionUI(qObj, gs.shuffledIndices);
            answersGrid.style.opacity = '1';
            startLocalTimer(15, room);
        }
        else if (act === 'answeredCorrectly') {
            flashScreen('green');
            answersGrid.style.opacity = '0.5';
            const winner = (gs.solver === 'host') ? room.hostNickname : room.joinerNickname;
            questionText.textContent = `${winner} doğru cevapladı! ✨`;
            if (myRole === 'host') setTimeout(() => checkAndResetBoard(room), 2000);
        }
        else if (act === 'stolen') {
            flashScreen('red');
            answersGrid.style.opacity = '0.5';
            questionText.textContent = "Hata! Sıra rakibe geçiyor...";
            
            if (gs.solver === myRole) {
                showTurnOverlay(`SIRA SENDE! FIRSAT`, () => {
                    const qObj = questionDB.find(q => q.id === gs.activeQuestionId);
                    renderQuestionUI(qObj, gs.shuffledIndices);
                    questionText.innerHTML = `<strong style="color: #03A9F4;">(DEVREDİLEN SORU)</strong><br />${qObj.question}`;
                    answersGrid.style.opacity = '1';
                    startLocalTimer(15, room);
                });
            }
        }
        else if (act === 'burned') {
            flashScreen('red');
            answersGrid.style.opacity = '0.5';
            questionText.textContent = "Soru bilemedi ve yandı! 🔥";
            if (myRole === 'host') setTimeout(() => checkAndResetBoard(room), 2000);
        }
        else if (act === 'turnReset') {
            ansBtns.forEach(btn => btn.classList.remove('correct', 'wrong'));
            answersGrid.style.opacity = '0.5';
            countdownEl.textContent = '15';
            if (gs.solver === myRole) questionText.textContent = "Senin sıran! Bir petek seç.";
            else questionText.textContent = "Rakip bekleniyor...";
        }
        else if (act === 'endGame') {
            triggerEndGameUI(room);
        }
    }

    function renderQuestionUI(qObj, indices) {
        questionText.innerHTML = `<strong>(${qObj.points} Puanlık Soru)</strong><br />${qObj.question}`;
        ansBtns.forEach((btn, idx) => {
            btn.classList.remove('correct', 'wrong');
            const mapIdx = indices[idx];
            btn.textContent = ['A) ', 'B) ', 'C) ', 'D) '][idx] + qObj.options[mapIdx];
            btn.setAttribute('data-correct', mapIdx === qObj.correctIndex ? 'true' : 'false');
        });
    }

    function startLocalTimer(secs, room) {
        clearInterval(timerInterval);
        localTimeRem = secs;
        countdownEl.textContent = localTimeRem;
        timerInterval = setInterval(() => {
            localTimeRem--;
            countdownEl.textContent = localTimeRem;
            if (localTimeRem <= 0) {
                clearInterval(timerInterval);
                if (room.gameState.solver === myRole) dispatchAnswer(false, room);
            }
        }, 1000);
    }

    // 4. ETKİLEŞİMLER (MUTATORS)
    hexPoints.forEach(hex => {
        hex.addEventListener('click', () => {
            db.ref('rooms/' + roomCode).once('value').then(snap => {
                const room = snap.val();
                if (room.gameState.solver !== myRole || room.gameState.activeHexVal != null) return;
                
                const pts = parseInt(hex.getAttribute('data-val'));
                if (room.boardState[`hex_${pts}`] !== 'available') return;

                // Soru Seç
                const used = room.gameState.usedQuestions || [];
                let pool = questionDB.filter(q => q.category === room.category && q.points === pts && !used.includes(q.id));
                if (pool.length === 0) pool = questionDB.filter(q => q.category === room.category && q.points === pts);
                
                const chosen = pool[Math.floor(Math.random() * pool.length)];
                
                const updates = {};
                updates['gameState/activeHexVal'] = pts;
                updates['gameState/activeQuestionId'] = chosen.id;
                updates['gameState/shuffledIndices'] = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
                updates['gameState/lastAction'] = 'hexSelected';
                updates['gameState/actionTimestamp'] = firebase.database.ServerValue.TIMESTAMP;
                updates['gameState/usedQuestions'] = [...used, chosen.id];
                
                db.ref('rooms/' + roomCode).update(updates);
            });
        });
    });

    ansBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            db.ref('rooms/' + roomCode).once('value').then(snap => {
                const room = snap.val();
                if (room.gameState.solver !== myRole) return;
                const isCorrect = btn.getAttribute('data-correct') === 'true';
                dispatchAnswer(isCorrect, room);
            });
        });
    });

    function dispatchAnswer(isCorrect, room) {
        clearInterval(timerInterval);
        const gs = room.gameState;
        const pts = gs.activeHexVal;
        const updates = {};

        if (isCorrect) {
            const roleScoreKey = (myRole === 'host') ? 'hostScore' : 'joinerScore';
            updates[roleScoreKey] = (room[roleScoreKey] || 0) + pts;
            updates[`boardState/hex_${pts}`] = (myRole === 'host') ? 'host_won' : 'joiner_won';
            updates['gameState/lastAction'] = 'answeredCorrectly';
            updates['gameState/hexesCompleted'] = (gs.hexesCompleted || 0) + 1;
        } else {
            if (!gs.isStolen) {
                updates['gameState/isStolen'] = true;
                updates['gameState/solver'] = (myRole === 'host') ? 'joiner' : 'host';
                updates['gameState/lastAction'] = 'stolen';
            } else {
                updates[`boardState/hex_${pts}`] = 'dead';
                updates['gameState/lastAction'] = 'burned';
                updates['gameState/hexesCompleted'] = (gs.hexesCompleted || 0) + 1;
            }
        }
        updates['gameState/actionTimestamp'] = firebase.database.ServerValue.TIMESTAMP;
        db.ref('rooms/' + roomCode).update(updates);
    }

    function checkAndResetBoard(room) {
        const gs = room.gameState;
        const updates = {};
        if (gs.hexesCompleted >= 10) {
            updates['gameState/lastAction'] = 'endGame';
        } else {
            const nextTurn = (gs.turn === 'host') ? 'joiner' : 'host';
            updates['gameState/turn'] = nextTurn;
            updates['gameState/solver'] = nextTurn;
            updates['gameState/isStolen'] = false;
            updates['gameState/activeHexVal'] = null;
            updates['gameState/lastAction'] = 'turnReset';
        }
        updates['gameState/actionTimestamp'] = firebase.database.ServerValue.TIMESTAMP;
        db.ref('rooms/' + roomCode).update(updates);
    }

    // 5. YARDIMCI GÖRSEL FONKSİYONLAR
    function flashScreen(color) {
        const div = document.createElement('div');
        div.className = color === 'green' ? 'flash-overlay-green' : 'flash-overlay-red';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 600);
    }

    function showTurnOverlay(text, callback) {
        turnText.textContent = text;
        turnOverlay.classList.add('show');
        setTimeout(() => {
            turnOverlay.classList.remove('show');
            if (callback) callback();
        }, 1500);
    }

    function triggerEndGameUI(room) {
        document.getElementById('endP1ScoreVal').textContent = room.hostScore;
        document.getElementById('endP2ScoreVal').textContent = room.joinerScore;
        document.getElementById('endP1Name').textContent = room.hostNickname;
        document.getElementById('endP2Name').textContent = room.joinerNickname;
        
        if(room.hostAvatar) document.getElementById('endP1Avatar').innerHTML = `<img src="${room.hostAvatar}" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:4px solid #00E5FF;">`;
        if(room.joinerAvatar) document.getElementById('endP2Avatar').innerHTML = `<img src="${room.joinerAvatar}" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:4px solid #FF1744;">`;

        const endTitle = document.getElementById('endGameTitle');
        if (room.hostScore > room.joinerScore) endTitle.textContent = `🏆 ${room.hostNickname} Kazandı!`;
        else if (room.joinerScore > room.hostScore) endTitle.textContent = `🏆 ${room.joinerNickname} Kazandı!`;
        else endTitle.textContent = "Berabere! 🤝";

        endGameModal.classList.add('active');
        document.getElementById('returnHomeBtn').onclick = () => {
            if (myRole === 'host') db.ref('rooms/' + roomCode).remove();
            window.location.href = 'index.html';
        };
    }
});

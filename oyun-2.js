document.addEventListener('DOMContentLoaded', () => {

    // 1. SORU BANKASI ENTEGRASYONU (DİNAMİK)
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

    // 2. OYUN KİMLİĞİ VE MASTER DEBUG LOGGING
    const localMetaRaw = sessionStorage.getItem('petekMultiData');
    if (!localMetaRaw) {
        alert("Kimlik hatası! Lütfen odanızı tekrar kurun.");
        window.location.href = 'index.html';
        return;
    }
    const localMeta = JSON.parse(localMetaRaw);
    const roomKey = localMeta.roomKey;
    const myRole = localMeta.role; // 'host' veya 'joiner'

    console.log("=== MASTER DEBUG ===");
    console.log("Oda Anahtarı:", roomKey);
    console.log("Benim Rolüm:", myRole);

    const checkRoomRaw = localStorage.getItem(roomKey);
    if (!checkRoomRaw) {
        console.error("LocalStorage Veri Tutarlılığı Hatası: Oda bulunamadı!");
        return;
    }
    const safeRoom = JSON.parse(checkRoomRaw);
    console.log(`LocalStorage Verisi -> Başlangıç: hostName[${safeRoom.hostNickname}], guestName[${safeRoom.joinerNickname}]`);
    console.log(`LocalStorage Verisi -> Güncel Sıra (Solver/Turn): ${safeRoom.gameState?.solver}`);
    console.log("====================");

    // DOM Elem
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

    let sCache = { lastTimestamp: 0 };
    let timerInterval = null; 
    let localTimeRem = 15;

    // A. UYGULAMA (STATE TO UI ÇEVİRİCİSİ)
    function applyStateToUI() {
        const roomRaw = localStorage.getItem(roomKey);
        if(!roomRaw) return;
        const room = JSON.parse(roomRaw);
        
        if (!room.gameState) {
            console.warn("GameState henüz hazır değil. Senkronizasyon bekleniyor...");
            return; 
        }
        const gs = room.gameState;
        
        // --- Navbar İsimleri ---
        const avatarMap = { 'erkek': '👨', 'kadin': '👩', 'cinsiyetsiz': '🧑' };
        p1Name.textContent = (room.hostNickname || 'Kurucu').slice(0, 10);
        p1Avatar.textContent = avatarMap[room.hostAvatar] || '👨';
        p1Score.textContent = room.hostScore;
        
        p2Name.textContent = (room.joinerNickname || 'Katılımcı').slice(0, 10);
        p2Avatar.textContent = avatarMap[room.joinerAvatar] || '👩';
        p2Score.textContent = room.joinerScore;

        // --- GLOW ANIMATION ENTEGRASYONU ---
        if (gs.solver === 'host') { 
            p1InfoBox.classList.add('active-turn'); 
            p2InfoBox.classList.remove('active-turn'); 
        } else { 
            p2InfoBox.classList.add('active-turn'); 
            p1InfoBox.classList.remove('active-turn'); 
        }

        // --- EKRAN KİLİDİ (BLOCKER) DOM MANİPÜLASYONU ---
        if (gs.solver !== myRole) {
            boardBlocker.classList.remove('hidden'); 
            boardBlocker.style.display = 'flex'; 
            waitOverlayText.textContent = "Sıra Rakipte! Hamle yapması bekleniyor...";
            answersGrid.style.pointerEvents = 'none';
        } else {
            boardBlocker.classList.add('hidden'); // Kesinlikle gizle
            answersGrid.style.pointerEvents = 'auto'; 
        }

        // --- BOARD RENKLERİ VE RAKİP TAKİBİ (MAVİ) ---
        pointsList.forEach(val => {
            const hx = document.querySelector(`.hex-point[data-val="${val}"]`);
            if(!hx) return;
            const stat = room.boardState[`hex_${val}`];
            
            hx.className = 'hex-point'; // reset
            
            if (stat === 'host_won') hx.classList.add('p1-correct');
            else if (stat === 'joiner_won') hx.classList.add('p2-correct');
            else if (stat === 'dead') hx.classList.add('played');
            else {
                // Aktif açık soru varsa
                if (gs.activeHexVal == val) {
                    if (gs.isStolen) {
                        hx.classList.add('opponent-focus'); // Çalınan Petek herkese MAVİ kalsın
                    } else if (gs.solver === myRole) {
                        hx.classList.add('opponent-focus'); // Kendi açtığı (Sadece renk değişimi, kalıcı büyüme yok)
                    } else {
                        hx.classList.add('opponent-focus'); // Rakibin açtığı soru
                    }
                }
            }
        });

        // --- EYLEM (HİKAYE) AĞACI ---
        if (gs.actionTimestamp > sCache.lastTimestamp) {
            console.log(`[STORAGE EVENT] Yeni Olay: ${gs.lastAction}`);
            sCache.lastTimestamp = gs.actionTimestamp;
            processEventAction(room, gs);
        }
    }

    function processEventAction(room, gs) {
        clearInterval(timerInterval); 
        
        const act = gs.lastAction;

        if (act === 'hexSelected') {
            const hx = document.querySelector(`.hex-point[data-val="${gs.activeHexVal}"]`);
            if (hx) {
                hx.classList.add('pop-up');
                setTimeout(() => hx.classList.remove('pop-up'), 300);
            }
            const qObj = questionDB.find(q => q.id === gs.activeQuestionId);
            if (qObj) renderCurrentQuestionUI(qObj, gs.shuffledIndices);
            answersGrid.style.opacity = '1';
            startSyncTimer(15);
        }
        else if (act === 'answeredCorrectly') {
            flashScreen('green');
            answersGrid.style.opacity = '0.5';
            const txt = (gs.solver === 'host') ? room.hostNickname : room.joinerNickname;
            questionText.textContent = `Tebrikler, ${txt} soruyu bildi!`;
        }
        else if (act === 'stolen') {
            flashScreen('red');
            answersGrid.style.opacity = '0.5';
            questionText.textContent = "Bilemedi! Soru Rakibe Devrediliyor...";
            
            if (gs.solver === myRole) {
                showTurnOverlay(`HATA YAPTI! Sıra Şimdi Sende`, () => {
                    const qObj = questionDB.find(q => q.id === gs.activeQuestionId);
                    if(qObj) renderCurrentQuestionUI(qObj, gs.shuffledIndices);
                    questionText.innerHTML = `<strong style="color: #03A9F4;">(DEVREDİLEN SORU)</strong><br />${qObj.question}`;
                    answersGrid.style.opacity = '1'; // Şıkların Solukluğunu Kesinlikle Kaldır!
                    startSyncTimer(15);
                });
            } else {
                showTurnOverlay(`Sıra Rakipte!`, () => {
                    questionText.textContent = "Rakibinizin bu soruyu cevaplaması bekleniyor...";
                });
            }
        }
        else if (act === 'burned') {
            flashScreen('red');
            answersGrid.style.opacity = '0.5';
            questionText.textContent = "Soru bilinemedi ve yandı.";
        }
        else if (act === 'turnReset') {
            ansBtns.forEach(btn => btn.classList.remove('correct', 'wrong'));
            answersGrid.style.opacity = '0.5';
            countdownEl.textContent = '15';
            
            if (gs.solver === myRole) questionText.textContent = `Sıra Sizde! Seçiminizi yapın.`;
            else questionText.textContent = `Rakip bekleyişi...`;
        }
        else if (act === 'endGame') {
            triggerEndGameUI(room);
        }
    }

    function renderCurrentQuestionUI(qObj, indices) {
        questionText.innerHTML = `<strong>(${qObj.points} Puanlık Soru)</strong><br />${qObj.question}`;
        
        ansBtns.forEach((btn, idx) => {
            btn.classList.remove('correct', 'wrong');
            const mapIndex = indices[idx];
            btn.textContent = ['A) ', 'B) ', 'C) ', 'D) '][idx] + qObj.options[mapIndex];
            btn.setAttribute('data-correct', mapIndex === qObj.correctIndex ? 'true' : 'false');
        });
    }

    function startSyncTimer(secs) {
        clearInterval(timerInterval);
        localTimeRem = secs;
        countdownEl.textContent = localTimeRem;
        
        timerInterval = setInterval(() => {
            localTimeRem--;
            countdownEl.textContent = localTimeRem;
            if (localTimeRem <= 0) {
                clearInterval(timerInterval);
                const roomRaw = JSON.parse(localStorage.getItem(roomKey));
                // Eğer currentTurn === myName ise, yetki bendedir mermi yakarım
                if (roomRaw.gameState.solver === myRole) {
                    dispatchAnswerEvent(false); 
                }
            }
        }, 1000);
    }

    // B. LİSTENER VE TIKLAMA (CLICK HANDLER) GÜVENLİĞİ
    window.addEventListener('storage', (e) => {
        if (e.key === roomKey) applyStateToUI();
    });

    hexPoints.forEach(hex => {
        hex.addEventListener('click', () => {
            const r = JSON.parse(localStorage.getItem(roomKey));
            
            // SECURITY CHECK: if (currentTurn !== myName) return;
            if (r.gameState.solver !== myRole) {
                console.warn("Hata: Sıra sizde değil, tıklayamazsınız.");
                return;
            }
            if (r.gameState.activeHexVal != null) return; 
            
            const pts = parseInt(hex.getAttribute('data-val'));
            if (r.boardState[`hex_${pts}`] !== 'available') return;
            
            // Eğer odada kullanılan sorular listesi yoksa defensively destekle
            const usedList = r.gameState.usedQuestions || [];
            
            let pool = questionDB.filter(q => q.category === r.category && q.points === pts && !usedList.includes(q.id));
            if (pool.length === 0) {
                // Tükenme durumu (havuzu resetle)
                pool = questionDB.filter(q => q.category === r.category && q.points === pts);
            }
            
            const chosen = pool[Math.floor(Math.random() * pool.length)];

            mutator(room => {
                if (!room.gameState.usedQuestions) room.gameState.usedQuestions = [];
                room.gameState.usedQuestions.push(chosen.id); // Merkezi Kilit Kaydı
                
                room.gameState.activeHexVal = pts;
                room.gameState.activeQuestionId = chosen.id;
                room.gameState.shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
                room.gameState.lastAction = 'hexSelected';
                return room;
            });
        });
    });

    ansBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const r = JSON.parse(localStorage.getItem(roomKey));
            
            // SECURITY CHECK: Soru çözerken yetkisiz tıklama
            if (r.gameState.solver !== myRole) return; 
            
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            dispatchAnswerEvent(isCorrect); 
        });
    });

    function dispatchAnswerEvent(isCorrect) {
        clearInterval(timerInterval);
        
        mutator(room => {
            const gs = room.gameState;
            const pts = gs.activeHexVal;

            if (isCorrect) {
                if (gs.solver === 'host') room.hostScore += pts;
                else room.joinerScore += pts;
                
                room.boardState[`hex_${pts}`] = (gs.solver === 'host') ? 'host_won' : 'joiner_won';
                gs.lastAction = 'answeredCorrectly';
                gs.hexesCompleted += 1;
            } 
            else {
                if (!gs.isStolen) {
                    gs.isStolen = true;
                    // Taraf Değiştir (Host ise Misafire)
                    gs.solver = (gs.solver === 'host') ? 'joiner' : 'host'; 
                    gs.lastAction = 'stolen';
                } else {
                    room.boardState[`hex_${pts}`] = 'dead';
                    gs.lastAction = 'burned';
                    gs.hexesCompleted += 1;
                }
            }
            return room;
        });

        setTimeout(() => checkAndResetBoard(), 2000);
    }

    function checkAndResetBoard() {
        mutator(room => {
            const gs = room.gameState;
            if (gs.lastAction === 'answeredCorrectly' || gs.lastAction === 'burned') {
                if (gs.hexesCompleted >= 10) {
                    gs.lastAction = 'endGame';
                } else {
                    gs.turn = (gs.turn === 'host') ? 'joiner' : 'host'; 
                    gs.solver = gs.turn; 
                    gs.isStolen = false;
                    gs.activeHexVal = null;
                    gs.lastAction = 'turnReset';
                }
            }
            return room;
        });
    }

    function mutator(callbackFn) {
        const raw = localStorage.getItem(roomKey);
        if(!raw) return;
        let obj = JSON.parse(raw);
        obj = callbackFn(obj);
        obj.gameState.actionTimestamp = Date.now(); 
        localStorage.setItem(roomKey, JSON.stringify(obj));
        
        applyStateToUI(); 
    }

    function flashScreen(colorType) {
        const flashDiv = document.createElement('div');
        flashDiv.className = colorType === 'green' ? 'flash-overlay-green' : 'flash-overlay-red';
        document.body.appendChild(flashDiv);
        setTimeout(() => flashDiv.remove(), 600);
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

        const endTitle = document.getElementById('endGameTitle');
        if (room.hostScore > room.joinerScore) {
            endTitle.textContent = `🏆 ${room.hostNickname} Kazandı!`;
            endTitle.style.color = "#4CAF50";
            if (myRole === 'host' && typeof confetti === 'function') confetti({ particleCount: 200, spread: 90, startVelocity: 45, origin: { y: 0.6 } });
        } else if (room.joinerScore > room.hostScore) {
            endTitle.textContent = `🏆 ${room.joinerNickname} Kazandı!`;
            endTitle.style.color = "#03A9F4";
            if (myRole === 'joiner' && typeof confetti === 'function') confetti({ particleCount: 200, spread: 90, startVelocity: 45, origin: { y: 0.6 } });
        } else {
            endTitle.textContent = "Berabere! 🤝";
            endTitle.style.color = "#FFD700";
        }

        boardBlocker.style.display = 'none';
        
        setTimeout(() => {
            endGameModal.classList.add('active'); 
        }, 300);

        const returnHomeBtn = document.getElementById('returnHomeBtn');
        if (returnHomeBtn) {
            returnHomeBtn.onclick = () => {
                sessionStorage.removeItem('petekMultiData');
                localStorage.removeItem(roomKey);
                window.location.href = 'index.html';
            };
        }
    }

    // OYUN START 
    window.onload = () => {
        applyStateToUI(); 
    };

});

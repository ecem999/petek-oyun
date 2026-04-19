document.addEventListener('DOMContentLoaded', () => {

    // 1. SORU BANKASI VERİ YAPISI
    const pointsList = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
    let questionDB = [];
    
    // Global SABİT'ten oyunun aktif havuzuna kopyala (Dinamik Genişleme)
    if (window.PETEK_SORU_BANKASI) {
        window.PETEK_SORU_BANKASI.forEach(catObj => {
            catObj.sorular.forEach((q, idx) => {
                questionDB.push({
                    id: `${catObj.kategori}_${q.puan}_${idx}`, // Benzersiz ID
                    category: catObj.kategori,
                    points: q.puan,
                    question: q.soru,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    used: false // Tekrar etmeme kilidi
                });
            });
        });
    }

    // 2. OYUN KURULUMU
    let playerNickname = 'Oyuncu';
    let activeCategory = 'kultur';
    let activeDifficulty = 'orta';
    let playerAvatarIcon = '👨';

    const gameDataRaw = localStorage.getItem('petekGameData');
    if (gameDataRaw) {
        const gameData = JSON.parse(gameDataRaw);
        if(gameData.nickname) playerNickname = gameData.nickname.slice(0, 10);
        if(gameData.avatar) {
            playerAvatarIcon = { 'erkek': '👨', 'kadin': '👩', 'cinsiyetsiz': '🧑' }[gameData.avatar] || '👨';
        }
        if(gameData.category) activeCategory = gameData.category;
        if(gameData.difficulty) activeDifficulty = gameData.difficulty;
    }
    
    document.getElementById('playerName').textContent = playerNickname;
    document.getElementById('playerAvatar').textContent = playerAvatarIcon;
    document.getElementById('endPlayerName').textContent = playerNickname;
    document.getElementById('endPlayerAvatar').textContent = playerAvatarIcon;
    
    const currentCategoryQuestions = questionDB.filter(q => q.category === activeCategory);

    // 3. OYUN DURUM DEĞİŞKENLERİ
    let turn = 'player'; // Hexagon seçme hakkı (Sıra)
    let solver = 'player'; // Şu an soruyu kim çözmeye çalışıyor
    let isStolen = false; // Ortada devredilmiş bir soru var mı?
    
    let playerScore = 0;
    let botScore = 0;
    let hexesCompleted = 0; // Total 10 hex var. 10 olunca oyun biter.
    
    let activeHex = null;
    let currentQuestionObj = null;
    let timerInterval = null;
    let timeRemaining = 15;
    
    // DOM Elemanları
    const hexPoints = document.querySelectorAll('.hex-point');
    const questionText = document.getElementById('questionText');
    const answersGrid = document.getElementById('answersGrid');
    const ansBtns = document.querySelectorAll('.ans-btn');
    const countdownEl = document.getElementById('countdown');
    const playerScoreEl = document.getElementById('playerScore');
    const botScoreEl = document.getElementById('botScore');
    
    const playerInfoBox = document.getElementById('playerInfoBox');
    const botInfoBox = document.getElementById('botInfoBox');
    
    const turnOverlay = document.getElementById('turnOverlay');
    const turnText = document.getElementById('turnText');
    const endGameModal = document.getElementById('endGameModal');

    // UI'da kim aktif? (Parlayan border)
    function updateTurnUI() {
        if (solver === 'player') {
            playerInfoBox.classList.add('active-turn');
            botInfoBox.classList.remove('active-turn');
        } else {
            botInfoBox.classList.add('active-turn');
            playerInfoBox.classList.remove('active-turn');
        }
    }
    updateTurnUI(); // Başlangıç animasyonu

    // 4. OYNANIŞ MANTIĞI

    hexPoints.forEach(hex => {
        hex.addEventListener('click', () => {
            // Petek seçimi sadece yeni tur başladıysa, kendi sıranızdaysa ve masa temizse yapılabilir.
            if (turn !== 'player') return; 
            if (hex.classList.contains('played') || hex.classList.contains('correct-hex') || hex.classList.contains('bot-correct')) return;
            
            // Eğer ortada aktif bir soru (henüz oynanmamış sonuçlanmamış) varsa, tıklamayı engelle
            if (activeHex != null) return; 

            activeHex = hex;
            activeHex.classList.add('opponent-focus'); // Aktif peteği MAVİ işaretle (İki kişilik modla ortak animasyon)
            solver = 'player';
            isStolen = false;
            updateTurnUI();

            hex.classList.add('pop-up');
            setTimeout(() => hex.classList.remove('pop-up'), 300);

            const pts = parseInt(hex.getAttribute('data-val'));
            
            // Havuzdaki kullanılmamış soruları çek
            let valQuestions = questionDB.filter(q => q.category === activeCategory && q.points === pts && !q.used);
            
            // Tükendiyse havuzu 0'la
            if (valQuestions.length === 0) {
                questionDB.filter(q => q.category === activeCategory && q.points === pts).forEach(q => q.used = false);
                valQuestions = questionDB.filter(q => q.category === activeCategory && q.points === pts);
            }
            
            currentQuestionObj = valQuestions[Math.floor(Math.random() * valQuestions.length)];
            currentQuestionObj.used = true; // Kilit vur
            displayQuestionToPlayer();
        });
    });

    function displayQuestionToPlayer() {
        questionText.innerHTML = `<strong>(${currentQuestionObj.points} Puan)</strong><br />${currentQuestionObj.question}`;
        
        // Şıkları karıştır ve UI'ı temizle (Kilitlenmeleri aç)
        const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        
        ansBtns.forEach((btn, index) => {
            btn.classList.remove('correct', 'wrong'); // Önceki durumları sıfırla
            
            const mIndex = shuffledIndices[index];
            btn.textContent = ['A) ', 'B) ', 'C) ', 'D) '][index] + currentQuestionObj.options[mIndex];
            btn.setAttribute('data-correct', mIndex === currentQuestionObj.correctIndex ? 'true' : 'false');
            
            btn.onclick = () => {
                if (solver !== 'player') return; // Sadece oyuncuyken tıkla
                
                const isCorrect = btn.getAttribute('data-correct') === 'true';
                if(isCorrect) btn.classList.add('correct');
                else btn.classList.add('wrong');
                
                handleAnswerAttempt(isCorrect);
            };
        });

        // Şıklara tıklandıktan sonra veya tur döndüğünde engeli kaldır
        answersGrid.style.opacity = '1';
        answersGrid.style.pointerEvents = 'all';
        startTimer(15);
    }

    function startTimer(seconds) {
        clearInterval(timerInterval);
        timeRemaining = seconds;
        countdownEl.textContent = timeRemaining;
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            countdownEl.textContent = timeRemaining;
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                handleAnswerAttempt(false); // Süre bitti -> cevabı yanlış say
            }
        }, 1000);
    }

    function handleAnswerAttempt(isCorrect) {
        clearInterval(timerInterval);
        answersGrid.style.opacity = '0.5';
        answersGrid.style.pointerEvents = 'none';

        if (solver === 'player') {
            if (isCorrect) {
                flashScreen('green');
                activeHex.classList.add('correct-hex');
                playerScore += parseInt(activeHex.getAttribute('data-val'));
                playerScoreEl.textContent = playerScore;
                questionText.textContent = "Tebrikler! Doğru bildiniz ve puanı kaptınız.";
                resolveHexInteraction(); 
            } else {
                flashScreen('red');
                if (!isStolen) {
                    // İlk defa soruldu ve oyuncu bilemedi -> Soru Devrediliyor!
                    questionText.textContent = "Bilemediniz! Soru Rakibe Devrediliyor...";
                    setTimeout(() => passQuestionToBot(), 1500);
                } else {
                    // Botun seçtiği devredilmiş soruyu da bilemedin -> Soru Yanıyor
                    activeHex.classList.add('played');
                    questionText.textContent = "İkiniz de bilemediniz. Soru yandı.";
                    resolveHexInteraction(); 
                }
            }
        } 
        else if (solver === 'bot') {
            const pts = parseInt(activeHex.getAttribute('data-val'));
            if (isCorrect) {
                flashScreen('red'); // Bot bildiğinde kırmızı (çünkü oyuncu için üzücü)
                activeHex.classList.add('bot-correct');
                botScore += pts;
                botScoreEl.textContent = botScore;
                questionText.textContent = `Maalesef, Robot ${pts} puanı kaptı!`;
                resolveHexInteraction(); 
            } else {
                flashScreen('green'); // Bot bilemediğinde Yeşil flaş (Fırsat!)
                if (!isStolen) {
                    // Bot bilemedi -> Soru OYUNCUYA devrediliyor! (TAM İstenen Bug Fix)
                    questionText.textContent = "Robot bilemedi! Şimdi sıra sizde, bu soruyu bilerek puanı kapabilirsiniz!";
                    setTimeout(() => passQuestionToPlayer(), 1500); 
                } else {
                    // Oyuncunun başlatıp bilemediği soruyu robot da bilemedi
                    activeHex.classList.add('played');
                    questionText.textContent = "Kimse bilemedi. Soru yandı!";
                    resolveHexInteraction(); 
                }
            }
        }
    }

    function passQuestionToBot() {
        solver = 'bot';
        isStolen = true;
        updateTurnUI();
        showTurnOverlay("DİKKAT! Soru Robotta", () => {
            ansBtns.forEach(btn => btn.classList.remove('correct', 'wrong')); // Olaylar sıfırlansın
            
            questionText.innerHTML = `🤖 <strong>Robot rakibin sorusunu çözmeye çalışıyor...</strong>`;
            
            let botTime = 4; // 4 saniye taklit animasyonu
            countdownEl.textContent = botTime;
            timerInterval = setInterval(() => {
                botTime--;
                countdownEl.textContent = botTime;
                if (botTime <= 0) {
                    clearInterval(timerInterval);
                    handleAnswerAttempt(botFormulaSuccess());
                }
            }, 1000);
        });
    }

    function passQuestionToPlayer() {
        solver = 'player';
        isStolen = true;
        updateTurnUI(); // Parlama efekti oyuncuya geçer

        showTurnOverlay("FIRSAT! Sıra Sende", () => {
            displayQuestionToPlayer(); // Şıkları etkinleştir, pointer olayını çöz ve 15 Sn süreyi başlat
            questionText.innerHTML = `<strong>(DEVREDİLEN SORU)</strong><br />${currentQuestionObj.question}`;
        });
    }

    function botFormulaSuccess() {
        let successProbability = 0.6; 
        if (activeDifficulty === 'kolay') successProbability = 0.3; 
        else if (activeDifficulty === 'zor') successProbability = 0.9;
        return Math.random() < successProbability;
    }

    // Bir petek kazanıldığında veya yandığında (tamamen sonuçlandığında) çağrılır
    function resolveHexInteraction() {
        if (activeHex) activeHex.classList.remove('opponent-focus'); // Kapanan sorunun mavi aktif ışığını söndür
        hexesCompleted++;
        
        setTimeout(() => {
            if (hexesCompleted >= 10) {
                endGame();
                return;
            }
            
            // Sıra Değişimi algoritması. Sonuç ne olursa olsun sıra karşılıklı dönmeli.
            turn = (turn === 'player') ? 'bot' : 'player'; 
            
            activeHex = null; // Aktif peteği null yaparak paneli kilitlerinden arındır
            currentQuestionObj = null;
            countdownEl.textContent = '15'; // Default ekran texti
            ansBtns.forEach(btn => btn.classList.remove('correct', 'wrong')); // Silahlar temizlenir
            
            if (turn === 'player') {
                solver = 'player';
                updateTurnUI();
                questionText.textContent = "Sıra Sende! Hemen yeni bir boş petek seç.";
            } else {
                initiateBotNewTurn();
            }
        }, 2000);
    }

    // Robot sıfırdan kendi eli için petek seçer
    function initiateBotNewTurn() {
        turn = 'bot';
        solver = 'bot';
        isStolen = false;
        updateTurnUI();

        const availableHexes = Array.from(document.querySelectorAll('.hex-point:not(.played):not(.correct-hex):not(.bot-correct)'));
        if (availableHexes.length === 0) {
            endGame();
            return;
        }

        const randomHexObj = availableHexes[Math.floor(Math.random() * availableHexes.length)];
        activeHex = randomHexObj;
        activeHex.classList.add('opponent-focus'); // Aktif peteği MAVİ işaretle (İki kişilik modla ortak animasyon)
        
        const ptVal = parseInt(randomHexObj.getAttribute('data-val'));
        activeHex.classList.add('pop-up');
        setTimeout(() => activeHex.classList.remove('pop-up'), 300); // 300ms tık animasyonunu bot için de yap!
        
        // Soru datası robot seçimi üzerinden load edilir (Oyuncuya düşme ihtimali için saklanır)
        let valQuestions = questionDB.filter(q => q.category === activeCategory && q.points === ptVal && !q.used);
        if (valQuestions.length === 0) {
            questionDB.filter(q => q.category === activeCategory && q.points === ptVal).forEach(q => q.used = false);
            valQuestions = questionDB.filter(q => q.category === activeCategory && q.points === ptVal);
        }
        
        currentQuestionObj = valQuestions[Math.floor(Math.random() * valQuestions.length)];
        currentQuestionObj.used = true; // Kilit vur
        answersGrid.style.opacity = '0.5';
        answersGrid.style.pointerEvents = 'none';
        questionText.innerHTML = `🤖 <strong>Robot Yeni Soru Seçti: ${ptVal} Puan! Düşünüyor...</strong>`;
        
        let botTime = 4;
        countdownEl.textContent = botTime;
        timerInterval = setInterval(() => {
            botTime--;
            countdownEl.textContent = botTime;
            if (botTime <= 0) {
                clearInterval(timerInterval);
                handleAnswerAttempt(botFormulaSuccess());
            }
        }, 1000);
    }

    // Tüm ekranı kaplayan flaş animasyonu
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

    // Oyun Sonu Modalı
    function endGame() {
        document.getElementById('endPlayerScoreVal').textContent = playerScore;
        document.getElementById('endBotScoreVal').textContent = botScore;
        
        const endTitle = document.getElementById('endGameTitle');
        if (playerScore > botScore) {
            endTitle.textContent = "Tebrikler, Kazandın! 🏆";
            endTitle.style.color = "#4CAF50";
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else if (botScore > playerScore) {
            endTitle.textContent = "Maalesef Kaybettin... 🤖";
            endTitle.style.color = "#FF4D6D";
        } else {
            endTitle.textContent = "Berabere! 🤝";
            endTitle.style.color = "#FFD700";
        }

        endGameModal.classList.add('active'); 
    }
});

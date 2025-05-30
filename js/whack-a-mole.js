// Game variables
let score = 0;
let timeLeft = 0;
let gameInterval;
let moleInterval;
let currentLevel = 1;
let isPaused = false;
let isGameRunning = false;
let highScore = 0;
let levelHighScores = [0, 0, 0, 0];
// let leaderboard = [];

// Game level settings
const levels = [
    { 
       
        targetScore: 10,
        timeLimit: 45,
        moleSpeed: 900,
        moleVisibleTime: 700,
        goldenMoleChance: 0.07,
        goldenMolePoints: 5,
        bombMoleChance: 0.05
    },
    { 
        // targetScore: 50,
        targetScore: 20,
        timeLimit: 40,
        moleSpeed: 750,
        moleVisibleTime: 650,
        goldenMoleChance: 0.1,
        goldenMolePoints: 5,
        bombMoleChance: 0.07
    },
    { 
      
        targetScore: 30,
        timeLimit: 35,
        moleSpeed: 600,
        moleVisibleTime: 600,
        goldenMoleChance: 0.12,
        goldenMolePoints: 5,
        bombMoleChance: 0.1
    },
    { 
    
        targetScore: 40,
        timeLimit: 30,
        moleSpeed: 450,
        moleVisibleTime: 550,
        goldenMoleChance: 0.15,
        goldenMolePoints: 5,
        bombMoleChance: 0.12
    }
];

// DOM elements
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const targetDisplay = document.getElementById('target');
const levelDisplay = document.getElementById('level-display');
const highScoreDisplay = document.getElementById('high-score');
const progressBar = document.getElementById('progress-bar');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const levelButtons = document.querySelectorAll('.level-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreMessage = document.getElementById('high-score-message');
const playAgainBtn = document.getElementById('play-again-btn');
const levelCompleteModal = document.getElementById('level-complete-modal');
const nextLevelBtn = document.getElementById('next-level-btn');
const nextLevelDisplay = document.getElementById('next-level');
const continueBtn = document.getElementById('continue-btn');
const championModal = document.getElementById('champion-modal');
const championPlayAgainBtn = document.getElementById('champion-play-again-btn');
const championScoreDisplay = document.getElementById('champion-score');
const championHighScoreMessage = document.getElementById('champion-high-score');


// Audio elements
const whackSound = document.getElementById('whack-sound');
const successSound = document.getElementById('success-sound');
const failSound = document.getElementById('fail-sound');
const goldenSound = document.getElementById('golden-sound');
const levelUpSound = document.getElementById('level-up-sound');
const bombSound = document.getElementById('bomb-sound');

// Initialize game board with the holes
function initializeGameBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.index = i;
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.dataset.index = i;
        mole.textContent = '🐭';
        
        hole.appendChild(mole);
        hole.addEventListener('click', () => whackMole(i));
        gameBoard.appendChild(hole);
    }
}

// Load the saved data from localStorage
function loadSavedData() {
    const savedHighScore = localStorage.getItem('whackAMoleHighScore');
    const savedLevelHighScores = localStorage.getItem('whackAMoleLevelHighScores');
    
    
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = highScore;
    }
    
    if (savedLevelHighScores) {
        levelHighScores = JSON.parse(savedLevelHighScores);
    }
    
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('whackAMoleHighScore', highScore.toString());
    localStorage.setItem('whackAMoleLevelHighScores', JSON.stringify(levelHighScores));
   
}


// Start the game
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    isPaused = false;
    score = 0;
    timeLeft = levels[currentLevel - 1].timeLimit;
    
    updateDisplay();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
    
    // Game timer
    gameInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            timeDisplay.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 0) {
                endGame(false);
            }
        }
    }, 1000);
    
    // Mole popping interval
    moleInterval = setInterval(() => {
        if (!isPaused && isGameRunning) popRandomMole();
    }, levels[currentLevel - 1].moleSpeed);
}

// Pause and resume game
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// Restart game completely
function restartGame() {
    clearInterval(gameInterval);
    clearInterval(moleInterval);

    isGameRunning = false;
    isPaused = false;
    currentLevel = 1;
    score = 0;
    timeLeft = levels[currentLevel - 1].timeLimit;
    updateLevelDisplay();
    unlockLevels();
    updateDisplay();

    document.querySelectorAll('.mole').forEach(mole => {
        mole.classList.remove('up');
    });

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
}

// Reset current level after Game Over without starting over
function resetCurrentLevel() {
    clearInterval(gameInterval);
    clearInterval(moleInterval);

    isGameRunning = false;
    isPaused = false;
    score = 0;
    timeLeft = levels[currentLevel - 1].timeLimit;
    updateDisplay();

    document.querySelectorAll('.mole').forEach(mole => {
        mole.classList.remove('up');
    });

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
}

// End the game
function endGame(success) {
    clearInterval(gameInterval);
    clearInterval(moleInterval);
    isGameRunning = false;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    document.querySelectorAll('.mole.up').forEach(mole => mole.classList.remove('up'));
    
    // Update high scores
    if (score > levelHighScores[currentLevel - 1]) {
        levelHighScores[currentLevel - 1] = score;
    }
    
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
    }
    
    saveData();
    
    if (success) {
        if (currentLevel === levels.length) {
            showChampionModal();
        } else {
            showLevelCompleteModal();
        }
    } else {
        showGameOverModal();
    }
}

// Show game over modal
function showGameOverModal() {
    finalScoreDisplay.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        highScoreMessage.innerHTML = '<span class="new-high-score">New High Score! 🏆</span>';
        saveData();
       
    } else {
        highScoreMessage.innerHTML = `High Score: ${highScore}<br>Level ${currentLevel} Best: ${levelHighScores[currentLevel - 1]}`;
    }

    
    failSound.currentTime = 0;
    failSound.play();
    gameOverModal.classList.remove('hidden');
    gameOverModal.classList.add('flex');
}

// Show level complete modal
function showLevelCompleteModal() {
    levelUpSound.currentTime = 0;
    levelUpSound.play();
    nextLevelDisplay.textContent = currentLevel + 1;
    levelCompleteModal.classList.remove('hidden');
    levelCompleteModal.classList.add('flex');
}

// Show champion modal
function showChampionModal() {
    successSound.currentTime = 0;
    successSound.play();
    championScoreDisplay.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        championHighScoreMessage.innerHTML = '<span class="new-high-score">New High Score! �</span>';
        saveData();
       
    } else {
        championHighScoreMessage.innerHTML = `High Score: ${highScore}`;
    }
    
    championModal.classList.remove('hidden');
    championModal.classList.add('flex');
}

// Move to next level
function nextLevel() {
    currentLevel++;
    updateLevelDisplay();
    unlockLevels();
    levelCompleteModal.classList.remove('flex');
    levelCompleteModal.classList.add('hidden');
    startGame();
}

// Continue playing current level
function continuePlaying() {
    levelCompleteModal.classList.remove('flex');
    levelCompleteModal.classList.add('hidden');
    startGame();
}

// Update all display elements
function updateDisplay() {
    scoreDisplay.textContent = score;
    timeDisplay.textContent = `${timeLeft}s`;
    targetDisplay.textContent = levels[currentLevel - 1].targetScore;
    
    const progress = (score / levels[currentLevel - 1].targetScore) * 100;
    progressBar.style.width = `${Math.min(100, progress)}%`;
}

// Update level display
function updateLevelDisplay() {
    levelDisplay.textContent = currentLevel;
    
    levelButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.level) === currentLevel) {
            btn.classList.add('active');
        }
    });
}

// Unlock levels based on current progress
function unlockLevels() {
    levelButtons.forEach(btn => {
        const btnLevel = parseInt(btn.dataset.level);
        if (btnLevel <= currentLevel) {
            btn.disabled = false;
            btn.classList.remove('locked');
        } else {
            btn.disabled = true;
            btn.classList.add('locked');
        }
    });
}

// Change level (only when game isn't running)
function changeLevel(level) {
    if (isGameRunning) return;
    
    currentLevel = level;
    updateLevelDisplay();
    targetDisplay.textContent = levels[currentLevel - 1].targetScore;
}

// Pop up a random mole
function popRandomMole() {
    const holes = document.querySelectorAll('.hole');
    const randomIndex = Math.floor(Math.random() * holes.length);
    const mole = holes[randomIndex].querySelector('.mole');
    
    if (mole.classList.contains('up')) return;
    
    const rand = Math.random();
    mole.classList.remove('golden', 'bomb');
    
    // Determine mole type
    if (rand < levels[currentLevel - 1].bombMoleChance) {
        mole.classList.add('bomb');
        mole.textContent = '💣';
    } else if (rand < levels[currentLevel - 1].bombMoleChance + levels[currentLevel - 1].goldenMoleChance) {
        mole.classList.add('golden');
        mole.textContent = '💰';
    } else {
        mole.textContent = '🐭';
    }
    
    mole.classList.add('up');
    
    setTimeout(() => {
        if (mole.classList.contains('up')) mole.classList.remove('up');
    }, levels[currentLevel - 1].moleVisibleTime);
}

// Whack a mole
function whackMole(index) {
    if (!isGameRunning || isPaused) return;
    
    const mole = document.querySelector(`.mole[data-index="${index}"]`);
    
    if (mole.classList.contains('up')) {
        if (mole.classList.contains('bomb')) {
            bombSound.currentTime = 0;
            bombSound.play();
            endGame(false);
            return;
        }
        
        const points = mole.classList.contains('golden') ? 
            levels[currentLevel - 1].goldenMolePoints : 1;
        
        score += points;
        updateDisplay();
        mole.classList.remove('up');
        
        if (mole.classList.contains('golden')) {
            goldenSound.currentTime = 0;
            goldenSound.play();
        } else {
            whackSound.currentTime = 0;
            whackSound.play();
        }
        
        if (score >= levels[currentLevel - 1].targetScore) {
            endGame(true);
        }
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) return;
    
    const key = e.key;
    if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        whackMole(index);
        
        const hole = document.querySelector(`.hole[data-index="${index}"]`);
        hole.style.transform = 'scale(0.95)';
        setTimeout(() => {
            hole.style.transform = 'scale(1)';
        }, 100);
    }
});

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initializeGameBoard();
    loadSavedData();
    updateLevelDisplay();
    unlockLevels();
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
        gameOverModal.classList.remove('flex');
        gameOverModal.classList.add('hidden');
        resetCurrentLevel();
    });
    nextLevelBtn.addEventListener('click', nextLevel);
    continueBtn.addEventListener('click', continuePlaying);
    championPlayAgainBtn.addEventListener('click', () => {
        championModal.classList.remove('flex');
        championModal.classList.add('hidden');
        restartGame();
    });
    
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            changeLevel(parseInt(btn.dataset.level));
        });
    });
});
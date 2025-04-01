// DOM-Elemente
const homeScreen = document.getElementById('homeScreen');
const singlePlayerSetup = document.getElementById('singlePlayerSetup');
const multiPlayerSetup = document.getElementById('multiPlayerSetup');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const rankingScreen = document.getElementById('rankingScreen');

// Navigation Buttons
const homeButton = document.getElementById('homeButton');
const singlePlayerButton = document.getElementById('singlePlayerButton');
const multiPlayerButton = document.getElementById('multiPlayerButton');
const rankingButton = document.getElementById('rankingButton');

// Spiel-Elemente
const wikiFrame = document.getElementById('wikiFrame');
const startArticle = document.getElementById('startArticle');
const targetArticle = document.getElementById('targetArticle');
const timerElement = document.getElementById('timer');
const clickCountElement = document.getElementById('clickCount');

// Ergebnis-Elemente
const finalTime = document.getElementById('finalTime');
const finalClicks = document.getElementById('finalClicks');
const finalScore = document.getElementById('finalScore');

// Spiel-Zustand
let gameState = {
    isActive: false,
    isSinglePlayer: true,
    startTime: null,
    currentTime: 0,
    clickCount: 0,
    startArticleTitle: '',
    targetArticleTitle: '',
    currentArticleTitle: '',
    playerName: '',
    timerInterval: null
};

// Wikipedia-API-URL
const WIKI_API_BASE_URL = 'https://de.wikipedia.org/api/rest_v1/page/html/';
const WIKI_RANDOM_URL = 'https://de.wikipedia.org/api/rest_v1/page/random/summary';

// Event-Handler registrieren
function initEventHandlers() {
    // Navigation
    homeButton.addEventListener('click', showHomeScreen);
    singlePlayerButton.addEventListener('click', showSinglePlayerSetup);
    multiPlayerButton.addEventListener('click', showMultiPlayerSetup);
    rankingButton.addEventListener('click', showRankingScreen);
    
    // Home-Screen Buttons
    document.getElementById('startSinglePlayer').addEventListener('click', showSinglePlayerSetup);
    document.getElementById('startMultiPlayer').addEventListener('click', showMultiPlayerSetup);
    
    // Single-Player Setup
    document.getElementById('startSinglePlayerGame').addEventListener('click', startSinglePlayerGame);
    
    // Game Controls
    document.getElementById('giveUp').addEventListener('click', endGame);
    document.getElementById('restartGame').addEventListener('click', restartGame);
    
    // Game Over Screen
    document.getElementById('playAgain').addEventListener('click', handlePlayAgain);
    document.getElementById('returnHome').addEventListener('click', showHomeScreen);
    
    // Ranking Screen
    document.getElementById('globalRankingTab').addEventListener('click', showGlobalRanking);
    document.getElementById('personalStatsTab').addEventListener('click', showPersonalStats);
    document.getElementById('backFromRanking').addEventListener('click', showHomeScreen);
}

// Bildschirm-Wechsel Funktionen
function showScreen(screenId) {
    // Alle Screens ausblenden
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Ausgewählten Screen anzeigen
    document.getElementById(screenId).classList.add('active');
}

function showHomeScreen() {
    if (gameState.isActive) {
        if (confirm('Möchtest du das aktuelle Spiel wirklich beenden?')) {
            endGame();
            showScreen('homeScreen');
        }
    } else {
        showScreen('homeScreen');
    }
}

function showSinglePlayerSetup() {
    showScreen('singlePlayerSetup');
}

function showMultiPlayerSetup() {
    showScreen('multiPlayerSetup');
}

function showRankingScreen() {
    loadRankingData();
    showScreen('rankingScreen');
}

function showGlobalRanking() {
    document.getElementById('globalRankingTab').classList.add('active');
    document.getElementById('personalStatsTab').classList.remove('active');
    document.getElementById('globalRanking').classList.add('active');
    document.getElementById('personalStats').classList.remove('active');
}

function showPersonalStats() {
    document.getElementById('globalRankingTab').classList.remove('active');
    document.getElementById('personalStatsTab').classList.add('active');
    document.getElementById('globalRanking').classList.remove('active');
    document.getElementById('personalStats').classList.add('active');
    
    loadPersonalStats();
}

// Spiel-Funktionen
async function startSinglePlayerGame() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Bitte gib deinen Namen ein.');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.isSinglePlayer = true;
    gameState.isActive = true;
    
    showScreen('gameScreen');
    document.getElementById('multiplayerInfo').classList.add('hidden');
    
    // Lade zufällige Start- und Zielartikel
    await setupNewGame();
}

async function setupNewGame() {
    // Reset game state
    gameState.clickCount = 0;
    gameState.currentTime = 0;
    updateTimer(0);
    updateClickCount(0);
    
    // Zeige Ladeanimation
    document.querySelector('.wiki-frame .loader').style.display = 'block';
    wikiFrame.style.display = 'none';
    
    try {
        // Hole zufälligen Startartikel
        const startArticleData = await fetchRandomWikiArticle();
        gameState.startArticleTitle = startArticleData.title;
        gameState.currentArticleTitle = startArticleData.title;
        
        // Hole zufälligen Zielartikel (unterschiedlich vom Start)
        let targetArticleData;
        do {
            targetArticleData = await fetchRandomWikiArticle();
        } while (targetArticleData.title === gameState.startArticleTitle);
        
        gameState.targetArticleTitle = targetArticleData.title;
        
        // Zeige die Artikel-Titel an
        startArticle.textContent = gameState.startArticleTitle;
        targetArticle.textContent = gameState.targetArticleTitle;
        
        // Lade den Startartikel
        await loadArticle(gameState.startArticleTitle);
        
        // Starte den Timer
        startTimer();
        
        // Verstecke Ladeanimation
        document.querySelector('.wiki-frame .loader').style.display = 'none';
        wikiFrame.style.display = 'block';
    } catch (error) {
        console.error('Fehler beim Einrichten des Spiels:', error);
        alert('Es gab ein Problem beim Starten des Spiels. Bitte versuche es erneut.');
    }
}

async function fetchRandomWikiArticle() {
    const response = await fetch(WIKI_RANDOM_URL);
    const data = await response.json();
    return data;
}

async function loadArticle(title) {
    try {
        // Zeige Ladeanimation
        document.querySelector('.wiki-frame .loader').style.display = 'block';
        
        const encodedTitle = encodeURIComponent(title);
        const apiUrl = WIKI_API_BASE_URL + encodedTitle;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Artikel konnte nicht geladen werden');
        }
        
        const htmlContent = await response.text();
        
        // Aktualisiere den aktuellen Artikel-Titel
        gameState.currentArticleTitle = title;
        
        // Lade den Inhalt in das iframe
        const doc = wikiFrame.contentDocument || wikiFrame.contentWindow.document;
        doc.open();
        
        // Füge angepasstes CSS und JavaScript für Link-Handling hinzu
        doc.write(`
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Roboto', Arial, sans-serif;
                        line-height: 1.6;
                        padding: 20px;
                        margin: 0;
                    }
                    a {
                        color: #1a73e8;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    table {
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                    .infobox {
                        float: right;
                        margin: 0 0 20px 20px;
                        max-width: 270px;
                        border: 1px solid #ddd;
                        padding: 10px;
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    document.addEventListener('click', function(e) {
                        if (e.target.tagName === 'A') {
                            e.preventDefault();
                            const href = e.target.getAttribute('href');
                            // Extrahiere den Titel aus dem href-Attribut
                            if (href && href.startsWith('/wiki/')) {
                                const title = href.substring(6);
                                // Sende Nachricht an das Eltern-Fenster
                                window.parent.postMessage({
                                    type: 'linkClicked',
                                    title: decodeURIComponent(title)
                                }, '*');
                            }
                        }
                    });
                </script>
            </body>
            </html>
        `);
        
        doc.close();
        
        // Verstecke Ladeanimation
        document.querySelector('.wiki-frame .loader').style.display = 'none';
        wikiFrame.style.display = 'block';
        
        // Prüfe, ob das Ziel erreicht wurde
        checkGoalReached(title);
    } catch (error) {
        console.error('Fehler beim Laden des Artikels:', error);
        alert('Der Artikel konnte nicht geladen werden. Bitte versuche es erneut.');
    }
}

function handleLinkClick(event) {
    if (event.data && event.data.type === 'linkClicked') {
        const title = event.data.title;
        
        // Inkrementiere Klick-Zähler
        updateClickCount(gameState.clickCount + 1);
        
        // Lade den neuen Artikel
        loadArticle(title);
    }
}

function checkGoalReached(currentTitle) {
    if (currentTitle === gameState.targetArticleTitle) {
        // Spieler hat das Ziel erreicht
        endGame(true);
    }
}

function updateClickCount(count) {
    gameState.clickCount = count;
    clickCountElement.textContent = count;
}

function startTimer() {
    gameState.startTime = Date.now();
    
    // Stoppe vorherigen Timer falls vorhanden
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Starte neuen Timer
    gameState.timerInterval = setInterval(() => {
        const currentTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        gameState.currentTime = currentTime;
        updateTimer(currentTime);
    }, 1000);
}

function updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    timerElement.textContent = formattedTime;
    
    return formattedTime;
}

function calculateScore(timeInSeconds, clickCount) {
    // Basis-Punktzahl: 1000
    let score = 1000;
    
    // Jede Sekunde zieht einen Punkt ab (max. 800 Punkte Abzug)
    const timeDeduction = Math.min(800, timeInSeconds);
    
    // Jeder Klick zieht 10 Punkte ab (min. 100 Punkte übrig)
    const clickDeduction = Math.min(100, clickCount * 10);
    
    score = Math.max(100, score - timeDeduction - clickDeduction);
    
    return score;
}

function endGame(goalReached = false) {
    // Stoppe Timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    gameState.isActive = false;
    
    if (goalReached) {
        // Berechne Punktzahl
        const score = calculateScore(gameState.currentTime, gameState.clickCount);
        
        // Zeige Ergebnisse an
        const formattedTime = updateTimer(gameState.currentTime);
        finalTime.textContent = formattedTime;
        finalClicks.textContent = gameState.clickCount;
        finalScore.textContent = score;
        
        // Speichere Ergebnis für Rangliste/Statistik (für Einzelspieler)
        if (gameState.isSinglePlayer) {
            saveGameResult({
                playerName: gameState.playerName,
                time: gameState.currentTime,
                clicks: gameState.clickCount,
                score: score,
                startArticle: gameState.startArticleTitle,
                targetArticle: gameState.targetArticleTitle,
                date: new Date().toISOString()
            });
        }
        
        // Zeige Game Over Screen
        document.getElementById('gameOverTitle').textContent = 'Ziel erreicht!';
        showScreen('gameOverScreen');
    } else {
        // Spieler hat aufgegeben
        showScreen('homeScreen');
    }
}

function restartGame() {
    if (gameState.isSinglePlayer) {
        startSinglePlayerGame();
    } else {
        // Bei Multiplayer wird die entsprechende Funktion aus multiplayer.js aufgerufen
        if (typeof startMultiPlayerGame === 'function') {
            startMultiPlayerGame();
        }
    }
}

function handlePlayAgain() {
    if (gameState.isSinglePlayer) {
        showSinglePlayerSetup();
    } else {
        showMultiPlayerSetup();
    }
}

// Lokale Speicherung von Spielergebnissen
function saveGameResult(result) {
    let gameResults = JSON.parse(localStorage.getItem('wikiRaceResults') || '[]');
    gameResults.push(result);
    localStorage.setItem('wikiRaceResults', JSON.stringify(gameResults));
}

// Ranglisten-Funktionen
function loadRankingData() {
    const rankingTableBody = document.getElementById('rankingTableBody');
    rankingTableBody.innerHTML = '';
    
    // Lade gespeicherte Ergebnisse
    let gameResults = JSON.parse(localStorage.getItem('wikiRaceResults') || '[]');
    
    // Gruppiere Ergebnisse nach Spieler
    const playerStats = {};
    
    gameResults.forEach(result => {
        if (!playerStats[result.playerName]) {
            playerStats[result.playerName] = {
                name: result.playerName,
                games: 0,
                bestScore: 0,
                bestTime: Infinity,
                totalScore: 0
            };
        }
        
        const player = playerStats[result.playerName];
        player.games++;
        player.bestScore = Math.max(player.bestScore, result.score);
        player.bestTime = Math.min(player.bestTime, result.time);
        player.totalScore += result.score;
    });
    
    // Konvertiere zu Array und sortiere nach durchschnittlicher Punktzahl
    const rankedPlayers = Object.values(playerStats)
        .map(player => ({
            ...player,
            avgScore: player.totalScore / player.games
        }))
        .sort((a, b) => b.avgScore - a.avgScore);
    
    // Erstelle Tabellen-Zeilen
    rankedPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${Math.round(player.avgScore)}</td>
            <td>${player.bestScore}</td>
            <td>${updateTimer(player.bestTime)}</td>
        `;
        rankingTableBody.appendChild(row);
    });
}

function loadPersonalStats() {
    const playerName = gameState.playerName || localStorage.getItem('lastPlayerName');
    
    if (!playerName) {
        document.getElementById('personalStats').innerHTML = '<p>Bitte spiele zuerst ein Spiel, um persönliche Statistiken zu sehen.</p>';
        return;
    }
    
    // Setze Namen in der UI
    document.getElementById('personalStatsName').textContent = playerName;
    
    // Lade gespeicherte Ergebnisse
    let gameResults = JSON.parse(localStorage.getItem('wikiRaceResults') || '[]');
    
    // Filtere Ergebnisse für den aktuellen Spieler
    const playerResults = gameResults.filter(result => result.playerName === playerName);
    
    if (playerResults.length === 0) {
        document.getElementById('personalStats').innerHTML = '<p>Keine Spiele gefunden für diesen Spieler.</p>';
        return;
    }
    
    // Berechne Statistiken
    const totalGames = playerResults.length;
    const bestScore = Math.max(...playerResults.map(result => result.score));
    const bestTime = Math.min(...playerResults.map(result => result.time));
    const bestClicks = Math.min(...playerResults.map(result => result.clicks));
    const avgScore = playerResults.reduce((sum, result) => sum + result.score, 0) / totalGames;
    
    // Aktualisiere UI
    document.getElementById('personalElo').textContent = Math.round(avgScore);
    document.getElementById('personalWins').textContent = totalGames;
    document.getElementById('personalBestTime').textContent = updateTimer(bestTime);
    document.getElementById('personalBestClicks').textContent = bestClicks;
    
    // Zeige die letzten 5 Spiele
    const recentGamesContainer = document.getElementById('recentGames');
    recentGamesContainer.innerHTML = '';
    
    const recentGames = [...playerResults]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentGames.forEach(game => {
        const gameDate = new Date(game.date);
        const formattedDate = `${gameDate.toLocaleDateString()} ${gameDate.toLocaleTimeString()}`;
        
        const gameItem = document.createElement('div');
        gameItem.className = 'recent-game-item';
        gameItem.innerHTML = `
            <div class="recent-game-info">
                <div>Von: ${game.startArticle}</div>
                <div>Nach: ${game.targetArticle}</div>
                <div>Datum: ${formattedDate}</div>
            </div>
            <div class="recent-game-stats">
                <div>Zeit: ${updateTimer(game.time)}</div>
                <div>Klicks: ${game.clicks}</div>
                <div>Punkte: ${game.score}</div>
            </div>
        `;
        
        recentGamesContainer.appendChild(gameItem);
    });
}

// Event-Listener für Nachrichten aus dem iframe
window.addEventListener('message', handleLinkClick);

// Initialisiere die App
function initApp() {
    initEventHandlers();
    showScreen('homeScreen');
}

// Starte die App, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', initApp);
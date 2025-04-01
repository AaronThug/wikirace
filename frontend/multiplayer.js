// Multiplayer-Funktionalitäten für WikiRace

// Socket.IO Client
let socket;
const SERVER_URL = 'http://localhost:3000'; // Anpassen an die tatsächliche Server-URL

// Multiplayer Spiel-Status
let multiplayerGameState = {
    gameId: null,
    player1: {
        id: null,
        name: '',
        clicks: 0,
        currentArticle: '',
        finished: false,
        finishTime: null
    },
    player2: {
        id: null,
        name: '',
        clicks: 0,
        currentArticle: '',
        finished: false,
        finishTime: null
    },
    isPlayer1: false, // Ist der aktuelle Client Spieler 1?
    startArticle: '',
    targetArticle: '',
    gameStarted: false,
    gameFinished: false
};

// DOM-Elemente für Multiplayer
const findOpponentButton = document.getElementById('findOpponent');
const waitingRoom = document.getElementById('waitingRoom');
const cancelSearchButton = document.getElementById('cancelSearch');
const multiplayerInfoElement = document.getElementById('multiplayerInfo');
const player1NameElement = document.getElementById('player1Name');
const player2NameElement = document.getElementById('player2Name');
const player1ClicksElement = document.getElementById('player1Clicks');
const player2ClicksElement = document.getElementById('player2Clicks');

// Multiplayer Game Over Elemente
const gameOverMultiPlayer = document.getElementById('gameOverMultiPlayer');
const winnerAnnouncement = document.getElementById('winnerAnnouncement');
const player1ResultElement = document.getElementById('player1Result');
const player2ResultElement = document.getElementById('player2Result');
const player1TimeElement = document.getElementById('player1Time');
const player2TimeElement = document.getElementById('player2Time');
const player1FinalClicksElement = document.getElementById('player1FinalClicks');
const player2FinalClicksElement = document.getElementById('player2FinalClicks');
const player1EloElement = document.getElementById('player1Elo');
const player2EloElement = document.getElementById('player2Elo');
const player1EloDiffElement = document.getElementById('player1EloDiff');
const player2EloDiffElement = document.getElementById('player2EloDiff');

// Initialisierung der Socket-Verbindung
function initSocketConnection() {
    if (socket) {
        // Socket bereits verbunden, nichts tun
        return;
    }

    // Socket.io Verbindung herstellen
    socket = io(SERVER_URL);

    // Event-Handler registrieren
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('error', handleSocketError);
    socket.on('gameFound', handleGameFound);
    socket.on('opponentDisconnected', handleOpponentDisconnected);
    socket.on('gameStart', handleGameStart);
    socket.on('playerUpdate', handlePlayerUpdate);
    socket.on('gameOver', handleGameOver);
}

// Event-Handler für Multiplayer registrieren
function initMultiplayerEventHandlers() {
    findOpponentButton.addEventListener('click', startFindingOpponent);
    cancelSearchButton.addEventListener('click', cancelFindingOpponent);
    document.getElementById('startMultiPlayer').addEventListener('click', showMultiPlayerSetup);
}

// Socket Event-Handler
function handleSocketConnect() {
    console.log('Verbindung zum Server hergestellt');
}

function handleSocketDisconnect() {
    console.log('Verbindung zum Server getrennt');
    
    // Falls während eines Spiels getrennt, zurück zum Hauptmenü
    if (gameState.isActive && !gameState.isSinglePlayer) {
        alert('Verbindung zum Server verloren. Das Spiel wurde beendet.');
        gameState.isActive = false;
        showHomeScreen();
    }
}

function handleSocketError(error) {
    console.error('Socket-Fehler:', error);
    alert('Es ist ein Fehler bei der Verbindung aufgetreten. Bitte versuche es erneut.');
}

function handleGameFound(data) {
    console.log('Spiel gefunden:', data);
    
    multiplayerGameState.gameId = data.gameId;
    multiplayerGameState.isPlayer1 = data.isPlayer1;
    
    // Initialisiere Spieler-Informationen
    if (data.isPlayer1) {
        multiplayerGameState.player1.id = socket.id;
        multiplayerGameState.player1.name = gameState.playerName;
        multiplayerGameState.player2.id = data.opponentId;
        multiplayerGameState.player2.name = data.opponentName;
    } else {
        multiplayerGameState.player1.id = data.opponentId;
        multiplayerGameState.player1.name = data.opponentName;
        multiplayerGameState.player2.id = socket.id;
        multiplayerGameState.player2.name = gameState.playerName;
    }
    
    // Aktualisiere UI
    player1NameElement.textContent = multiplayerGameState.player1.name;
    player2NameElement.textContent = multiplayerGameState.player2.name;
    
    // Verstecke Warteraum
    waitingRoom.classList.add('hidden');
    
    // Warte auf Spielstart (der Server sendet gameStart)
}

function handleOpponentDisconnected() {
    // Gegner hat die Verbindung getrennt
    if (gameState.isActive && !gameState.isSinglePlayer) {
        alert('Dein Gegner hat die Verbindung getrennt. Du kehrst zum Hauptmenü zurück.');
        gameState.isActive = false;
        showHomeScreen();
    } else if (waitingRoom.classList.contains('hidden') === false) {
        // Wir sind noch im Warteraum
        alert('Dein Gegner hat die Verbindung getrennt. Die Suche wurde abgebrochen.');
        cancelFindingOpponent();
    }
}

function handleGameStart(data) {
    console.log('Spiel startet:', data);
    
    // Speichere Spiel-Informationen
    multiplayerGameState.startArticle = data.startArticle;
    multiplayerGameState.targetArticle = data.targetArticle;
    multiplayerGameState.gameStarted = true;
    
    // Initialisiere Spielzustand
    gameState.isActive = true;
    gameState.isSinglePlayer = false;
    gameState.startArticleTitle = data.startArticle;
    gameState.targetArticleTitle = data.targetArticle;
    gameState.clickCount = 0;
    gameState.currentTime = 0;
    
    // Zeige Game Screen
    showScreen('gameScreen');
    
    // Zeige Multiplayer Informationen
    multiplayerInfoElement.classList.remove('hidden');
    
    // Aktualisiere UI
    startArticle.textContent = gameState.startArticleTitle;
    targetArticle.textContent = gameState.targetArticleTitle;
    updateClickCount(0);
    updateTimer(0);
    
    // Lade Startartikel
    loadArticle(gameState.startArticleTitle);
    
    // Starte Timer
    startTimer();
}

function handlePlayerUpdate(data) {
    // Aktualisiere Gegner-Informationen
    if (data.playerId === multiplayerGameState.player1.id) {
        multiplayerGameState.player1.clicks = data.clicks;
        multiplayerGameState.player1.currentArticle = data.currentArticle;
        player1ClicksElement.textContent = data.clicks;
    } else if (data.playerId === multiplayerGameState.player2.id) {
        multiplayerGameState.player2.clicks = data.clicks;
        multiplayerGameState.player2.currentArticle = data.currentArticle;
        player2ClicksElement.textContent = data.clicks;
    }
}

function handleGameOver(data) {
    // Spiel ist beendet
    gameState.isActive = false;
    multiplayerGameState.gameFinished = true;
    
    // Stoppe Timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Speichere Spielergebnisse
    if (data.winnerId === multiplayerGameState.player1.id) {
        multiplayerGameState.player1.finished = true;
        multiplayerGameState.player1.finishTime = data.finishTime;
    } else {
        multiplayerGameState.player2.finished = true;
        multiplayerGameState.player2.finishTime = data.finishTime;
    }
    
    // Aktualisiere UI für Game Over Screen
    updateMultiplayerGameOverScreen(data);
    
    // Zeige Game Over Screen
    document.getElementById('gameOverSinglePlayer').classList.add('hidden');
    gameOverMultiPlayer.classList.remove('hidden');
    showScreen('gameOverScreen');
}

// UI-Aktualisierungsfunktionen
function updateMultiplayerGameOverScreen(data) {
    // Bestimme Gewinner und Verlierer
    const winnerId = data.winnerId;
    const loserId = winnerId === multiplayerGameState.player1.id ? 
                   multiplayerGameState.player2.id : 
                   multiplayerGameState.player1.id;
    
    const winnerIsPlayer1 = winnerId === multiplayerGameState.player1.id;
    const winnerName = winnerIsPlayer1 ? 
                      multiplayerGameState.player1.name : 
                      multiplayerGameState.player2.name;
    
    // Setze Gewinner-Ankündigung
    winnerAnnouncement.textContent = `${winnerName} hat gewonnen!`;
    
    // Aktualisiere Spielerinformationen
    player1ResultElement.textContent = multiplayerGameState.player1.name;
    player2ResultElement.textContent = multiplayerGameState.player2.name;
    
    // Setze Zeiten
    const player1Time = winnerIsPlayer1 ? data.finishTime : "-";
    const player2Time = !winnerIsPlayer1 ? data.finishTime : "-";
    
    player1TimeElement.textContent = typeof player1Time === 'number' ? 
                                   formatTime(player1Time) : player1Time;
    player2TimeElement.textContent = typeof player2Time === 'number' ? 
                                   formatTime(player2Time) : player2Time;
    
    // Setze Klicks
    player1FinalClicksElement.textContent = multiplayerGameState.player1.clicks;
    player2FinalClicksElement.textContent = multiplayerGameState.player2.clicks;
    
    // Setze ELO-Informationen, falls vorhanden
    if (data.player1Elo) {
        player1EloElement.textContent = data.player1Elo;
        player1EloDiffElement.textContent = data.player1EloDiff > 0 ? 
                                          `+${data.player1EloDiff}` : 
                                          data.player1EloDiff;
        
        // Setze Klassen basierend auf ELO-Diff
        if (data.player1EloDiff > 0) {
            player1EloDiffElement.classList.add('elo-gain');
            player1EloDiffElement.classList.remove('elo-loss');
        } else {
            player1EloDiffElement.classList.add('elo-loss');
            player1EloDiffElement.classList.remove('elo-gain');
        }
    }
    
    if (data.player2Elo) {
        player2EloElement.textContent = data.player2Elo;
        player2EloDiffElement.textContent = data.player2EloDiff > 0 ? 
                                          `+${data.player2EloDiff}` : 
                                          data.player2EloDiff;
        
        // Setze Klassen basierend auf ELO-Diff
        if (data.player2EloDiff > 0) {
            player2EloDiffElement.classList.add('elo-gain');
            player2EloDiffElement.classList.remove('elo-loss');
        } else {
            player2EloDiffElement.classList.add('elo-loss');
            player2EloDiffElement.classList.remove('elo-gain');
        }
    }
}

// Hilfsfunktion zum Formatieren der Zeit
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Multiplayer-Funktionen
function showMultiPlayerSetup() {
    // Wechsle zum Multiplayer-Setup-Screen
    showScreen('multiPlayerSetup');
    
    // Initialisiere Socket-Verbindung, falls noch nicht geschehen
    initSocketConnection();
}

function startFindingOpponent() {
    // Überprüfe, ob ein Spielername eingegeben wurde
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Bitte gib einen Spielernamen ein!');
        return;
    }
    
    // Speichere Spielername
    gameState.playerName = playerName;
    
    // Zeige Warteraum an
    waitingRoom.classList.remove('hidden');
    
    // Sende Anfrage an Server, um einen Gegner zu finden
    socket.emit('findOpponent', { playerName });
}

function cancelFindingOpponent() {
    // Bringe den Spieler zurück zum Multiplayer-Setup
    waitingRoom.classList.add('hidden');
    
    // Teile dem Server mit, dass die Suche abgebrochen wurde
    socket.emit('cancelSearch');
}

// Aktualisiert den Server über den aktuellen Spielstatus
function updateServerPlayerStatus() {
    if (!gameState.isActive || gameState.isSinglePlayer) {
        return; // Nicht im Multiplayer-Modus
    }
    
    // Sende Statusupdate an Server
    socket.emit('playerUpdate', {
        gameId: multiplayerGameState.gameId,
        clicks: gameState.clickCount,
        currentArticle: gameState.currentArticleTitle
    });
}

// Teile dem Server mit, dass der Spieler das Ziel erreicht hat
function notifyServerGameWon() {
    if (!gameState.isActive || gameState.isSinglePlayer) {
        return; // Nicht im Multiplayer-Modus
    }
    
    // Sende Spielende-Nachricht an Server
    socket.emit('gameWon', {
        gameId: multiplayerGameState.gameId,
        finishTime: gameState.currentTime,
        clicks: gameState.clickCount
    });
}

// Event-Handler für den Artikel-Container zur Überwachung von Link-Klicks
function setupMultiplayerLinkHandling() {
    // Diese Funktion muss aus der main.js aufgerufen werden
    // nach dem Laden eines neuen Artikels
    const articleContainer = document.getElementById('articleContainer');
    
    // Bei jedem Link-Klick den Server über den aktuellen Status informieren
    articleContainer.addEventListener('click', function(e) {
        // Dies wird in der main.js-Logik für Links gehandhabt
        // Hier nur das Update zum Server senden
        if (!gameState.isActive || gameState.isSinglePlayer) {
            return; // Nicht im Multiplayer-Modus
        }
        
        // Eine kurze Verzögerung, um sicherzustellen, dass der Artikel geladen wurde
        setTimeout(() => {
            updateServerPlayerStatus();
        }, 100);
    });
}

// Funktion zum Zurücksetzen des Multiplayer-Spielzustands
function resetMultiplayerGameState() {
    multiplayerGameState = {
        gameId: null,
        player1: {
            id: null,
            name: '',
            clicks: 0,
            currentArticle: '',
            finished: false,
            finishTime: null
        },
        player2: {
            id: null,
            name: '',
            clicks: 0,
            currentArticle: '',
            finished: false,
            finishTime: null
        },
        isPlayer1: false,
        startArticle: '',
        targetArticle: '',
        gameStarted: false,
        gameFinished: false
    };
    
    // Aktualisiere UI
    if (player1ClicksElement) player1ClicksElement.textContent = '0';
    if (player2ClicksElement) player2ClicksElement.textContent = '0';
}

// Funktion zum Neustart des Multiplayer-Spiels
function restartMultiplayerGame() {
    // Zurück zum Multiplayer-Setup
    resetMultiplayerGameState();
    showScreen('multiPlayerSetup');
}

// Funktion zum Verlassen eines laufenden Multiplayer-Spiels
function leaveMultiplayerGame() {
    if (multiplayerGameState.gameId) {
        socket.emit('leaveGame', { gameId: multiplayerGameState.gameId });
    }
    
    resetMultiplayerGameState();
    showHomeScreen();
}

// Hilfsfunktion, um ELO-Rating anzuzeigen
function displayPlayerELO() {
    // Diese Funktion kann verwendet werden, um den ELO-Wert eines Spielers anzuzeigen
    // Anfrage an Server senden, um aktuellen ELO-Wert zu erhalten
    socket.emit('getPlayerELO', { playerName: gameState.playerName }, function(response) {
        if (response && response.elo) {
            // UI-Element aktualisieren, falls vorhanden
            const playerEloDisplay = document.getElementById('playerEloDisplay');
            if (playerEloDisplay) {
                playerEloDisplay.textContent = `ELO: ${response.elo}`;
            }
        }
    });
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initMultiplayerEventHandlers();
    
    // Buttons für den Game Over Screen
    document.getElementById('playAgainMulti').addEventListener('click', restartMultiplayerGame);
    document.getElementById('backToHomeMulti').addEventListener('click', function() {
        resetMultiplayerGameState();
        showHomeScreen();
    });
    
    // Button für das Verlassen des Spiels
    const leaveGameButton = document.getElementById('leaveGame');
    if (leaveGameButton) {
        leaveGameButton.addEventListener('click', leaveMultiplayerGame);
    }
});

// Exportiert die Funktionen, die in main.js benötigt werden
window.multiplayerFunctions = {
    initSocketConnection,
    updateServerPlayerStatus,
    notifyServerGameWon,
    setupMultiplayerLinkHandling,
    resetMultiplayerGameState,
    displayPlayerELO
};
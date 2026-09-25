/**
 * ============================================================================
 * SNAKE • WATER • GUN - Pure Core Engine & Single Player Loop
 * Offline-first, Web Audio Synthesized FX, Animated Duel Arena
 * ============================================================================
 */

// Move Enumeration Constants
const CHOICES = Object.freeze({
  SNAKE: -1,
  WATER: 1,
  GUN: 0
});

// Metadata for choices (icons, names, rules)
const CHOICE_CONFIG = Object.freeze({
  [CHOICES.SNAKE]: {
    id: CHOICES.SNAKE,
    name: 'Snake',
    emoji: '🐍',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    beats: CHOICES.WATER,
    verb: 'drinks'
  },
  [CHOICES.WATER]: {
    id: CHOICES.WATER,
    name: 'Water',
    emoji: '💧',
    color: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.4)',
    beats: CHOICES.GUN,
    verb: 'douses'
  },
  [CHOICES.GUN]: {
    id: CHOICES.GUN,
    name: 'Gun',
    emoji: '🔫',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    beats: CHOICES.SNAKE,
    verb: 'shoots'
  }
});

/**
 * Ported pure game-resolution function
 * Rules:
 *  - Snake (-1) drinks Water (1) -> Snake wins
 *  - Water (1) douses Gun (0)    -> Water wins
 *  - Gun (0) shoots Snake (-1)   -> Gun wins
 *  - Identical moves             -> Draw
 *
 * @param {number} player1Choice - Move of player 1 (-1, 1, or 0)
 * @param {number} player2Choice - Move of player 2 (-1, 1, or 0)
 * @returns {{ winner: 'player1'|'player2'|'draw', reason: string, p1Config: object, p2Config: object }}
 */
function determineWinner(player1Choice, player2Choice) {
  const p1 = CHOICE_CONFIG[player1Choice];
  const p2 = CHOICE_CONFIG[player2Choice];

  if (!p1 || !p2) {
    throw new Error(`Invalid choices provided: p1=${player1Choice}, p2=${player2Choice}`);
  }

  // Draw condition
  if (player1Choice === player2Choice) {
    return {
      winner: 'draw',
      reason: `Both combatants chose ${p1.emoji} ${p1.name}. Stalemate!`,
      p1Config: p1,
      p2Config: p2
    };
  }

  // Winning conditions for Player 1:
  // Snake (-1) beats Water (1)
  // Water (1) beats Gun (0)
  // Gun (0) beats Snake (-1)
  const isPlayer1Winner =
    (player1Choice === CHOICES.SNAKE && player2Choice === CHOICES.WATER) ||
    (player1Choice === CHOICES.WATER && player2Choice === CHOICES.GUN) ||
    (player1Choice === CHOICES.GUN && player2Choice === CHOICES.SNAKE);

  if (isPlayer1Winner) {
    return {
      winner: 'player1',
      reason: `${p1.emoji} ${p1.name} ${p1.verb} ${p2.emoji} ${p2.name}!`,
      p1Config: p1,
      p2Config: p2
    };
  }

  // Otherwise Player 2 wins
  return {
    winner: 'player2',
    reason: `${p2.emoji} ${p2.name} ${p2.verb} ${p1.emoji} ${p1.name}!`,
    p1Config: p1,
    p2Config: p2
  };
}

/**
 * Web Audio Synthesized Sound Controller (100% offline, zero network assets)
 */
class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playShuffleTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350 + Math.random() * 200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playWin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Victory fanfare arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  playLose() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Descending minor interval buzz
    const notes = [440, 370, 311];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.1;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.22);
    });
  }

  playDraw() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Neutral dual harmonic chord
    const now = this.ctx.currentTime;
    [440, 554.37].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }
}

/**
 * Main Game Controller
 */
class SnakeWaterGunGame {
  constructor() {
    // Game State
    this.state = {
      round: 1,
      playerScore: 0,
      cpuScore: 0,
      draws: 0,
      isResolving: false
    };

    this.sound = new SoundController();

    // Cache DOM Elements
    this.dom = {
      // Scores
      scorePlayer: document.getElementById('score-player'),
      scoreCpu: document.getElementById('score-cpu'),
      scoreDraws: document.getElementById('score-draws'),
      roundNumber: document.getElementById('round-number'),

      // Cards
      cardPlayer: document.getElementById('card-player'),
      playerEmoji: document.getElementById('player-card-emoji'),
      playerTitle: document.getElementById('player-card-title'),
      playerMeta: document.getElementById('player-card-meta'),

      cardCpu: document.getElementById('card-cpu'),
      cpuEmoji: document.getElementById('cpu-card-emoji'),
      cpuTitle: document.getElementById('cpu-card-title'),
      cpuMeta: document.getElementById('cpu-card-meta'),

      // Center & Outcomes
      vsBadge: document.getElementById('vs-badge'),
      outcomeBanner: document.getElementById('outcome-banner'),
      outcomeBadge: document.getElementById('outcome-badge'),
      outcomeDesc: document.getElementById('outcome-desc'),
      statusSummary: document.getElementById('status-summary'),

      // Buttons
      choiceButtons: document.querySelectorAll('.choice-btn'),
      btnSound: document.getElementById('btn-sound-toggle'),
      soundIcon: document.getElementById('sound-icon'),
      soundLabel: document.getElementById('sound-label'),
      btnReset: document.getElementById('btn-reset-score')
    };

    this.initListeners();
  }

  initListeners() {
    // Move Selection Buttons
    this.dom.choiceButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const choice = parseInt(btn.dataset.choice, 10);
        this.playRound(choice);
      });
    });

    // Sound Toggle
    this.dom.btnSound.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      this.dom.soundLabel.textContent = isMuted ? 'SFX Off' : 'SFX On';
    });

    // Reset Scores
    this.dom.btnReset.addEventListener('click', () => {
      this.resetGame();
    });

    // Keyboard Shortcuts (1 = Snake, 2 = Water, 3 = Gun, M = Mute)
    window.addEventListener('keydown', (e) => {
      if (this.state.isResolving) return;

      const key = e.key.toLowerCase();
      if (key === '1' || key === 's') {
        this.playRound(CHOICES.SNAKE);
      } else if (key === '2' || key === 'w') {
        this.playRound(CHOICES.WATER);
      } else if (key === '3' || key === 'g') {
        this.playRound(CHOICES.GUN);
      } else if (key === 'm') {
        this.dom.btnSound.click();
      }
    });
  }

  /**
   * Generates a randomized AI move
   * @returns {number} -1, 1, or 0
   */
  getRandomCpuChoice() {
    const moves = [CHOICES.SNAKE, CHOICES.WATER, CHOICES.GUN];
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  /**
   * Executes a complete animated round between Player and AI
   * @param {number} playerChoice
   */
  async playRound(playerChoice) {
    if (this.state.isResolving) return;
    this.state.isResolving = true;

    this.sound.playClick();
    this.setControlsDisabled(true);

    const playerCfg = CHOICE_CONFIG[playerChoice];

    // Reset banner and previous match card effects
    this.dom.outcomeBanner.classList.add('hidden');
    this.dom.cardPlayer.className = 'battle-card ready-state';
    this.dom.cardCpu.className = 'battle-card ready-state';

    // 1. Instantly display player move on card
    this.dom.playerEmoji.textContent = playerCfg.emoji;
    this.dom.playerTitle.textContent = playerCfg.name;
    this.dom.playerMeta.textContent = 'Move locked in!';
    this.dom.cardPlayer.classList.add('animate-pop');

    // Highlight chosen button
    this.dom.choiceButtons.forEach((btn) => {
      if (parseInt(btn.dataset.choice, 10) === playerChoice) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    // 2. Animate AI "thinking / shuffling"
    this.dom.vsBadge.classList.add('active-clash');
    this.dom.cardCpu.classList.add('shuffling');
    this.dom.cpuMeta.textContent = 'Computing optimal move...';
    this.dom.statusSummary.textContent = 'Opponent is making a move...';

    const shuffleOptions = [CHOICE_CONFIG[CHOICES.SNAKE], CHOICE_CONFIG[CHOICES.WATER], CHOICE_CONFIG[CHOICES.GUN]];
    let shuffleCount = 0;
    const maxShuffles = 8;

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        const item = shuffleOptions[shuffleCount % 3];
        this.dom.cpuEmoji.textContent = item.emoji;
        this.dom.cpuTitle.textContent = item.name;
        this.sound.playShuffleTick();
        shuffleCount++;

        if (shuffleCount >= maxShuffles) {
          clearInterval(interval);
          resolve();
        }
      }, 90);
    });

    // 3. Finalize AI choice
    const cpuChoice = this.getRandomCpuChoice();
    const cpuCfg = CHOICE_CONFIG[cpuChoice];

    this.dom.cardCpu.classList.remove('shuffling');
    this.dom.cpuEmoji.textContent = cpuCfg.emoji;
    this.dom.cpuTitle.textContent = cpuCfg.name;
    this.dom.cpuMeta.textContent = 'Move revealed!';
    this.dom.cardCpu.classList.add('animate-pop');

    // 4. Resolve Winner
    const result = determineWinner(playerChoice, cpuChoice);

    // 5. Update UI with outcome
    this.renderRoundResult(result);

    // Small delay before re-enabling controls for the next round
    setTimeout(() => {
      this.state.round++;
      this.dom.roundNumber.textContent = this.state.round;
      this.setControlsDisabled(false);
      this.state.isResolving = false;
      this.dom.choiceButtons.forEach((btn) => btn.classList.remove('selected'));
      this.dom.vsBadge.classList.remove('active-clash');
    }, 900);
  }

  /**
   * Applies round results to scores, audio, and visual cards
   * @param {object} result
   */
  renderRoundResult(result) {
    this.dom.outcomeBanner.classList.remove('hidden');

    if (result.winner === 'player1') {
      this.state.playerScore++;
      this.dom.scorePlayer.textContent = this.state.playerScore;

      this.dom.cardPlayer.className = 'battle-card winner animate-pop';
      this.dom.cardCpu.className = 'battle-card loser animate-shake';

      this.dom.outcomeBadge.className = 'outcome-badge win';
      this.dom.outcomeBadge.textContent = 'YOU WIN!';
      this.dom.outcomeDesc.textContent = result.reason;
      this.dom.statusSummary.textContent = `Round ${this.state.round}: Victory! ${result.reason}`;

      this.sound.playWin();
    } else if (result.winner === 'player2') {
      this.state.cpuScore++;
      this.dom.scoreCpu.textContent = this.state.cpuScore;

      this.dom.cardCpu.className = 'battle-card winner animate-pop';
      this.dom.cardPlayer.className = 'battle-card loser animate-shake';

      this.dom.outcomeBadge.className = 'outcome-badge lose';
      this.dom.outcomeBadge.textContent = 'COMPUTER WINS!';
      this.dom.outcomeDesc.textContent = result.reason;
      this.dom.statusSummary.textContent = `Round ${this.state.round}: Defeat! ${result.reason}`;

      this.sound.playLose();
    } else {
      this.state.draws++;
      this.dom.scoreDraws.textContent = this.state.draws;

      this.dom.cardPlayer.className = 'battle-card draw';
      this.dom.cardCpu.className = 'battle-card draw';

      this.dom.outcomeBadge.className = 'outcome-badge draw';
      this.dom.outcomeBadge.textContent = "IT'S A DRAW!";
      this.dom.outcomeDesc.textContent = result.reason;
      this.dom.statusSummary.textContent = `Round ${this.state.round}: Draw. Both played evenly!`;

      this.sound.playDraw();
    }
  }

  /**
   * Enable/Disable interactive selection buttons
   * @param {boolean} disabled
   */
  setControlsDisabled(disabled) {
    this.dom.choiceButtons.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  /**
   * Reset the game scores and arena back to initial state
   */
  resetGame() {
    if (this.state.isResolving) return;

    this.state.round = 1;
    this.state.playerScore = 0;
    this.state.cpuScore = 0;
    this.state.draws = 0;

    this.dom.scorePlayer.textContent = '0';
    this.dom.scoreCpu.textContent = '0';
    this.dom.scoreDraws.textContent = '0';
    this.dom.roundNumber.textContent = '1';

    this.dom.cardPlayer.className = 'battle-card ready-state';
    this.dom.playerEmoji.textContent = '❓';
    this.dom.playerTitle.textContent = 'Select Move';
    this.dom.playerMeta.textContent = 'Awaiting input...';

    this.dom.cardCpu.className = 'battle-card ready-state';
    this.dom.cpuEmoji.textContent = '🤖';
    this.dom.cpuTitle.textContent = 'Computer';
    this.dom.cpuMeta.textContent = 'Waiting for player...';

    this.dom.outcomeBanner.classList.add('hidden');
    this.dom.statusSummary.textContent = 'Scores reset. Ready for Round 1!';
    this.sound.playClick();
  }
}

// Instantiate game on DOM ready when in browser environment
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.game = new SnakeWaterGunGame();
  });
}

// Export determineWinner for unit tests / modular verification
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHOICES,
    determineWinner
  };
}

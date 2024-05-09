class Player {
    constructor() {
      this.elo = 1000;
      this.gamesPlayed = 0;
    }
  
    getKFactor() {
      if (this.elo < 1100) {
        return 80 - (30 * (this.elo - 1000) / 100);
      } else if (this.elo < 1300) {
        return 50;
      } else if (this.elo < 1600) {
        return 40;
      } else {
        return 32;
      }
    }
  
    updateElo(opponentElo, win) {
      const k = this.getKFactor();
      const expected = 1 / (1 + Math.pow(10, (opponentElo - this.elo) / 400));
      const actual = win ? 1 : 0;
      this.elo += k * (actual - expected);
      if (this.elo < 1000) this.elo = 1000;
      this.gamesPlayed++;
    }
  
    decayElo() {
      if (this.gamesPlayed > 5) return;
      let decay = 0;
      if (this.elo > 1500) {
        decay = Math.floor((this.elo - 1500) / 100);
      } else if (this.elo > 1400) {
        decay = Math.floor((this.elo - 1400) / 50);
      }
      this.elo = Math.max(1000, this.elo - decay);
    }
  }

  // Crea instancias de la clase Player para cada jugador
let player1 = new Player();
let player2 = new Player();

// Establece el Elo inicial de cada jugador
player1.elo = 1216;
player2.elo = 1202;

let eloplayer1 = player1.elo;
let eloplayer2 = player2.elo;
// Actualiza el Elo de cada jugador después del juego
// El primer jugador ganó, por lo que pasamos true para el argumento 'win'
player1.updateElo(eloplayer2, true);
player2.updateElo(eloplayer1, false);

console.log(`Nuevo Elo del jugador 1: ${Math.round(player1.elo)}`);
console.log(`Nuevo Elo del jugador 2: ${Math.round(player2.elo)}`);
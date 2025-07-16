import { AppDataSource } from '../utils/database';

// Mock rating service class for testing
class TestRatingService {
  private K_FACTOR = 32; // How much a single game can affect rating
  
  /**
   * Calculate the expected score for a player
   */
  private calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }
  
  /**
   * Calculate ELO rating change for a single match-up
   */
  private calculateEloChange(playerRating: number, opponentRating: number, actualScore: number): number {
    const expectedScore = this.calculateExpectedScore(playerRating, opponentRating);
    return this.K_FACTOR * (actualScore - expectedScore);
  }
  
  /**
   * Get rating multiplier based on game mode
   */
  private getModeMultiplier(gameMode: string): number {
    switch (gameMode) {
      case 'competitive': return 1.0;  // Full impact
      case 'standard': return 0.8;     // Slightly reduced impact
      case 'casual': return 0.5;       // Half impact
      case 'tutorial': return 0.0;     // No impact
      default: return 0.8;             // Default is standard mode
    }
  }
  
  /**
   * Test the rating calculation for a specific scenario
   */
  public testRatingCalculation(scenario: {
    player1Rating: number;
    player2Rating: number;
    player1IsWinner: boolean;
    gameMode: string;
  }) {
    console.log('\n=== RATING CALCULATION TEST ===');
    console.log(`Player 1 Rating: ${scenario.player1Rating}`);
    console.log(`Player 2 Rating: ${scenario.player2Rating}`);
    console.log(`Player 1 is Winner: ${scenario.player1IsWinner}`);
    console.log(`Game Mode: ${scenario.gameMode}`);
    
    // Calculate rating changes for both players
    const player1Score = scenario.player1IsWinner ? 1 : 0;
    const player2Score = scenario.player1IsWinner ? 0 : 1;
    
    // Player 1's rating change
    const player1Change = this.calculateEloChange(
      scenario.player1Rating,
      scenario.player2Rating,
      player1Score
    );
    
    // Player 2's rating change  
    const player2Change = this.calculateEloChange(
      scenario.player2Rating,
      scenario.player1Rating,
      player2Score
    );
    
    // Apply game mode multiplier
    const modeMultiplier = this.getModeMultiplier(scenario.gameMode);
    const player1FinalChange = Math.round(player1Change * modeMultiplier);
    const player2FinalChange = Math.round(player2Change * modeMultiplier);
    
    console.log('\n--- Detailed Calculation ---');
    console.log(`Player 1 Expected Score: ${this.calculateExpectedScore(scenario.player1Rating, scenario.player2Rating).toFixed(3)}`);
    console.log(`Player 2 Expected Score: ${this.calculateExpectedScore(scenario.player2Rating, scenario.player1Rating).toFixed(3)}`);
    console.log(`Player 1 Actual Score: ${player1Score}`);
    console.log(`Player 2 Actual Score: ${player2Score}`);
    console.log(`Mode Multiplier (${scenario.gameMode}): ${modeMultiplier}`);
    
    console.log('\n--- Results ---');
    console.log(`Player 1 Raw Change: ${player1Change.toFixed(2)}`);
    console.log(`Player 2 Raw Change: ${player2Change.toFixed(2)}`);
    console.log(`Player 1 Final Change: ${player1FinalChange > 0 ? '+' : ''}${player1FinalChange}`);
    console.log(`Player 2 Final Change: ${player2FinalChange > 0 ? '+' : ''}${player2FinalChange}`);
    console.log(`Player 1 New Rating: ${scenario.player1Rating + player1FinalChange}`);
    console.log(`Player 2 New Rating: ${scenario.player2Rating + player2FinalChange}`);
    
    // Verify that winner gains points and loser loses points
    const winner1GainsPoints = scenario.player1IsWinner && player1FinalChange > 0;
    const winner2GainsPoints = !scenario.player1IsWinner && player2FinalChange > 0;
    const loser1LosesPoints = !scenario.player1IsWinner && player1FinalChange < 0;
    const loser2LosesPoints = scenario.player1IsWinner && player2FinalChange < 0;
    
    console.log('\n--- Validation ---');
    if (scenario.player1IsWinner) {
      console.log(`✅ Winner (Player 1) gains points: ${winner1GainsPoints ? 'YES' : 'NO'}`);
      console.log(`✅ Loser (Player 2) loses points: ${loser2LosesPoints ? 'YES' : 'NO'}`);
    } else {
      console.log(`✅ Winner (Player 2) gains points: ${winner2GainsPoints ? 'YES' : 'NO'}`);
      console.log(`✅ Loser (Player 1) loses points: ${loser1LosesPoints ? 'YES' : 'NO'}`);
    }
    
    const isCorrect = (winner1GainsPoints || winner2GainsPoints) && (loser1LosesPoints || loser2LosesPoints);
    console.log(`\n🏁 Rating calculation is ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
    
    return {
      player1Change: player1FinalChange,
      player2Change: player2FinalChange,
      isCorrect
    };
  }
}

async function runRatingTests() {
  console.log('🧪 Testing ELO Rating Calculation Logic');
  
  const testService = new TestRatingService();
  
  // Test scenarios
  const scenarios = [
    {
      name: "Equal ratings - Player 1 wins",
      player1Rating: 1200,
      player2Rating: 1200,
      player1IsWinner: true,
      gameMode: 'standard'
    },
    {
      name: "Equal ratings - Player 2 wins", 
      player1Rating: 1200,
      player2Rating: 1200,
      player1IsWinner: false,
      gameMode: 'standard'
    },
    {
      name: "Higher rated player wins",
      player1Rating: 1400,
      player2Rating: 1200,
      player1IsWinner: true,
      gameMode: 'standard'
    },
    {
      name: "Lower rated player upsets higher rated",
      player1Rating: 1200,
      player2Rating: 1400,
      player1IsWinner: true,
      gameMode: 'standard'
    },
    {
      name: "Competitive mode - Equal ratings",
      player1Rating: 1200,
      player2Rating: 1200,
      player1IsWinner: true,
      gameMode: 'competitive'
    }
  ];
  
  let allCorrect = true;
  
  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`TEST: ${scenario.name}`);
    const result = testService.testRatingCalculation(scenario);
    if (!result.isCorrect) {
      allCorrect = false;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🏁 ALL TESTS ${allCorrect ? 'PASSED' : 'FAILED'}`);
  console.log(`${'='.repeat(50)}`);
}

// Run the test if called directly
if (require.main === module) {
  runRatingTests()
    .then(() => {
      console.log('Rating tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Rating tests failed:', error);
      process.exit(1);
    });
}

export default runRatingTests; 
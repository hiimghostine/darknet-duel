const fs = require('fs');
const path = require('path');

// Path to defender cards JSON file
const defenderCardsPath = path.join(__dirname, 'game-server/src/game/cards/defender.json');

// Read the defender cards file
try {
  const defenderCardsData = JSON.parse(fs.readFileSync(defenderCardsPath, 'utf8'));
  
  // Get the original count of cards
  const originalCount = defenderCardsData.cards.length;
  let updatedCount = 0;
  
  // Track original types for logging
  const typeChanges = [];
  
  // Update all cards with isReactive: true to have type: "reaction"
  defenderCardsData.cards.forEach(card => {
    if (card.isReactive === true) {
      // Store the original type for logging
      typeChanges.push({
        id: card.id,
        name: card.name,
        originalType: card.type,
        newType: 'reaction'
      });
      
      // Update the type
      card.type = 'reaction';
      updatedCount++;
    }
  });
  
  // Write the updated data back to the file
  fs.writeFileSync(defenderCardsPath, JSON.stringify(defenderCardsData, null, 2), 'utf8');
  
  console.log(`Successfully updated ${updatedCount} of ${originalCount} defender cards.`);
  console.log('Cards updated:');
  typeChanges.forEach(change => {
    console.log(`- ${change.id}: "${change.name}" changed from "${change.originalType}" to "${change.newType}"`);
  });
  
} catch (error) {
  console.error('Error updating defender cards:', error);
}

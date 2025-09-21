import fs from 'fs';
import path from 'path';
import { InfrastructureCard, InfrastructureCollection } from './types';

/**
 * Card loader for loading different card types
 */
export class CardLoader {
  private infrastructureCards: InfrastructureCard[] = [];

  /**
   * Initializes the card loader and loads all card data
   */
  constructor() {
    this.loadInfrastructureCards();
  }

  /**
   * Loads infrastructure cards from JSON file
   */
  private loadInfrastructureCards(): void {
    try {
      const filePath = path.join(__dirname, 'infrastructure.json');
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data) as InfrastructureCollection;
      this.infrastructureCards = parsed.cards;
      console.log(`Loaded ${this.infrastructureCards.length} infrastructure cards`);
    } catch (error) {
      console.error('Failed to load infrastructure cards:', error);
      this.infrastructureCards = [];
    }
  }

  /**
   * Get all infrastructure cards
   */
  getInfrastructureCards(): InfrastructureCard[] {
    return [...this.infrastructureCards];
  }

  /**
   * Get a specific infrastructure card by ID
   */
  getInfrastructureCardById(id: string): InfrastructureCard | undefined {
    return this.infrastructureCards.find(card => card.id === id);
  }

  /**
   * Get a random selection of infrastructure cards
   */
  getRandomInfrastructureCards(count: number): InfrastructureCard[] {
    if (count >= this.infrastructureCards.length) {
      return [...this.infrastructureCards];
    }
    
    // Create a copy of the array to shuffle
    const shuffled = [...this.infrastructureCards];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }
}

// Export a singleton instance for easy access throughout the app
export const cardLoader = new CardLoader();

import Router from '@koa/router';
import { loadAttackerCards } from '../game/cards/attackerCardLoader';
import { loadDefenderCards } from '../game/cards/defenderCardLoader';

const router = new Router();

/**
 * GET /api/cards/attacker
 * Returns all attacker cards from the actual card loader
 */
router.get('/api/cards/attacker', async (ctx) => {
  try {
    const attackerCards = loadAttackerCards();
    ctx.body = {
      success: true,
      cards: attackerCards,
      count: attackerCards.length
    };
  } catch (error) {
    console.error('Error loading attacker cards for API:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to load attacker cards',
      cards: []
    };
  }
});

/**
 * GET /api/cards/defender  
 * Returns all defender cards from the actual card loader
 */
router.get('/api/cards/defender', async (ctx) => {
  try {
    const defenderCards = loadDefenderCards();
    ctx.body = {
      success: true,
      cards: defenderCards,
      count: defenderCards.length
    };
  } catch (error) {
    console.error('Error loading defender cards for API:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to load defender cards',
      cards: []
    };
  }
});

/**
 * GET /api/cards/all
 * Returns both attacker and defender cards
 */
router.get('/api/cards/all', async (ctx) => {
  try {
    const attackerCards = loadAttackerCards();
    const defenderCards = loadDefenderCards();
    
    ctx.body = {
      success: true,
      attacker: {
        cards: attackerCards,
        count: attackerCards.length
      },
      defender: {
        cards: defenderCards,
        count: defenderCards.length
      },
      total: attackerCards.length + defenderCards.length
    };
  } catch (error) {
    console.error('Error loading all cards for API:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to load cards',
      attacker: { cards: [], count: 0 },
      defender: { cards: [], count: 0 },
      total: 0
    };
  }
});

export default router; 
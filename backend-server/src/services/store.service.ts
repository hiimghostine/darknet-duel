import { AppDataSource } from '../utils/database';
import { Account } from '../entities/account.entity';
import { Purchase, ItemType, Currency } from '../entities/purchase.entity';
import { CurrencyService } from './currency.service';
import fs from 'fs';
import path from 'path';

// Import the decorations data
const decorationsData = require('../../assets/data/decorations.js');

export interface StoreItem {
  n: string; // name
  d: string; // description
  f: string; // file/id
  unit: 'creds' | 'crypts';
  cost: number;
}

export interface StoreCategory {
  n: string; // name
  d: string; // description
  descTopM?: string;
  b: {
    i: string; // banner image
    t: string; // banner text
    h: number; // height
  };
  i: StoreItem[]; // items
}

export interface UserPurchase {
  id: string;
  itemType: ItemType;
  itemId: string;
  purchasePrice: number;
  currency: Currency;
  purchasedAt: Date;
}

export class StoreService {
  private accountRepository = AppDataSource.getRepository(Account);
  private purchaseRepository = AppDataSource.getRepository(Purchase);
  private currencyService = new CurrencyService();

  /**
   * Get all store data (decorations categories and items)
   */
  async getStoreData(): Promise<StoreCategory[]> {
    return decorationsData.data || [];
  }

  /**
   * Get user's purchased items
   */
  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    const purchases = await this.purchaseRepository.find({
      where: { 
        accountId: userId,
        isActive: true 
      },
      order: { purchasedAt: 'DESC' }
    });

    return purchases.map(purchase => ({
      id: purchase.id,
      itemType: purchase.itemType,
      itemId: purchase.itemId,
      purchasePrice: purchase.purchasePrice,
      currency: purchase.currency,
      purchasedAt: purchase.purchasedAt
    }));
  }

  /**
   * Check if user owns a specific item
   */
  async userOwnsItem(userId: string, itemId: string, itemType: ItemType = ItemType.DECORATION): Promise<boolean> {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        accountId: userId,
        itemId,
        itemType,
        isActive: true
      }
    });

    return !!purchase;
  }

  /**
   * Find item in store data
   */
  private findItemInStore(itemId: string): { item: StoreItem; category: StoreCategory } | null {
    const storeData = decorationsData.data || [];
    
    for (const category of storeData) {
      const item = category.i.find((item: StoreItem) => item.f === itemId);
      if (item) {
        return { item, category };
      }
    }
    
    return null;
  }

  /**
   * Purchase an item
   */
  async purchaseItem(userId: string, itemId: string, itemType: ItemType = ItemType.DECORATION): Promise<{ success: boolean; message: string; newBalance?: any }> {
    // Check if user already owns this item
    const alreadyOwns = await this.userOwnsItem(userId, itemId, itemType);
    if (alreadyOwns) {
      return { success: false, message: 'You already own this item' };
    }

    // Find the item in store data
    const storeItemData = this.findItemInStore(itemId);
    if (!storeItemData) {
      return { success: false, message: 'Item not found in store' };
    }

    const { item } = storeItemData;

    // Get user's current balance
    const balance = await this.currencyService.getBalance(userId);
    if (!balance) {
      return { success: false, message: 'User not found' };
    }

    // Check if user has enough currency
    const requiredCurrency = item.unit as 'creds' | 'crypts';
    const userCurrencyAmount = balance[requiredCurrency];
    
    if (userCurrencyAmount < item.cost) {
      return { 
        success: false, 
        message: `Insufficient ${requiredCurrency}. You have ${userCurrencyAmount}, but need ${item.cost}` 
      };
    }

    try {
      // Deduct currency from user
      await this.currencyService.subtractCurrency(
        userId, 
        requiredCurrency, 
        item.cost, 
        `Purchase: ${item.n} (${itemId})`
      );

      // Create purchase record
      const purchase = this.purchaseRepository.create({
        accountId: userId,
        itemType,
        itemId,
        purchasePrice: item.cost,
        currency: requiredCurrency === 'creds' ? Currency.CREDS : Currency.CRYPTS
      });

      await this.purchaseRepository.save(purchase);

      // Get updated balance
      const newBalance = await this.currencyService.getBalance(userId);

      return { 
        success: true, 
        message: `Successfully purchased ${item.n}!`,
        newBalance
      };

    } catch (error) {
      console.error('Purchase error:', error);
      return { 
        success: false, 
        message: 'Failed to complete purchase. Please try again.' 
      };
    }
  }

  /**
   * Apply decoration to user's account
   */
  async applyDecoration(userId: string, decorationId: string): Promise<{ success: boolean; message: string }> {
    // Check if user owns this decoration
    const ownsDecoration = await this.userOwnsItem(userId, decorationId, ItemType.DECORATION);
    if (!ownsDecoration) {
      return { success: false, message: 'You do not own this decoration' };
    }

    // Verify decoration exists in store
    const storeItemData = this.findItemInStore(decorationId);
    if (!storeItemData) {
      return { success: false, message: 'Decoration not found' };
    }

    try {
      // Update user's decoration
      await this.accountRepository.update(
        { id: userId },
        { decoration: decorationId }
      );

      return { 
        success: true, 
        message: `Successfully applied ${storeItemData.item.n}!` 
      };

    } catch (error) {
      console.error('Apply decoration error:', error);
      return { 
        success: false, 
        message: 'Failed to apply decoration. Please try again.' 
      };
    }
  }

  /**
   * Remove current decoration
   */
  async removeDecoration(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.accountRepository.update(
        { id: userId },
        { decoration: null }
      );

      return { success: true, message: 'Decoration removed successfully' };

    } catch (error) {
      console.error('Remove decoration error:', error);
      return { 
        success: false, 
        message: 'Failed to remove decoration. Please try again.' 
      };
    }
  }

  /**
   * Get decoration file path
   */
  getDecorationPath(decorationId: string): string | null {
    const decorationPath = path.join(__dirname, '../../assets/decorations', `${decorationId}.png`);
    
    if (fs.existsSync(decorationPath)) {
      return decorationPath;
    }
    
    return null;
  }

  /**
   * Get banner file path
   */
  getBannerPath(bannerId: string): string | null {
    // Banner ID already includes .png extension
    const bannerPath = path.join(__dirname, '../../assets/banners', bannerId);
    
    if (fs.existsSync(bannerPath)) {
      return bannerPath;
    }
    
    return null;
  }

  /**
   * Get banner text file path
   */
  getBannerTextPath(bannerTextId: string): string | null {
    // Banner text ID already includes .png extension
    const bannerTextPath = path.join(__dirname, '../../assets/bannertext', bannerTextId);
    
    if (fs.existsSync(bannerTextPath)) {
      return bannerTextPath;
    }
    
    return null;
  }
} 
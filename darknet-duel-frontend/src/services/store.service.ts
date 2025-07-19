import api from './api';

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
  itemType: string;
  itemId: string;
  purchasePrice: number;
  currency: string;
  purchasedAt: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  newBalance?: {
    creds: number;
    crypts: number;
  };
}

export interface DecorationResponse {
  success: boolean;
  message: string;
}

class StoreService {
  /**
   * Get all store data (categories and items)
   */
  async getStoreData(): Promise<StoreCategory[]> {
    try {
      const response = await api.get('/store');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get store data:', error);
      throw new Error(error.response?.data?.message || 'Failed to load store data');
    }
  }

  /**
   * Get user's purchases
   */
  async getUserPurchases(): Promise<UserPurchase[]> {
    try {
      const response = await api.get('/store/purchases');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get user purchases:', error);
      throw new Error(error.response?.data?.message || 'Failed to load purchases');
    }
  }

  /**
   * Purchase an item
   */
  async purchaseItem(itemId: string, itemType: string = 'decoration'): Promise<PurchaseResponse> {
    try {
      const response = await api.post(`/purchase/${itemId}`, { itemType });
      return response.data;
    } catch (error: any) {
      console.error('Failed to purchase item:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to purchase item'
      };
    }
  }

  /**
   * Apply decoration to user account
   */
  async applyDecoration(decorationId: string): Promise<DecorationResponse> {
    try {
      const response = await api.post(`/account/apply/decoration/${decorationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to apply decoration:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to apply decoration'
      };
    }
  }

  /**
   * Remove current decoration
   */
  async removeDecoration(): Promise<DecorationResponse> {
    try {
      const response = await api.post('/account/remove/decoration');
      return response.data;
    } catch (error: any) {
      console.error('Failed to remove decoration:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove decoration'
      };
    }
  }

  /**
   * Get decoration image URL
   */
  getDecorationUrl(decorationId: string): string {
    return `${api.defaults.baseURL}/files/decorations/${decorationId}.png`;
  }

  /**
   * Get banner image URL
   */
  getBannerUrl(bannerId: string): string {
    // Banner IDs already include .png extension
    return `${api.defaults.baseURL}/files/banners/${bannerId}`;
  }

  /**
   * Get banner text image URL
   */
  getBannerTextUrl(bannerTextId: string): string {
    // Banner text IDs already include .png extension
    return `${api.defaults.baseURL}/files/bannertext/${bannerTextId}`;
  }
}

export default new StoreService(); 
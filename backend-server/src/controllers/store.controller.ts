import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
import { ItemType } from '../entities/purchase.entity';
import fs from 'fs';
import path from 'path';

export class StoreController {
  private storeService = new StoreService();

  /**
   * @swagger
   * /api/store:
   *   get:
   *     tags: [Store]
   *     summary: Get store data
   *     description: Retrieves all available store categories and items
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Store data retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  getStore = async (req: Request, res: Response) => {
    try {
      const storeData = await this.storeService.getStoreData();
      
      return res.status(200).json({
        success: true,
        data: storeData
      });
    } catch (error) {
      console.error('Get store error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve store data',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/store/purchases:
   *   get:
   *     tags: [Store]
   *     summary: Get user's purchases
   *     description: Retrieves all items purchased by the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User purchases retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  getUserPurchases = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const purchases = await this.storeService.getUserPurchases(userId);
      
      return res.status(200).json({
        success: true,
        data: purchases
      });
    } catch (error) {
      console.error('Get user purchases error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve purchases',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/purchase/{itemId}:
   *   post:
   *     tags: [Store]
   *     summary: Purchase an item
   *     description: Purchase a decoration or other store item
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the item to purchase
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               itemType:
   *                 type: string
   *                 enum: [decoration]
   *                 default: decoration
   *     responses:
   *       200:
   *         description: Item purchased successfully
   *       400:
   *         description: Bad request (already owned, insufficient funds, etc.)
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Item not found
   *       500:
   *         description: Internal server error
   */
  purchaseItem = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { itemId } = req.params;
      const { itemType = 'decoration' } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required'
        });
      }

      // Convert string to enum
      const itemTypeEnum = itemType === 'decoration' ? ItemType.DECORATION : ItemType.DECORATION;

      const result = await this.storeService.purchaseItem(userId, itemId, itemTypeEnum);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Purchase item error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purchase item',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/account/apply/decoration/{decorationId}:
   *   post:
   *     tags: [Store]
   *     summary: Apply decoration to user account
   *     description: Apply a purchased decoration to the user's account
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: decorationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the decoration to apply
   *     responses:
   *       200:
   *         description: Decoration applied successfully
   *       400:
   *         description: Bad request (decoration not owned, not found, etc.)
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  applyDecoration = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { decorationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!decorationId) {
        return res.status(400).json({
          success: false,
          message: 'Decoration ID is required'
        });
      }

      const result = await this.storeService.applyDecoration(userId, decorationId);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Apply decoration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to apply decoration',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/account/remove/decoration:
   *   post:
   *     tags: [Store]
   *     summary: Remove current decoration
   *     description: Remove the currently applied decoration from user's account
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Decoration removed successfully
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  removeDecoration = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await this.storeService.removeDecoration(userId);
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Remove decoration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove decoration',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };

  /**
   * @swagger
   * /api/files/decorations/{decorationId}.png:
   *   get:
   *     tags: [Files]
   *     summary: Get decoration image file
   *     description: Retrieve decoration image by ID
   *     parameters:
   *       - in: path
   *         name: decorationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The decoration ID
   *     responses:
   *       200:
   *         description: Decoration image retrieved successfully
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Decoration not found
   */
  getDecoration = async (req: Request, res: Response) => {
    try {
      const { decorationId } = req.params;
      
      if (!decorationId) {
        return res.status(400).json({
          success: false,
          message: 'Decoration ID is required'
        });
      }

      const decorationPath = this.storeService.getDecorationPath(decorationId);
      
      if (!decorationPath) {
        return res.status(404).json({
          success: false,
          message: 'Decoration not found'
        });
      }

      const decorationBuffer = fs.readFileSync(decorationPath);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': decorationBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"decoration-${decorationId}"`
      });

      return res.status(200).send(decorationBuffer);
    } catch (error) {
      console.error('Get decoration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve decoration'
      });
    }
  };

  /**
   * @swagger
   * /api/files/banners/{bannerId}.png:
   *   get:
   *     tags: [Files]
   *     summary: Get banner image file
   *     description: Retrieve banner image by ID
   *     parameters:
   *       - in: path
   *         name: bannerId
   *         required: true
   *         schema:
   *           type: string
   *         description: The banner ID
   *     responses:
   *       200:
   *         description: Banner image retrieved successfully
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Banner not found
   */
  getBanner = async (req: Request, res: Response) => {
    try {
      const { bannerId } = req.params;
      
      if (!bannerId) {
        return res.status(400).json({
          success: false,
          message: 'Banner ID is required'
        });
      }

      const bannerPath = this.storeService.getBannerPath(bannerId);
      
      if (!bannerPath) {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }

      const bannerBuffer = fs.readFileSync(bannerPath);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': bannerBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"banner-${bannerId}"`
      });

      return res.status(200).send(bannerBuffer);
    } catch (error) {
      console.error('Get banner error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve banner'
      });
    }
  };

  /**
   * @swagger
   * /api/files/bannertext/{bannerTextId}.png:
   *   get:
   *     tags: [Files]
   *     summary: Get banner text image file
   *     description: Retrieve banner text image by ID
   *     parameters:
   *       - in: path
   *         name: bannerTextId
   *         required: true
   *         schema:
   *           type: string
   *         description: The banner text ID
   *     responses:
   *       200:
   *         description: Banner text image retrieved successfully
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Banner text not found
   */
  getBannerText = async (req: Request, res: Response) => {
    try {
      const { bannerTextId } = req.params;
      
      if (!bannerTextId) {
        return res.status(400).json({
          success: false,
          message: 'Banner text ID is required'
        });
      }

      const bannerTextPath = this.storeService.getBannerTextPath(bannerTextId);
      
      if (!bannerTextPath) {
        return res.status(404).json({
          success: false,
          message: 'Banner text not found'
        });
      }

      const bannerTextBuffer = fs.readFileSync(bannerTextPath);
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': bannerTextBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'ETag': `"bannertext-${bannerTextId}"`
      });

      return res.status(200).send(bannerTextBuffer);
    } catch (error) {
      console.error('Get banner text error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve banner text'
      });
    }
  };
} 
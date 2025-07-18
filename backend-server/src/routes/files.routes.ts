import { Router } from 'express';
import { FilesController } from '../controllers/files.controller';
import { StoreController } from '../controllers/store.controller';

const router = Router();
const filesController = new FilesController();
const storeController = new StoreController();

// GET /api/files/avatar/{uuid} - get avatar image (no auth required for public viewing)
router.get('/avatar/:uuid', filesController.getAvatar);

// GET /api/files/decorations/{decorationId}.png - get decoration image
router.get('/decorations/:decorationId.png', storeController.getDecoration);

// GET /api/files/banners/{bannerId} - get banner image (filename includes extension)
router.get('/banners/:bannerId', storeController.getBanner);

// GET /api/files/bannertext/{bannerTextId} - get banner text image (filename includes extension)
router.get('/bannertext/:bannerTextId', storeController.getBannerText);

export default router; 
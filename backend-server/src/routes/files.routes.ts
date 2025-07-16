import { Router } from 'express';
import { FilesController } from '../controllers/files.controller';

const router = Router();
const filesController = new FilesController();

// GET /api/files/avatar/{uuid} - get avatar image (no auth required for public viewing)
router.get('/avatar/:uuid', filesController.getAvatar);

export default router; 
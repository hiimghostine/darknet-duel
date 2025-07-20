import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';
import path from 'path';
import fs from 'fs';

export class FilesController {
  private accountService = new AccountService();

  /**
   * @swagger
   * /api/files/avatar/{uuid}:
   *   get:
   *     tags: [File Management]
   *     summary: Get user avatar image
   *     description: Retrieves the avatar image file for a user by their UUID. If the user has no custom avatar, returns the default logo.png
   *     parameters:
   *       - in: path
   *         name: uuid
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The UUID of the user whose avatar to retrieve
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     responses:
   *       200:
   *         description: Avatar image retrieved successfully
   *         content:
   *           image/jpeg:
   *             schema:
   *               type: string
   *               format: binary
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *           image/gif:
   *             schema:
   *               type: string
   *               format: binary
   *           image/webp:
   *             schema:
   *               type: string
   *               format: binary
   *       400:
   *         description: Bad request - invalid UUID format
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "Invalid UUID format"
   *       404:
   *         description: User not found or system error (fallback to default logo in most cases)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               success: false
   *               message: "No avatar found for this user"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getAvatar = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;

      // Basic UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuid)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid UUID format'
        });
      }

      const avatarData = await this.accountService.getAvatarById(uuid);

      if (!avatarData) {
        // Serve default logo.png when user has no avatar
        try {
          const logoPath = path.join(__dirname, '../../assets/logo.png');
          const logoBuffer = fs.readFileSync(logoPath);
          
          // Set appropriate headers for default logo
          res.set({
            'Content-Type': 'image/png',
            'Content-Length': logoBuffer.length.toString(),
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'ETag': `"default-logo"` // Static ETag for default logo
          });

          return res.status(200).send(logoBuffer);
        } catch (error) {
          console.error('Error serving default logo:', error);
          return res.status(404).json({
            success: false,
            message: 'No avatar found for this user'
          });
        }
      }

      // Set appropriate headers for user avatar with cache busting
      res.set({
        'Content-Type': avatarData.mimeType,
        'Content-Length': avatarData.avatar.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': `"${Buffer.from(uuid).toString('base64')}-${Date.now()}"` // Dynamic ETag
      });

      // Send the raw image data
      return res.status(200).send(avatarData.avatar);

    } catch (error) {
      console.error('Get avatar error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve avatar',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
} 
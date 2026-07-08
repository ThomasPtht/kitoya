import { Injectable } from '@nestjs/common';
import { removeBackgroundFromImageBase64 } from 'remove.bg';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  async removeBackground(buffer: Buffer): Promise<Buffer> {
    if (!process.env.REMOVE_BG_API_KEY) {
      throw new Error('REMOVE_BG_API_KEY is missing');
    }
    // Detouring the image using the remove.bg API
    try {
      const result = await removeBackgroundFromImageBase64({
        base64img: buffer.toString('base64'),
        apiKey: process.env.REMOVE_BG_API_KEY,
        size: 'auto',
      });
      const detouredBuffer = Buffer.from(result.base64img, 'base64');

      // Transforming the image using sharp to ensure it fits within a 600x600 box while maintaining aspect ratio
      return await sharp(detouredBuffer)
        .resize({
          width: 600,
          height: 600,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Erreur lors du traitement image :', error);
      throw new Error("Le traitement de l'image a échoué. Veuillez réessayer.");
    }
  }
}

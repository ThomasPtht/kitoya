import { Injectable } from '@nestjs/common';
import { removeBackgroundFromImageBase64 } from 'remove.bg';

@Injectable()
export class ImageProcessingService {
  async removeBackground(buffer: Buffer): Promise<Buffer> {
    if (!process.env.REMOVE_BG_API_KEY) {
      throw new Error('REMOVE_BG_API_KEY is missing');
    }

    try {
      const result = await removeBackgroundFromImageBase64({
        base64img: buffer.toString('base64'),
        apiKey: process.env.REMOVE_BG_API_KEY,
        size: 'auto',
      });
      return Buffer.from(result.base64img, 'base64');
    } catch (error) {
      console.error('Erreur détourage IA :', error);
      throw new Error("Échec du détourage de l'image");
    }
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  async removeBackground(buffer: Buffer): Promise<Buffer> {
    if (!process.env.FAPIHUB_API_KEY) {
      throw new Error('FAPIHUB_API_KEY is missing');
    }

    try {
      const formData = new FormData();
      formData.append('image', buffer, { filename: 'image.jpg' });
      formData.append('model', 'falcon');

      const response = await axios.post(
        'https://fapihub.com/v2/rembg/',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            ApiKey: process.env.FAPIHUB_API_KEY,
          },
          responseType: 'arraybuffer',
          validateStatus: () => true, // on gère nous-même le statut
        },
      );

      if (response.status !== 200) {
        if (response.status === 401) {
          throw new Error('Clé API FAPIhub invalide');
        }
        if (response.status === 429) {
          throw new Error('Quota FAPIhub atteint pour ce mois');
        }
        throw new Error(`Erreur API FAPIhub: ${response.status}`);
      }

      const detouredBuffer = Buffer.from(response.data);

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

import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB, room for full-resolution phone photos

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
];

// Multer options shared by every image upload (jerseys, avatar).
// Files are kept in memory, so the size limit also protects the API from memory exhaustion.
// Oversized files are rejected by Multer with a 413 Payload Too Large.
export const imageUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};

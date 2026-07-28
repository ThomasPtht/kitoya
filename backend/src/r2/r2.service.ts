import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
  private s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT ?? '',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });

  async uploadFile(file: Express.Multer.File) {
    const fileName = `${uuidv4()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  }

  async getSignedUrl(publicUrl?: string | null) {
    if (!publicUrl) {
      return null;
    }

    try {
      const url = new URL(publicUrl);
      const key = url.pathname.replace(/^\//, '');

      return await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: 60 * 60 },
      );
    } catch {
      return publicUrl;
    }
  }

  async deleteFile(fileUrlOrKey?: string | null) {
    if (!fileUrlOrKey) {
      return;
    }

    try {
      let key = fileUrlOrKey;

      // If the input is a URL, extract the key from the pathname
      if (
        fileUrlOrKey.startsWith('http://') ||
        fileUrlOrKey.startsWith('https://')
      ) {
        const url = new URL(fileUrlOrKey);
        key = url.pathname.replace(/^\//, '');
      }

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Error deleting file from R2:', error);
    }
  }
}

import { BadRequestException } from '@nestjs/common';
import { imageUploadOptions } from './image-upload.options';

describe('imageUploadOptions', () => {
  const runFilter = (mimetype: string) => {
    const callback = jest.fn();
    imageUploadOptions.fileFilter!({} as any, { mimetype } as any, callback);
    return callback;
  };

  it('should limit uploads to 15 MB', () => {
    expect(imageUploadOptions.limits?.fileSize).toBe(15 * 1024 * 1024);
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/heic'])(
    'should accept %s',
    (mimetype) => {
      expect(runFilter(mimetype)).toHaveBeenCalledWith(null, true);
    },
  );

  it.each(['application/pdf', 'image/svg+xml', 'video/mp4', 'text/html'])(
    'should reject %s with a BadRequestException',
    (mimetype) => {
      const callback = runFilter(mimetype);
      expect(callback.mock.calls[0][0]).toBeInstanceOf(BadRequestException);
      expect(callback.mock.calls[0][1]).toBe(false);
    },
  );
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from './image-processing.service';
import { removeBackgroundFromImageBase64 } from 'remove.bg';
import sharp from 'sharp';

jest.mock('remove.bg');
jest.mock('sharp');

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  const mockRemoveBackground = removeBackgroundFromImageBase64 as jest.Mock;
  const mockSharp = sharp as unknown as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.REMOVE_BG_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
  });

  afterEach(() => {
    delete process.env.REMOVE_BG_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeBackground', () => {
    it('should throw if REMOVE_BG_API_KEY is missing', async () => {
      delete process.env.REMOVE_BG_API_KEY;
      const buffer = Buffer.from('fake-image-data');

      await expect(service.removeBackground(buffer)).rejects.toThrow(
        'REMOVE_BG_API_KEY is missing',
      );

      // Ensure no external calls were attempted
      expect(mockRemoveBackground).not.toHaveBeenCalled();
    });

    it('should call remove.bg with the base64-encoded buffer and the API key', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredBase64 = Buffer.from('detoured-image').toString('base64');

      mockRemoveBackground.mockResolvedValueOnce({
        base64img: detouredBase64,
      });

      const mockToBuffer = jest
        .fn()
        .mockResolvedValueOnce(Buffer.from('processed-image'));
      const mockWebp = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      const mockResize = jest.fn().mockReturnValue({ webp: mockWebp });
      mockSharp.mockReturnValue({ resize: mockResize });

      await service.removeBackground(inputBuffer);

      expect(mockRemoveBackground).toHaveBeenCalledWith({
        base64img: inputBuffer.toString('base64'),
        apiKey: 'test-api-key',
        size: 'auto',
      });
    });

    it('should resize the detoured image to fit in a 600x600 transparent box and convert to webp', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredBase64 = Buffer.from('detoured-image').toString('base64');

      mockRemoveBackground.mockResolvedValueOnce({
        base64img: detouredBase64,
      });

      const finalBuffer = Buffer.from('final-processed-image');
      const mockToBuffer = jest.fn().mockResolvedValueOnce(finalBuffer);
      const mockWebp = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      const mockResize = jest.fn().mockReturnValue({ webp: mockWebp });
      mockSharp.mockReturnValue({ resize: mockResize });

      const result = await service.removeBackground(inputBuffer);

      expect(mockResize).toHaveBeenCalledWith({
        width: 600,
        height: 600,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
      expect(mockWebp).toHaveBeenCalledWith({ quality: 80 });
      expect(result).toBe(finalBuffer);
    });

    it('should throw a generic error if remove.bg fails', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      mockRemoveBackground.mockRejectedValueOnce(
        new Error('remove.bg API error'),
      );

      await expect(service.removeBackground(inputBuffer)).rejects.toThrow(
        "Le traitement de l'image a échoué. Veuillez réessayer.",
      );
    });

    it('should throw a generic error if sharp processing fails', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredBase64 = Buffer.from('detoured-image').toString('base64');

      mockRemoveBackground.mockResolvedValueOnce({
        base64img: detouredBase64,
      });

      mockSharp.mockImplementation(() => {
        throw new Error('sharp processing error');
      });

      await expect(service.removeBackground(inputBuffer)).rejects.toThrow(
        "Le traitement de l'image a échoué. Veuillez réessayer.",
      );
    });
  });
});

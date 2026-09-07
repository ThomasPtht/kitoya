import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingService } from './image-processing.service';
import axios from 'axios';
import sharp from 'sharp';

jest.mock('axios');
jest.mock('sharp');

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const mockSharp = sharp as unknown as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.FAPIHUB_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageProcessingService],
    }).compile();

    service = module.get<ImageProcessingService>(ImageProcessingService);
  });

  afterEach(() => {
    delete process.env.FAPIHUB_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeBackground', () => {
    it('should throw if FAPIHUB_API_KEY is missing', async () => {
      delete process.env.FAPIHUB_API_KEY;
      const buffer = Buffer.from('fake-image-data');

      await expect(service.removeBackground(buffer)).rejects.toThrow(
        'FAPIHUB_API_KEY is missing',
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should call Fapihub via axios with the form data and API key', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredImageBuffer = Buffer.from('detoured-image');

      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: detouredImageBuffer,
      });

      const mockToBuffer = jest
        .fn()
        .mockResolvedValueOnce(Buffer.from('processed-image'));
      const mockWebp = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
      const mockResize = jest.fn().mockReturnValue({ webp: mockWebp });
      mockSharp.mockReturnValue({ resize: mockResize });

      await service.removeBackground(inputBuffer);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      const [url, formData, config] = mockedAxios.post.mock.calls[0];
      expect(url).toBe('https://fapihub.com/v2/rembg/');
      expect(config.headers).toMatchObject({
        ApiKey: 'test-api-key',
      });
    });

    it('should resize the detoured image to fit in a 600x600 transparent box and convert to webp', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredImageBuffer = Buffer.from('detoured-image');

      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: detouredImageBuffer,
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

    it('should throw a generic error if Fapihub returns a non-200 status', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      mockedAxios.post.mockResolvedValueOnce({
        status: 500,
        data: 'Error',
      });

      await expect(service.removeBackground(inputBuffer)).rejects.toThrow(
        "Le traitement de l'image a échoué. Veuillez réessayer.",
      );
    });

    it('should throw a generic error if sharp processing fails', async () => {
      const inputBuffer = Buffer.from('fake-image-data');
      const detouredImageBuffer = Buffer.from('detoured-image');

      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: detouredImageBuffer,
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

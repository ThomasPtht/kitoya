import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FootballService } from './football.service';

jest.mock('axios');

describe('FootballService', () => {
  let service: FootballService;
  let configService: ConfigService;
  const mockAxiosGet = axios.get as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FootballService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FootballService>(FootballService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchTeams', () => {
    it('should return an empty array and log an error if API_FOOTBALL_KEY is missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const result = await service.searchTeams('Real Madrid');

      expect(result).toEqual([]);
      expect(mockAxiosGet).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERREUR : La variable API_FOOTBALL_KEY est undefined !',
      );

      consoleErrorSpy.mockRestore();
    });

    it('should call the API with the correct params and headers, and map the response', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('fake-api-key');

      mockAxiosGet.mockResolvedValueOnce({
        data: {
          response: [
            {
              team: { id: 541, name: 'Real Madrid', logo: 'logo-url-1' },
            },
            {
              team: { id: 529, name: 'Barcelona', logo: 'logo-url-2' },
            },
          ],
        },
      });

      const result = await service.searchTeams('Real Madrid');

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://v3.football.api-sports.io/teams',
        {
          params: { search: 'Real Madrid' },
          headers: {
            'x-apisports-key': 'fake-api-key',
            'x-rapidapi-host': 'v3.football.api-sports.io',
          },
        },
      );

      expect(result).toEqual([
        { id: 541, name: 'Real Madrid', logo: 'logo-url-1' },
        { id: 529, name: 'Barcelona', logo: 'logo-url-2' },
      ]);
    });

    it('should return an empty array if the API response has no "response" field', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('fake-api-key');
      mockAxiosGet.mockResolvedValueOnce({ data: {} });

      const result = await service.searchTeams('Unknown Team');

      expect(result).toEqual([]);
    });

    it('should return an empty array and log the error if the API call fails', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('fake-api-key');
      const apiError = new Error('Network error');
      mockAxiosGet.mockRejectedValueOnce(apiError);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const result = await service.searchTeams('Real Madrid');

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur API Football (Backend):',
        apiError,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

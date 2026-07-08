import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable() 
export class FootballService {
  private readonly baseUrl = 'https://v3.football.api-sports.io';


  constructor(private readonly configService: ConfigService) {}

  async searchTeams(query: string) {
    const apiKey = this.configService.get<string>('API_FOOTBALL_KEY');

    if (!apiKey) {
      console.error("ERREUR : La variable API_FOOTBALL_KEY est undefined !");
    }

    try {
      const response = await axios.get(`${this.baseUrl}/teams`, {
        params: { search: query },
        headers: {
          'x-apisports-key': apiKey, 
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      });

      if (response.data.response) {
        return response.data.response.map((item: any) => ({
          id: item.team.id,
          name: item.team.name,
          logo: item.team.logo,
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur API Football (Backend):', error);
      throw new Error("Impossible de joindre l'API Football");
    }
  }
}
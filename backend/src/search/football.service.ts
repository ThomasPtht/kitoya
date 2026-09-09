import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as countries from 'i18n-iso-countries';
import * as fr from 'i18n-iso-countries/langs/fr.json';
import * as es from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(fr);
countries.registerLocale(es);

@Injectable()
export class FootballService {
  private readonly baseUrl = 'https://v3.football.api-sports.io';

  constructor(private readonly configService: ConfigService) {}

  private translateCountryQuery(query: string): string {
    // Essaie de trouver un code pays à partir du nom en français
    const codeFromFr = countries.getAlpha2Code(query, 'fr');
    if (codeFromFr) {
      return countries.getName(codeFromFr, 'en') || query;
    }

    // Essaie en espagnol aussi
    const codeFromEs = countries.getAlpha2Code(query, 'es');
    if (codeFromEs) {
      return countries.getName(codeFromEs, 'en') || query;
    }

    // Si aucun pays ne correspond, retourne la requête originale (cas des clubs)
    return query;
  }

  async searchTeams(query: string) {
    const apiKey = this.configService.get<string>('API_FOOTBALL_KEY');

    if (!apiKey) {
      console.error('ERREUR : La variable API_FOOTBALL_KEY est undefined !');
      return [];
    }

    const translatedQuery = this.translateCountryQuery(query);
    console.log(
      `DEBUG: Requête originale="${query}" → Traduite="${translatedQuery}"`,
    ); // ← ajoute ce log

    try {
      const response = await axios.get(`${this.baseUrl}/teams`, {
        params: { search: translatedQuery },
        headers: {
          'x-apisports-key': apiKey,
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
      return [];
    }
  }
}

const API_FOOTBALL_KEY = process.env.EXPO_PUBLIC_API_FOOTBALL_KEY;
console.log("Clé API chargée :", API_FOOTBALL_KEY ? "OUI" : "NON");
const BASE_URL = "https://v3.football.api-sports.io";

export const searchTeams = async (query: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/teams?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY || "",
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      },
    );

    const json = await response.json();
    console.log("Réponse API brute :", json);

    if (json.response && Array.isArray(json.response)) {
      return json.response.map((item: any) => ({
        id: item.team.id,
        name: item.team.name,
        country: item.team.country,
        logo: item.team.logo,
      }));
    }
    return [];
  } catch (error) {
    console.error("Erreur API Football:", error);
    return [];
  }
};

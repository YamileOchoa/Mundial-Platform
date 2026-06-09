const TEAM_CODES: Record<string, string> = {
  Argentina: 'ar', Brasil: 'br', Francia: 'fr', Alemania: 'de',
  España: 'es', Portugal: 'pt', Uruguay: 'uy', México: 'mx',
  Colombia: 'co', Chile: 'cl', Peru: 'pe', Ecuador: 'ec',
  'Estados Unidos': 'us', Canada: 'ca', Japón: 'jp', Corea: 'kr',
  Australia: 'au', Marruecos: 'ma', Senegal: 'sn', Ghana: 'gh',
  Inglaterra: 'gb-eng', Croacia: 'hr', Holanda: 'nl', Bélgica: 'be',
  Italia: 'it', Suiza: 'ch', Polonia: 'pl', 'Arabia Saudita': 'sa',
  Irán: 'ir', Qatar: 'qa', Turquía: 'tr', Serbia: 'rs',
};

export function getTeamCode(name: string): string {
  return TEAM_CODES[name] ?? 'un';
}

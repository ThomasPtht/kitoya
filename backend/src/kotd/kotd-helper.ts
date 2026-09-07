export interface JerseyStoryContext {
  clubName: string;
  season: string;
  type: string;
  version: string;
  playerName?: string | null;
}

export type StoryLocale = 'en' | 'fr' | 'es';

// --- ENGLISH ---

const STANDARD_TEMPLATES_EN: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `Putting the spotlight today on a stunning piece straight from ${ctx.clubName}: check out their ${ctx.season} ${ctx.type} shirt, featured here in the ${ctx.version} edition.`,

  (ctx) =>
    `An absolute must-have for any serious collector. Here is the ${ctx.season} ${ctx.clubName} ${ctx.type} in its ${ctx.version} form, proudly shared by the community!`,

  (ctx) =>
    `A design that never gets old. We're heading over to ${ctx.clubName} today to admire this gorgeous ${ctx.season} ${ctx.type} kit (${ctx.version}).`,

  (ctx) =>
    `Shining a light on ${ctx.clubName}'s wardrobe today! Taking a closer look at the ${ctx.version} version of their ${ctx.season} ${ctx.type} jersey.`,

  (ctx) =>
    `Hidden gems straight from the community lockers: we're completely hooked on this ${ctx.season} ${ctx.clubName} ${ctx.type} shirt in the ${ctx.version} finish.`,

  (ctx) =>
    `Some kits just instantly win everyone over: the ${ctx.season} ${ctx.clubName} ${ctx.type} (${ctx.version}) is definitely one of them.`,

  (ctx) =>
    `Taking a trip down to ${ctx.clubName} to check out their ${ctx.season} ${ctx.type} jersey, presented here in a lovely ${ctx.version} build.`,

  (ctx) =>
    `A gorgeous collectible piece takes center stage today! Feast your eyes on the craftsmanship of this ${ctx.season} ${ctx.clubName} ${ctx.type} (${ctx.version}).`,

  (ctx) =>
    `Flipping through today's archive and stumbling upon the ${ctx.season} ${ctx.clubName} ${ctx.type} (${ctx.version}). Such a clean aesthetic.`,

  (ctx) =>
    `Because classic designs always belong in a proper collection, here is a well-deserved spotlight on the ${ctx.season} ${ctx.clubName} ${ctx.type} (${ctx.version}).`,
];

const SPECIAL_TEMPLATES_EN: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `Stepping it up with an exceptional piece: this ${ctx.season} ${ctx.clubName} ${ctx.type} kit comes customized with ${ctx.playerName}'s printing in a stunning ${ctx.version} build.`,

  (ctx) =>
    `Calling all purists! Here is a true rarity: the ${ctx.season} ${ctx.type} from ${ctx.clubName}, built to pro specs and immortalized by ${ctx.playerName}.`,

  (ctx) =>
    `Pure class both on the pitch and in the collection: discover this pro-spec version of the ${ctx.season} ${ctx.type} from ${ctx.clubName}, featuring ${ctx.playerName}.`,

  (ctx) =>
    `When ${ctx.clubName}'s prestige meets professional specifications: focusing today on this ${ctx.season} ${ctx.type} tailored for ${ctx.playerName}.`,

  (ctx) =>
    `You can practically smell the matchday grass on this ${ctx.season} ${ctx.clubName} ${ctx.type}, configured in a player edition with ${ctx.playerName} on the back.`,

  (ctx) =>
    `This is the exact kind of holy grail piece that turns heads in any room: the ${ctx.season} ${ctx.clubName} ${ctx.type} sporting ${ctx.playerName}'s name and number. Heavy duty!`,
];

// --- FRANÇAIS ---

const STANDARD_TEMPLATES_FR: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `Aujourd'hui, on met en lumière une pièce magnifique tout droit venue de ${ctx.clubName} : découvrez leur maillot ${ctx.type} ${ctx.season}, ici en édition ${ctx.version}.`,

  (ctx) =>
    `Un incontournable pour tout collectionneur sérieux. Voici le ${ctx.clubName} ${ctx.season} en version ${ctx.type}, fièrement partagé par la communauté !`,

  (ctx) =>
    `Un design qui ne vieillit jamais. On fait un détour du côté de ${ctx.clubName} aujourd'hui pour admirer ce superbe maillot ${ctx.type} ${ctx.season} (${ctx.version}).`,

  (ctx) =>
    `Coup de projecteur sur le vestiaire de ${ctx.clubName} aujourd'hui ! Focus sur la version ${ctx.version} de leur maillot ${ctx.type} ${ctx.season}.`,

  (ctx) =>
    `Une pépite tout droit sortie des lockers de la communauté : on est complètement sous le charme de ce maillot ${ctx.clubName} ${ctx.type} ${ctx.season} en finition ${ctx.version}.`,

  (ctx) =>
    `Certains maillots font l'unanimité au premier coup d'œil : le ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}) en fait clairement partie.`,

  (ctx) =>
    `Petit détour du côté de ${ctx.clubName} pour découvrir leur maillot ${ctx.type} ${ctx.season}, présenté ici dans une jolie version ${ctx.version}.`,

  (ctx) =>
    `Une magnifique pièce de collection à l'honneur aujourd'hui ! Admirez le travail sur ce ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}).`,

  (ctx) =>
    `En feuilletant l'archive du jour, on tombe sur le ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}). Une esthétique tellement épurée.`,

  (ctx) =>
    `Parce que les classiques ont toujours leur place dans une vraie collection, voici un coup de projecteur bien mérité sur le ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}).`,
];

const SPECIAL_TEMPLATES_FR: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `On monte d'un cran avec une pièce exceptionnelle : ce maillot ${ctx.clubName} ${ctx.type} ${ctx.season} est floqué au nom de ${ctx.playerName}, en superbe version ${ctx.version}.`,

  (ctx) =>
    `Un appel à tous les puristes ! Voici une vraie rareté : le ${ctx.type} ${ctx.season} de ${ctx.clubName}, aux spécifications pro et immortalisé par ${ctx.playerName}.`,

  (ctx) =>
    `De la pure classe, sur le terrain comme dans la collection : découvrez cette version pro du ${ctx.type} ${ctx.season} de ${ctx.clubName}, floqué au nom de ${ctx.playerName}.`,

  (ctx) =>
    `Quand le prestige de ${ctx.clubName} rencontre les spécifications professionnelles : zoom aujourd'hui sur ce ${ctx.type} ${ctx.season} taillé pour ${ctx.playerName}.`,

  (ctx) =>
    `On sent presque l'odeur de la pelouse un soir de match sur ce ${ctx.clubName} ${ctx.type} ${ctx.season}, en version player floquée au nom de ${ctx.playerName}.`,

  (ctx) =>
    `C'est exactement le genre de pièce graal qui fait tourner les têtes : le ${ctx.clubName} ${ctx.type} ${ctx.season} floqué au nom et numéro de ${ctx.playerName}. Du lourd !`,
];

// --- ESPAÑOL ---

const STANDARD_TEMPLATES_ES: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `Hoy destacamos una pieza magnífica directamente del ${ctx.clubName}: descubre su camiseta ${ctx.type} ${ctx.season}, en edición ${ctx.version}.`,

  (ctx) =>
    `Imprescindible para todo coleccionista serio. Aquí tienes el ${ctx.clubName} ${ctx.season} en versión ${ctx.type}, compartido con orgullo por la comunidad!`,

  (ctx) =>
    `Un diseño que nunca envejece. Hoy nos desviamos hacia el ${ctx.clubName} para admirar esta magnífica camiseta ${ctx.type} ${ctx.season} (${ctx.version}).`,

  (ctx) =>
    `Foco en el vestuario del ${ctx.clubName} hoy! Nos centramos en la versión ${ctx.version} de su camiseta ${ctx.type} ${ctx.season}.`,

  (ctx) =>
    `Una joya salida directamente de los casilleros de la comunidad: estamos completamente enamorados de esta camiseta ${ctx.clubName} ${ctx.type} ${ctx.season} en acabado ${ctx.version}.`,

  (ctx) =>
    `Algunas camisetas son unánimes a primera vista: la ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}) es claramente una de ellas.`,

  (ctx) =>
    `Un pequeño desvío hacia el ${ctx.clubName} para descubrir su camiseta ${ctx.type} ${ctx.season}, presentada aquí en una bonita versión ${ctx.version}.`,

  (ctx) =>
    `Una magnífica pieza de colección en el foco de hoy! Admira el trabajo en esta ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}).`,

  (ctx) =>
    `Repasando el archivo del día, encontramos la ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}). Una estética tan depurada.`,

  (ctx) =>
    `Porque los clásicos siempre tienen su lugar en una colección de verdad, aquí un merecido foco sobre la ${ctx.clubName} ${ctx.type} ${ctx.season} (${ctx.version}).`,
];

const SPECIAL_TEMPLATES_ES: Array<(ctx: JerseyStoryContext) => string> = [
  (ctx) =>
    `Subimos de nivel con una pieza excepcional: esta camiseta ${ctx.clubName} ${ctx.type} ${ctx.season} lleva el nombre de ${ctx.playerName}, en magnífica versión ${ctx.version}.`,

  (ctx) =>
    `Un llamado a todos los puristas! Aquí una verdadera rareza: la ${ctx.type} ${ctx.season} del ${ctx.clubName}, con especificaciones profesionales e inmortalizada por ${ctx.playerName}.`,

  (ctx) =>
    `Pura clase, tanto en el campo como en la colección: descubre esta versión profesional de la ${ctx.type} ${ctx.season} del ${ctx.clubName}, con el nombre de ${ctx.playerName}.`,

  (ctx) =>
    `Cuando el prestigio del ${ctx.clubName} se encuentra con las especificaciones profesionales: hoy nos centramos en esta ${ctx.type} ${ctx.season} hecha a medida para ${ctx.playerName}.`,

  (ctx) =>
    `Casi se puede sentir el olor del césped una noche de partido en esta ${ctx.clubName} ${ctx.type} ${ctx.season}, en versión jugador con el nombre de ${ctx.playerName}.`,

  (ctx) =>
    `Es exactamente el tipo de pieza soñada que hace girar cabezas: la ${ctx.clubName} ${ctx.type} ${ctx.season} con el nombre y número de ${ctx.playerName}. ¡Impresionante!`,
];

function isSpecial(jersey: JerseyStoryContext): boolean {
  return (
    Boolean(jersey.playerName && jersey.playerName.trim() !== '') ||
    jersey.version === 'PLAYER_ISSUE' ||
    jersey.version === 'MATCH_WORN'
  );
}

export function generateJerseyStory(
  jersey: JerseyStoryContext,
  locale: StoryLocale = 'en',
): string {
  const special = isSpecial(jersey);

  let templates;
  if (locale === 'fr') {
    templates = special ? SPECIAL_TEMPLATES_FR : STANDARD_TEMPLATES_FR;
  } else if (locale === 'es') {
    templates = special ? SPECIAL_TEMPLATES_ES : STANDARD_TEMPLATES_ES;
  } else {
    templates = special ? SPECIAL_TEMPLATES_EN : STANDARD_TEMPLATES_EN;
  }

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex](jersey);
}

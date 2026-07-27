export interface JerseyStoryContext {
  clubName: string;
  season: string;
  type: string;
  version: string;
  playerName?: string | null;
}

const STANDARD_TEMPLATES: Array<(ctx: JerseyStoryContext) => string> = [
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

const SPECIAL_TEMPLATES: Array<(ctx: JerseyStoryContext) => string> = [
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

export function generateJerseyStory(jersey: JerseyStoryContext): string {
  const isSpecial =
    Boolean(jersey.playerName && jersey.playerName.trim() !== '') ||
    jersey.version === 'PLAYER_ISSUE' ||
    jersey.version === 'MATCH_WORN';

  const templates = isSpecial ? SPECIAL_TEMPLATES : STANDARD_TEMPLATES;
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex](jersey);
}

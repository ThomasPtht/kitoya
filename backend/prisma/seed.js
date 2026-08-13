"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const sports = [
        { name: 'Football' },
    ];
    for (const sport of sports) {
        await prisma.sport.upsert({
            where: { name: sport.name },
            update: {},
            create: sport,
        });
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
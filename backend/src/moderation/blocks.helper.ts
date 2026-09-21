import { PrismaService } from '../prisma/prisma.service';

/**
 * Ids of users whose content must be hidden from `userId`:
 * the ones they blocked and the ones who blocked them.
 */
export async function getHiddenUserIds(
  prisma: PrismaService,
  userId?: string,
): Promise<string[]> {
  if (!userId) return [];

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });

  return blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId));
}

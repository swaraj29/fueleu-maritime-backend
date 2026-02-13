import { PoolRepository } from "@core/ports/PoolRepository";
import { PoolMember } from "@core/domain/entities/Pool";
import { prisma } from "@infrastructure/db/prisma";

export class PrismaPoolRepository
  implements PoolRepository {

  async save(members: PoolMember[]): Promise<void> {

    // Extract year from members (all members should have same year)
    const year = members[0]?.year || new Date().getFullYear();

    const pool = await prisma.pool.create({
      data: {
        year
      }
    });

    for (const member of members) {
      await prisma.poolMember.create({
        data: {
          poolId: pool.id,
          shipId: member.shipId,
          cbBefore: member.cbBefore,
          cbAfter: member.cbAfter || 0
        }
      });
    }
  }
}
import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { prisma } from "@infrastructure/db/prisma";

export class PrismaComplianceRepository
  implements ComplianceRepository {

  async save(
    shipId: string,
    year: number,
    cb: number
  ): Promise<void> {

    await prisma.shipCompliance.upsert({
      where: {
        shipId_year: { shipId, year }
      },
      update: { cbGco2eq: cb },
      create: {
        shipId,
        year,
        cbGco2eq: cb
      }
    });
  }

  async findByShip(
    shipId: string,
    year: number
  ): Promise<number> {

    const record = await prisma.shipCompliance.findUnique({
      where: {
        shipId_year: { shipId, year }
      }
    });

    return record?.cbGco2eq ?? 0;
  }
}
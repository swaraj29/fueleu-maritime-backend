import { BankRepository } from "@core/ports/BankRepository";
import { prisma } from "@infrastructure/db/prisma";

export class PrismaBankRepository
  implements BankRepository {

  async save(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void> {

    await prisma.bankEntry.create({
      data: {
        shipId,
        year,
        amountGco2eq: amount
      }
    });
  }

  async getTotalBanked(
    shipId: string,
    year: number
  ): Promise<number> {

    const records = await prisma.bankEntry.findMany({
      where: { shipId, year }
    });

    return records.reduce(
      (sum: number, r: any) => sum + r.amountGco2eq,
      0
    );
  }

  async deduct(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void> {

    // Negative entry for deduction
    await prisma.bankEntry.create({
      data: {
        shipId,
        year,
        amountGco2eq: -amount
      }
    });
  }
}
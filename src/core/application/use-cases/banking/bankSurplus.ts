import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { BankRepository } from "@core/ports/BankRepository";

export const bankSurplus = async (
  shipId: string,
  year: number,
  complianceRepo: ComplianceRepository,
  bankRepo: BankRepository
) => {
  const cb = await complianceRepo.findByShip(shipId, year);

  if (cb <= 0) {
    throw new Error("Only positive CB can be banked");
  }

  await bankRepo.save(shipId, year, cb);

  return {
    bankedAmount: cb
  };
};
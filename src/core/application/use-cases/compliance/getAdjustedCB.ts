import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { BankRepository } from "@core/ports/BankRepository";

export const getAdjustedCB = async (
  shipId: string,
  year: number,
  complianceRepo: ComplianceRepository,
  bankRepo: BankRepository
) => {
  const cb = await complianceRepo.findByShip(shipId, year);

  const banked = await bankRepo.getTotalBanked(shipId, year);

  return {
    originalCB: cb,
    adjustedCB: cb + banked
  };
};
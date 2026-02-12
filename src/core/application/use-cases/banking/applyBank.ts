import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { BankRepository } from "@core/ports/BankRepository";

export const applyBank = async (
  shipId: string,
  year: number,
  amount: number,
  complianceRepo: ComplianceRepository,
  bankRepo: BankRepository
) => {
  const currentCB = await complianceRepo.findByShip(shipId, year);

  if (currentCB >= 0) {
    throw new Error("No deficit to apply bank");
  }

  const available = await bankRepo.getTotalBanked(shipId, year);

  if (amount > available) {
    throw new Error("Insufficient banked surplus");
  }

  const updatedCB = currentCB + amount;

  await complianceRepo.save(shipId, year, updatedCB);
  await bankRepo.deduct(shipId, year, amount);

  return {
    cb_before: currentCB,
    applied: amount,
    cb_after: updatedCB
  };
};
import { BankRepository } from "@core/ports/BankRepository";

export const getBankRecords = async (
  shipId: string,
  year: number,
  bankRepo: BankRepository
) => {
  const totalBanked = await bankRepo.getTotalBanked(shipId, year);

  return {
    shipId,
    year,
    totalBanked
  };
};

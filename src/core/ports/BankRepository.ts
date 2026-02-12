export interface BankRepository {
  save(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void>;

  getTotalBanked(
    shipId: string,
    year: number
  ): Promise<number>;

  deduct(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void>;
}
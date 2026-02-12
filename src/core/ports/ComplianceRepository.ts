export interface ComplianceRepository {
  save(
    shipId: string,
    year: number,
    cb: number
  ): Promise<void>;

  findByShip(
    shipId: string,
    year: number
  ): Promise<number>;
}
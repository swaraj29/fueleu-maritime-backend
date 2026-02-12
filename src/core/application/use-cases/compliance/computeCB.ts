import { RouteRepository } from "@core/ports/RouteRepository";
import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { computeComplianceBalance } from "@core/domain/services/computeComplianceBalance";

export const computeCB = async (
  shipId: string,
  year: number,
  routeRepo: RouteRepository,
  complianceRepo: ComplianceRepository
) => {
  const route = await routeRepo.findByShipAndYear(shipId, year);

  if (!route) {
    throw new Error("Route not found");
  }

  const cb = computeComplianceBalance(route);

  await complianceRepo.save(shipId, year, cb);

  return cb;
};
import { RouteRepository } from "@core/ports/RouteRepository";
import { computeComparison } from "@core/domain/services/computeComparison";

export const getComparison = async (
  routeRepo: RouteRepository
) => {
  const routes = await routeRepo.findAll();

  const baseline = routes.find(r => r.isBaseline);

  if (!baseline) {
    throw new Error("No baseline route set");
  }

  return routes
    .filter(r => !r.isBaseline)
    .map(route => computeComparison(baseline, route));
};
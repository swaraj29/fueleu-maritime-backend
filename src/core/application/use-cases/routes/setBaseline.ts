import { RouteRepository } from "@core/ports/RouteRepository";

export const setBaseline = async (
  routeId: string,
  routeRepo: RouteRepository
): Promise<void> => {
  await routeRepo.setBaseline(routeId);
};
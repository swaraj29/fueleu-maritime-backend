import { Route } from "@core/domain/entities/Route";
import { RouteRepository } from "@core/ports/RouteRepository";

export const getRoutes = async (
  routeRepo: RouteRepository
): Promise<Route[]> => {
  return routeRepo.findAll();
};
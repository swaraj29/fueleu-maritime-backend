import { Route } from "@core/domain/entities/Route";

export interface RouteRepository {
  findAll(): Promise<Route[]>;

  findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<Route | null>;

  setBaseline(routeId: string): Promise<void>;
}
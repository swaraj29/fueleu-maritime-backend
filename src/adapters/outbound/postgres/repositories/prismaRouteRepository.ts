import { RouteRepository } from "@core/ports/RouteRepository";
import { Route } from "@core/domain/entities/Route";
import { prisma } from "@infrastructure/db/prisma";

export class PrismaRouteRepository implements RouteRepository {

  async findAll(): Promise<Route[]> {
    return prisma.route.findMany();
  }

  async findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<Route | null> {

    return prisma.route.findFirst({
      where: {
        routeId: shipId,
        year
      }
    });
  }

  async setBaseline(routeId: string): Promise<void> {

    // Remove existing baseline
    await prisma.route.updateMany({
      data: { isBaseline: false }
    });

    // Set new baseline for all routes with this routeId
    await prisma.route.updateMany({
      where: { routeId },
      data: { isBaseline: true }
    });
  }
}
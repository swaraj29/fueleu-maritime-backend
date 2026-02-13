import { Request, Response } from "express";
import { PrismaRouteRepository } from "@adapters/outbound/postgres/repositories/prismaRouteRepository";
import { getRoutes } from "@core/application/use-cases/routes/getRoutes";
import { setBaseline } from "@core/application/use-cases/routes/setBaseline";
import { getComparison } from "@core/application/use-cases/routes/getComparison";

const routeRepo = new PrismaRouteRepository();

export const getAllRoutes = async (_: Request, res: Response) => {
  const routes = await getRoutes(routeRepo);
  res.json(routes);
};

export const setRouteBaseline = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Ensure id is a string (req.params can be string | string[])
  const routeId = Array.isArray(id) ? id[0] : id;
  await setBaseline(routeId, routeRepo);
  res.json({ message: "Baseline updated" });
};

export const compareRoutes = async (_: Request, res: Response) => {
  const result = await getComparison(routeRepo);
  res.json(result);
};
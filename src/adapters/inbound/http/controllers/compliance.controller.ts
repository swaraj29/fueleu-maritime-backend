import { Request, Response } from "express";
import { PrismaRouteRepository } from "@adapters/outbound/postgres/repositories/prismaRouteRepository";
import { PrismaComplianceRepository } from "@adapters/outbound/postgres/repositories/prismaComplianceRepository";
import { PrismaBankRepository } from "@adapters/outbound/postgres/repositories/prismaBankRepository";
import { computeCB } from "@core/application/use-cases/compliance/computeCB";
import { getAdjustedCB } from "@core/application/use-cases/compliance/getAdjustedCB";

const routeRepo = new PrismaRouteRepository();
const complianceRepo = new PrismaComplianceRepository();
const bankRepo = new PrismaBankRepository();

export const calculateCB = async (req: Request, res: Response) => {
  const { shipId, year } = req.query;

  const cb = await computeCB(
    String(shipId),
    Number(year),
    routeRepo,
    complianceRepo
  );

  res.json({ cb });
};

export const adjustedCB = async (req: Request, res: Response) => {
  const { shipId, year } = req.query;

  const result = await getAdjustedCB(
    String(shipId),
    Number(year),
    complianceRepo,
    bankRepo
  );

  res.json(result);
};
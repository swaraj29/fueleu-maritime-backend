import { Request, Response } from "express";
import { PrismaComplianceRepository } from "@adapters/outbound/postgres/repositories/prismaComplianceRepository";
import { PrismaBankRepository } from "@adapters/outbound/postgres/repositories/prismaBankRepository";
import { bankSurplus } from "@core/application/use-cases/banking/bankSurplus";
import { applyBank } from "@core/application/use-cases/banking/applyBank";
import { getBankRecords } from "@core/application/use-cases/banking/getBankRecords";

const complianceRepo = new PrismaComplianceRepository();
const bankRepo = new PrismaBankRepository();

export const getRecords = async (req: Request, res: Response) => {
  const { shipId, year } = req.query;

  const result = await getBankRecords(
    String(shipId),
    Number(year),
    bankRepo
  );

  res.json(result);
};

export const bank = async (req: Request, res: Response) => {
  const { shipId, year } = req.body;

  const result = await bankSurplus(
    shipId,
    year,
    complianceRepo,
    bankRepo
  );

  res.json(result);
};

export const apply = async (req: Request, res: Response) => {
  const { shipId, year, amount } = req.body;

  const result = await applyBank(
    shipId,
    year,
    amount,
    complianceRepo,
    bankRepo
  );

  res.json(result);
};
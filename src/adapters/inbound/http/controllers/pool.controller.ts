import { Request, Response } from "express";
import { PrismaPoolRepository } from "@adapters/outbound/postgres/repositories/prismaPoolRepository";
import { createPool } from "@core/application/use-cases/pooling/createPool";

const poolRepo = new PrismaPoolRepository();

export const create = async (req: Request, res: Response) => {
  const { members, year } = req.body;

  // Attach year to each member if provided
  const membersWithYear = members.map((m: any) => ({
    ...m,
    year: year || m.year || new Date().getFullYear()
  }));

  const result = await createPool(membersWithYear, poolRepo);

  res.json(result);
};
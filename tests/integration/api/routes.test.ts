import request from "supertest";
import express, { Express } from "express";
import router from "@adapters/inbound/http/routes";

// Mock repositories
jest.mock("@adapters/outbound/postgres/repositories/prismaRouteRepository");
jest.mock("@adapters/outbound/postgres/repositories/prismaComplianceRepository");
jest.mock("@adapters/outbound/postgres/repositories/prismaBankRepository");
jest.mock("@adapters/outbound/postgres/repositories/prismaPoolRepository");

let app: Express;

describe("API Routes Integration Tests", () => {
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api", router);
  });

  describe("GET /api/routes", () => {
    it("should return all routes", async () => {
      const { PrismaRouteRepository } = require("@adapters/outbound/postgres/repositories/prismaRouteRepository");
      const mockFindAll = jest.fn().mockResolvedValue([
        {
          id: "1",
          routeId: "R001",
          vesselType: "Container",
          fuelType: "HFO",
          year: 2024,
          ghgIntensity: 91.0,
          fuelConsumption: 5000,
          distance: 12000,
          totalEmissions: 4500,
          isBaseline: true
        }
      ]);
      PrismaRouteRepository.prototype.findAll = mockFindAll;

      const response = await request(app).get("/api/routes");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty("routeId");
    });
  });

  describe("POST /api/routes/:id/baseline", () => {
    it("should set route as baseline", async () => {
      const { PrismaRouteRepository } = require("@adapters/outbound/postgres/repositories/prismaRouteRepository");
      const mockSetBaseline = jest.fn().mockResolvedValue(undefined);
      PrismaRouteRepository.prototype.setBaseline = mockSetBaseline;

      const response = await request(app)
        .post("/api/routes/R001/baseline");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for empty route ID", async () => {
      const response = await request(app)
        .post("/api/routes/ /baseline");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/routes/comparison", () => {
    it("should return comparison data", async () => {
      const { PrismaRouteRepository } = require("@adapters/outbound/postgres/repositories/prismaRouteRepository");
      const mockFindAll = jest.fn().mockResolvedValue([
        {
          id: "1",
          routeId: "R001",
          vesselType: "Container",
          fuelType: "HFO",
          year: 2024,
          ghgIntensity: 91.0,
          fuelConsumption: 5000,
          distance: 12000,
          totalEmissions: 4500,
          isBaseline: true
        },
        {
          id: "2",
          routeId: "R002",
          vesselType: "BulkCarrier",
          fuelType: "LNG",
          year: 2024,
          ghgIntensity: 88.0,
          fuelConsumption: 4800,
          distance: 11500,
          totalEmissions: 4200,
          isBaseline: false
        }
      ]);
      PrismaRouteRepository.prototype.findAll = mockFindAll;

      const response = await request(app).get("/api/routes/comparison");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/compliance/cb", () => {
    it("should calculate compliance balance", async () => {
      const { PrismaRouteRepository } = require("@adapters/outbound/postgres/repositories/prismaRouteRepository");
      const { PrismaComplianceRepository } = require("@adapters/outbound/postgres/repositories/prismaComplianceRepository");
      
      const mockFindByShipAndYear = jest.fn().mockResolvedValue({
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      });
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      PrismaRouteRepository.prototype.findByShipAndYear = mockFindByShipAndYear;
      PrismaComplianceRepository.prototype.save = mockSave;

      const response = await request(app)
        .get("/api/compliance/cb")
        .query({ shipId: "R001", year: "2024" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("cb");
      expect(typeof response.body.cb).toBe("number");
    });

    it("should return 400 for missing shipId", async () => {
      const response = await request(app)
        .get("/api/compliance/cb")
        .query({ year: "2024" });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid year format", async () => {
      const response = await request(app)
        .get("/api/compliance/cb")
        .query({ shipId: "R001", year: "24" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/compliance/adjusted-cb", () => {
    it("should return adjusted compliance balance", async () => {
      const { PrismaComplianceRepository } = require("@adapters/outbound/postgres/repositories/prismaComplianceRepository");
      const { PrismaBankRepository } = require("@adapters/outbound/postgres/repositories/prismaBankRepository");
      
      const mockFindByShip = jest.fn().mockResolvedValue(-6817560);
      const mockGetTotalBanked = jest.fn().mockResolvedValue(5000000);
      
      PrismaComplianceRepository.prototype.findByShip = mockFindByShip;
      PrismaBankRepository.prototype.getTotalBanked = mockGetTotalBanked;

      const response = await request(app)
        .get("/api/compliance/adjusted-cb")
        .query({ shipId: "R001", year: "2024" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("originalCB");
      expect(response.body).toHaveProperty("adjustedCB");
    });
  });

  describe("POST /api/banking/bank", () => {
    it("should bank surplus successfully", async () => {
      const { PrismaComplianceRepository } = require("@adapters/outbound/postgres/repositories/prismaComplianceRepository");
      const { PrismaBankRepository } = require("@adapters/outbound/postgres/repositories/prismaBankRepository");
      
      const mockFindByShip = jest.fn().mockResolvedValue(26308224);
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      PrismaComplianceRepository.prototype.findByShip = mockFindByShip;
      PrismaBankRepository.prototype.save = mockSave;

      const response = await request(app)
        .post("/api/banking/bank")
        .send({ shipId: "R002", year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("bankedAmount");
    });

    it("should return 400 for invalid year", async () => {
      const response = await request(app)
        .post("/api/banking/bank")
        .send({ shipId: "R002", year: 2020 });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing shipId", async () => {
      const response = await request(app)
        .post("/api/banking/bank")
        .send({ year: 2024 });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/banking/apply", () => {
    it("should apply banked surplus successfully", async () => {
      const { PrismaComplianceRepository } = require("@adapters/outbound/postgres/repositories/prismaComplianceRepository");
      const { PrismaBankRepository } = require("@adapters/outbound/postgres/repositories/prismaBankRepository");
      
      const mockFindByShip = jest.fn().mockResolvedValue(-6817560);
      const mockGetTotalBanked = jest.fn().mockResolvedValue(10000000);
      const mockSave = jest.fn().mockResolvedValue(undefined);
      const mockDeduct = jest.fn().mockResolvedValue(undefined);
      
      PrismaComplianceRepository.prototype.findByShip = mockFindByShip;
      PrismaComplianceRepository.prototype.save = mockSave;
      PrismaBankRepository.prototype.getTotalBanked = mockGetTotalBanked;
      PrismaBankRepository.prototype.deduct = mockDeduct;

      const response = await request(app)
        .post("/api/banking/apply")
        .send({ shipId: "R001", year: 2024, amount: 5000000 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("cb_before");
      expect(response.body).toHaveProperty("applied");
      expect(response.body).toHaveProperty("cb_after");
    });

    it("should return 400 for negative amount", async () => {
      const response = await request(app)
        .post("/api/banking/apply")
        .send({ shipId: "R001", year: 2024, amount: -1000 });

      expect(response.status).toBe(400);
    });

    it("should return 400 for zero amount", async () => {
      const response = await request(app)
        .post("/api/banking/apply")
        .send({ shipId: "R001", year: 2024, amount: 0 });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/banking/records", () => {
    it("should return banking records", async () => {
      const { PrismaBankRepository } = require("@adapters/outbound/postgres/repositories/prismaBankRepository");
      
      const mockGetTotalBanked = jest.fn().mockResolvedValue(15000000);
      PrismaBankRepository.prototype.getTotalBanked = mockGetTotalBanked;

      const response = await request(app)
        .get("/api/banking/records")
        .query({ shipId: "R002", year: "2024" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("shipId");
      expect(response.body).toHaveProperty("year");
      expect(response.body).toHaveProperty("totalBanked");
    });
  });

  describe("POST /api/pools", () => {
    it("should create pool successfully", async () => {
      const { PrismaPoolRepository } = require("@adapters/outbound/postgres/repositories/prismaPoolRepository");
      
      const mockSave = jest.fn().mockResolvedValue(undefined);
      PrismaPoolRepository.prototype.save = mockSave;

      const response = await request(app)
        .post("/api/pools")
        .send({
          members: [
            { shipId: "S001", cbBefore: 26308224 },
            { shipId: "S002", cbBefore: -6817560 }
          ],
          year: 2024
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it("should return 400 for pool with less than 2 members", async () => {
      const response = await request(app)
        .post("/api/pools")
        .send({
          members: [{ shipId: "S001", cbBefore: 10000 }],
          year: 2024
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing cbBefore", async () => {
      const response = await request(app)
        .post("/api/pools")
        .send({
          members: [
            { shipId: "S001" },
            { shipId: "S002", cbBefore: -6817560 }
          ],
          year: 2024
        });

      expect(response.status).toBe(400);
    });
  });
});

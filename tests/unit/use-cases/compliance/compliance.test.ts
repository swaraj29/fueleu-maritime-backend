import { computeCB } from "@core/application/use-cases/compliance/computeCB";
import { getAdjustedCB } from "@core/application/use-cases/compliance/getAdjustedCB";
import { RouteRepository } from "@core/ports/RouteRepository";
import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { BankRepository } from "@core/ports/BankRepository";
import { Route } from "@core/domain/entities/Route";

const mockRouteRepo: RouteRepository = {
  findAll: jest.fn(),
  findByShipAndYear: jest.fn(),
  setBaseline: jest.fn()
};

const mockComplianceRepo: ComplianceRepository = {
  save: jest.fn(),
  findByShip: jest.fn()
};

const mockBankRepo: BankRepository = {
  save: jest.fn(),
  getTotalBanked: jest.fn(),
  deduct: jest.fn()
};

describe("Compliance use cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("computeCB", () => {
    const mockRoute: Route = {
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
    };

    it("should compute and save CB for a route", async () => {
      (mockRouteRepo.findByShipAndYear as jest.Mock).mockResolvedValue(mockRoute);

      const cb = await computeCB("R001", 2024, mockRouteRepo, mockComplianceRepo);

      expect(cb).toBe(-340956000);
      expect(mockRouteRepo.findByShipAndYear).toHaveBeenCalledWith("R001", 2024);
      expect(mockComplianceRepo.save).toHaveBeenCalledWith("R001", 2024, -340956000);
    });

    it("should throw error when route not found", async () => {
      (mockRouteRepo.findByShipAndYear as jest.Mock).mockResolvedValue(null);

      await expect(
        computeCB("INVALID", 2024, mockRouteRepo, mockComplianceRepo)
      ).rejects.toThrow("Route not found");
    });

    it("should handle compliant route (positive CB)", async () => {
      const compliantRoute: Route = {
        ...mockRoute,
        ghgIntensity: 88.0
      };
      (mockRouteRepo.findByShipAndYear as jest.Mock).mockResolvedValue(compliantRoute);

      const cb = await computeCB("R002", 2024, mockRouteRepo, mockComplianceRepo);

      expect(cb).toBeGreaterThan(0);
      expect(mockComplianceRepo.save).toHaveBeenCalledWith("R002", 2024, cb);
    });
  });

  describe("getAdjustedCB", () => {
    it("should return original and adjusted CB without banking", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-6817560);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(0);

      const result = await getAdjustedCB("R001", 2024, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({
        originalCB: -6817560,
        adjustedCB: -6817560
      });
    });

    it("should calculate adjusted CB with banked surplus", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-6817560);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(5000000);

      const result = await getAdjustedCB("R001", 2024, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({
        originalCB: -6817560,
        adjustedCB: -1817560
      });
    });

    it("should handle positive CB with banking", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(10000000);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(5000000);

      const result = await getAdjustedCB("R002", 2024, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({
        originalCB: 10000000,
        adjustedCB: 15000000
      });
    });

    it("should handle zero CB", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(0);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(0);

      const result = await getAdjustedCB("R003", 2024, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({
        originalCB: 0,
        adjustedCB: 0
      });
    });
  });
});

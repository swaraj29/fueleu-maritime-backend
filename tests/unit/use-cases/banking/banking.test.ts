import { bankSurplus } from "@core/application/use-cases/banking/bankSurplus";
import { applyBank } from "@core/application/use-cases/banking/applyBank";
import { getBankRecords } from "@core/application/use-cases/banking/getBankRecords";
import { ComplianceRepository } from "@core/ports/ComplianceRepository";
import { BankRepository } from "@core/ports/BankRepository";

const mockComplianceRepo: ComplianceRepository = {
  save: jest.fn(),
  findByShip: jest.fn()
};

const mockBankRepo: BankRepository = {
  save: jest.fn(),
  getTotalBanked: jest.fn(),
  deduct: jest.fn()
};

describe("Banking use cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("bankSurplus", () => {
    it("should bank positive CB surplus", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(26308224);

      const result = await bankSurplus("R002", 2024, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({ bankedAmount: 26308224 });
      expect(mockBankRepo.save).toHaveBeenCalledWith("R002", 2024, 26308224);
    });

    it("should throw error for zero CB", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(0);

      await expect(
        bankSurplus("R001", 2024, mockComplianceRepo, mockBankRepo)
      ).rejects.toThrow("Only positive CB can be banked");
    });

    it("should throw error for negative CB", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-6817560);

      await expect(
        bankSurplus("R001", 2024, mockComplianceRepo, mockBankRepo)
      ).rejects.toThrow("Only positive CB can be banked");
    });

    it("should handle large surplus values", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(100000000);

      const result = await bankSurplus("R003", 2024, mockComplianceRepo, mockBankRepo);

      expect(result.bankedAmount).toBe(100000000);
      expect(mockBankRepo.save).toHaveBeenCalledWith("R003", 2024, 100000000);
    });
  });

  describe("applyBank", () => {
    it("should apply banked surplus to deficit", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-6817560);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(10000000);

      const result = await applyBank("R001", 2024, 5000000, mockComplianceRepo, mockBankRepo);

      expect(result).toEqual({
        cb_before: -6817560,
        applied: 5000000,
        cb_after: -1817560
      });
      expect(mockComplianceRepo.save).toHaveBeenCalledWith("R001", 2024, -1817560);
      expect(mockBankRepo.deduct).toHaveBeenCalledWith("R001", 2024, 5000000);
    });

    it("should throw error if no deficit exists", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(10000);

      await expect(
        applyBank("R002", 2024, 5000, mockComplianceRepo, mockBankRepo)
      ).rejects.toThrow("No deficit to apply bank");
    });

    it("should throw error if insufficient banked surplus", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-10000000);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(5000000);

      await expect(
        applyBank("R001", 2024, 8000000, mockComplianceRepo, mockBankRepo)
      ).rejects.toThrow("Insufficient banked surplus");
    });

    it("should allow applying exact available amount", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-10000000);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(5000000);

      const result = await applyBank("R001", 2024, 5000000, mockComplianceRepo, mockBankRepo);

      expect(result.cb_after).toBe(-5000000);
    });

    it("should allow applying amount that brings CB to zero", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-5000000);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(10000000);

      const result = await applyBank("R001", 2024, 5000000, mockComplianceRepo, mockBankRepo);

      expect(result.cb_after).toBe(0);
    });

    it("should allow applying amount that brings CB to surplus", async () => {
      (mockComplianceRepo.findByShip as jest.Mock).mockResolvedValue(-3000000);
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(10000000);

      const result = await applyBank("R001", 2024, 5000000, mockComplianceRepo, mockBankRepo);

      expect(result.cb_after).toBe(2000000);
    });
  });

  describe("getBankRecords", () => {
    it("should return bank records for a ship", async () => {
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(15000000);

      const result = await getBankRecords("R002", 2024, mockBankRepo);

      expect(result).toEqual({
        shipId: "R002",
        year: 2024,
        totalBanked: 15000000
      });
      expect(mockBankRepo.getTotalBanked).toHaveBeenCalledWith("R002", 2024);
    });

    it("should return zero for ship with no banking", async () => {
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(0);

      const result = await getBankRecords("R001", 2024, mockBankRepo);

      expect(result.totalBanked).toBe(0);
    });

    it("should handle different years correctly", async () => {
      (mockBankRepo.getTotalBanked as jest.Mock).mockResolvedValue(5000000);

      const result2024 = await getBankRecords("R002", 2024, mockBankRepo);
      const result2025 = await getBankRecords("R002", 2025, mockBankRepo);

      expect(mockBankRepo.getTotalBanked).toHaveBeenCalledWith("R002", 2024);
      expect(mockBankRepo.getTotalBanked).toHaveBeenCalledWith("R002", 2025);
    });
  });
});

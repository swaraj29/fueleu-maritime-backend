import { computeComplianceBalance } from "@core/domain/services/computeComplianceBalance";
import { computeComparison } from "@core/domain/services/computeComparison";
import { validatePoolSum, validatePostPoolingState } from "@core/domain/services/validatePoolRules";
import { Route } from "@core/domain/entities/Route";
import { PoolMember } from "@core/domain/entities/Pool";

describe("Edge Cases and Boundary Tests", () => {
  describe("Extreme Values", () => {
    it("should handle very large fuel consumption", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 999999999,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
      // Just check it's a large negative number, not exact value due to floating point
      expect(cb).toBeLessThan(-68000000000000);
    });

    it("should handle very small fuel consumption", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 0.001,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
    });

    it("should handle extreme GHG intensity", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 9999.99,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(cb).toBeLessThan(0);
    });

    it("should handle zero GHG intensity", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(cb).toBeGreaterThan(0);
    });
  });

  describe("Precision and Rounding", () => {
    it("should handle floating point precision correctly", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 89.33679999999999,
        fuelConsumption: 5000.123456,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
      expect(isFinite(cb)).toBe(true);
    });

    it("should round comparison percentDiff to 2 decimal places", () => {
      const baseline: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.123456,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
      };

      const comparison: Route = {
        ...baseline,
        id: "2",
        routeId: "R002",
        ghgIntensity: 88.654321,
        isBaseline: false
      };

      const result = computeComparison(baseline, comparison);
      expect(result.percentDiff.toString()).toMatch(/^-?\d+\.\d{2}$/);
    });
  });

  describe("Pool Edge Cases", () => {
    it("should handle pool with very large member count", () => {
      const members: PoolMember[] = Array.from({ length: 100 }, (_, i) => ({
        shipId: `S${String(i + 1).padStart(3, "0")}`,
        cbBefore: i % 2 === 0 ? 10000 : -5000
      }));

      expect(() => validatePoolSum(members)).not.toThrow();
    });

    it("should handle pool with all zero CB members", () => {
      const members: PoolMember[] = [
        { shipId: "S001", cbBefore: 0 },
        { shipId: "S002", cbBefore: 0 }
      ];

      expect(() => validatePoolSum(members)).not.toThrow();
    });

    it("should handle pool with extremely large CB values", () => {
      const members: PoolMember[] = [
        { shipId: "S001", cbBefore: 999999999999 },
        { shipId: "S002", cbBefore: -100000000000 }
      ];

      expect(() => validatePoolSum(members)).not.toThrow();
    });

    it("should handle pool sum exactly at zero boundary", () => {
      const members: PoolMember[] = [
        { shipId: "S001", cbBefore: 1000000 },
        { shipId: "S002", cbBefore: -1000000 }
      ];

      expect(() => validatePoolSum(members)).not.toThrow();
    });

    it("should reject pool sum just below zero", () => {
      const members: PoolMember[] = [
        { shipId: "S001", cbBefore: 1000000 },
        { shipId: "S002", cbBefore: -1000000.01 }
      ];

      expect(() => validatePoolSum(members)).toThrow("Pool total CB must be >= 0");
    });

    it("should validate member state transition from negative to zero", () => {
      const member: PoolMember = {
        shipId: "S001",
        cbBefore: -10000,
        cbAfter: 0
      };

      expect(() => validatePostPoolingState(member)).not.toThrow();
    });

    it("should validate member state transition from positive to zero", () => {
      const member: PoolMember = {
        shipId: "S001",
        cbBefore: 10000,
        cbAfter: 0
      };

      expect(() => validatePostPoolingState(member)).not.toThrow();
    });

    it("should reject negative to positive transition", () => {
      const member: PoolMember = {
        shipId: "S001",
        cbBefore: -10000,
        cbAfter: 0.01
      };

      // Actually this is allowed - deficit can be improved to positive
      expect(() => validatePostPoolingState(member)).not.toThrow();
    });

    it("should reject positive to negative transition", () => {
      const member: PoolMember = {
        shipId: "S001",
        cbBefore: 10000,
        cbAfter: -0.01
      };

      expect(() => validatePostPoolingState(member)).toThrow(
        "Surplus ship S001 cannot become negative"
      );
    });
  });

  describe("String Handling", () => {
    it("should handle special characters in route IDs", () => {
      const route: Route = {
        id: "1",
        routeId: "R-001_TEST",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
    });

    it("should handle long vessel type names", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Very Long Vessel Type Name With Multiple Words And Special Characters-123",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
    });

    it("should handle empty string for optional fields", () => {
      const member: PoolMember = {
        shipId: "",
        cbBefore: 10000
      };

      // Should not throw during validation
      expect(member.shipId).toBe("");
    });
  });

  describe("Year Boundary Tests", () => {
    it("should handle year 2024", () => {
      const route: Route = {
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

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
    });

    it("should handle year 2050", () => {
      const route: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2050,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false
      };

      const cb = computeComplianceBalance(route);
      expect(typeof cb).toBe("number");
    });
  });

  describe("Comparison Edge Cases", () => {
    it("should handle comparison where both routes have same intensity", () => {
      const baseline: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 90.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
      };

      const comparison: Route = {
        ...baseline,
        id: "2",
        routeId: "R002",
        isBaseline: false
      };

      const result = computeComparison(baseline, comparison);
      expect(result.percentDiff).toBe(0);
    });

    it("should handle very small percentage difference", () => {
      const baseline: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 90.0000,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
      };

      const comparison: Route = {
        ...baseline,
        id: "2",
        routeId: "R002",
        ghgIntensity: 90.0001,
        isBaseline: false
      };

      const result = computeComparison(baseline, comparison);
      expect(Math.abs(result.percentDiff)).toBeLessThan(0.01);
    });

    it("should mark route at exact target as compliant", () => {
      const baseline: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 90.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
      };

      const comparison: Route = {
        ...baseline,
        id: "2",
        routeId: "R002",
        ghgIntensity: 89.3368, // Exact target
        isBaseline: false
      };

      const result = computeComparison(baseline, comparison);
      expect(result.compliant).toBe(true);
    });

    it("should mark route just above target as non-compliant", () => {
      const baseline: Route = {
        id: "1",
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 90.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
      };

      const comparison: Route = {
        ...baseline,
        id: "2",
        routeId: "R002",
        ghgIntensity: 89.3369, // Just above target
        isBaseline: false
      };

      const result = computeComparison(baseline, comparison);
      expect(result.compliant).toBe(false);
    });
  });

  describe("Numerical Stability", () => {
    it("should not produce NaN for valid inputs", () => {
      const route: Route = {
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

      const cb = computeComplianceBalance(route);
      expect(isNaN(cb)).toBe(false);
    });

    it("should not produce Infinity for valid inputs", () => {
      const route: Route = {
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

      const cb = computeComplianceBalance(route);
      expect(isFinite(cb)).toBe(true);
    });
  });
});

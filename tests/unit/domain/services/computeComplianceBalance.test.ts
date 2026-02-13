import { computeComplianceBalance } from "@core/domain/services/computeComplianceBalance";
import { Route } from "@core/domain/entities/Route";

describe("computeComplianceBalance", () => {
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

  it("should calculate negative CB for non-compliant route (intensity > target)", () => {
    const cb = computeComplianceBalance(mockRoute);
    // CB = (89.3368 - 91.0) * (5000 * 41000) = -340,956,000
    expect(cb).toBe(-340956000);
  });

  it("should calculate positive CB for compliant route (intensity < target)", () => {
    const compliantRoute: Route = {
      ...mockRoute,
      ghgIntensity: 88.0
    };
    const cb = computeComplianceBalance(compliantRoute);
    // CB = (89.3368 - 88.0) * (5000 * 41000) = 274,044,000
    expect(cb).toBe(274044000);
  });

  it("should calculate zero CB when intensity equals target", () => {
    const exactRoute: Route = {
      ...mockRoute,
      ghgIntensity: 89.3368
    };
    const cb = computeComplianceBalance(exactRoute);
    expect(cb).toBe(0);
  });

  it("should throw error for zero fuel consumption", () => {
    const invalidRoute: Route = {
      ...mockRoute,
      fuelConsumption: 0
    };
    expect(() => computeComplianceBalance(invalidRoute)).toThrow(
      "Fuel consumption must be greater than 0"
    );
  });

  it("should throw error for negative fuel consumption", () => {
    const invalidRoute: Route = {
      ...mockRoute,
      fuelConsumption: -100
    };
    expect(() => computeComplianceBalance(invalidRoute)).toThrow(
      "Fuel consumption must be greater than 0"
    );
  });

  it("should handle high intensity values correctly", () => {
    const highIntensityRoute: Route = {
      ...mockRoute,
      ghgIntensity: 150.0
    };
    const cb = computeComplianceBalance(highIntensityRoute);
    // CB = (89.3368 - 150.0) * (5000 * 41000) = -12,435,956,000
    expect(cb).toBe(-12435956000);
  });

  it("should handle low intensity values correctly", () => {
    const lowIntensityRoute: Route = {
      ...mockRoute,
      ghgIntensity: 50.0
    };
    const cb = computeComplianceBalance(lowIntensityRoute);
    // CB = (89.3368 - 50.0) * (5000 * 41000) = 8,064,044,000
    expect(cb).toBe(8064044000);
  });

  it("should round to 2 decimal places", () => {
    const route: Route = {
      ...mockRoute,
      ghgIntensity: 89.3367,
      fuelConsumption: 3
    };
    const cb = computeComplianceBalance(route);
    // Should be rounded properly
    expect(cb.toString()).toMatch(/^-?\d+(\.\d{1,2})?$/);
  });
});

import { computeComparison } from "@core/domain/services/computeComparison";
import { Route } from "@core/domain/entities/Route";

describe("computeComparison", () => {
  const baseline: Route = {
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
  };

  const comparison: Route = {
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
  };

  it("should compute comparison with negative percent diff for better performance", () => {
    const result = computeComparison(baseline, comparison);
    
    expect(result).toEqual({
      baselineRouteId: "R001",
      comparisonRouteId: "R002",
      baselineIntensity: 91.0,
      comparisonIntensity: 88.0,
      percentDiff: -3.3,
      compliant: true
    });
  });

  it("should compute comparison with positive percent diff for worse performance", () => {
    const worseRoute: Route = {
      ...comparison,
      routeId: "R003",
      ghgIntensity: 93.5
    };
    
    const result = computeComparison(baseline, worseRoute);
    
    expect(result.percentDiff).toBe(2.75);
    expect(result.compliant).toBe(false);
  });

  it("should mark route as compliant when intensity <= target (89.3368)", () => {
    const compliantRoute: Route = {
      ...comparison,
      ghgIntensity: 89.0
    };
    
    const result = computeComparison(baseline, compliantRoute);
    expect(result.compliant).toBe(true);
  });

  it("should mark route as non-compliant when intensity > target", () => {
    const nonCompliantRoute: Route = {
      ...comparison,
      ghgIntensity: 92.0
    };
    
    const result = computeComparison(baseline, nonCompliantRoute);
    expect(result.compliant).toBe(false);
  });

  it("should throw error if baseline route is not marked as baseline", () => {
    const notBaseline: Route = {
      ...baseline,
      isBaseline: false
    };
    
    expect(() => computeComparison(notBaseline, comparison)).toThrow(
      "Provided baseline route is not marked as baseline"
    );
  });

  it("should throw error if baseline intensity is zero", () => {
    const zeroIntensity: Route = {
      ...baseline,
      ghgIntensity: 0
    };
    
    expect(() => computeComparison(zeroIntensity, comparison)).toThrow(
      "Invalid baseline intensity"
    );
  });

  it("should throw error if baseline intensity is negative", () => {
    const negativeIntensity: Route = {
      ...baseline,
      ghgIntensity: -10
    };
    
    expect(() => computeComparison(negativeIntensity, comparison)).toThrow(
      "Invalid baseline intensity"
    );
  });

  it("should calculate 0% difference for identical intensities", () => {
    const identicalRoute: Route = {
      ...comparison,
      ghgIntensity: 91.0
    };
    
    const result = computeComparison(baseline, identicalRoute);
    expect(result.percentDiff).toBe(0);
  });

  it("should handle very small differences correctly", () => {
    const slightlyBetterRoute: Route = {
      ...comparison,
      ghgIntensity: 90.99
    };
    
    const result = computeComparison(baseline, slightlyBetterRoute);
    // (90.99 / 91.0 - 1) * 100 = -0.01
    expect(result.percentDiff).toBe(-0.01);
  });
});

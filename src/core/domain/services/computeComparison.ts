import { Route } from "@core/domain/entities/Route";
import { TARGET_INTENSITY } from "@shared/constants/fuel.constants";

export const computeComparison = (
  baseline: Route,
  comparison: Route
) => {

  if (!baseline.isBaseline) {
    throw new Error("Provided baseline route is not marked as baseline");
  }

  if (baseline.ghgIntensity <= 0) {
    throw new Error("Invalid baseline intensity");
  }

  const percentDiff =
    ((comparison.ghgIntensity / baseline.ghgIntensity) - 1) * 100;

  return {
    baselineRouteId: baseline.routeId,
    comparisonRouteId: comparison.routeId,
    baselineIntensity: baseline.ghgIntensity,
    comparisonIntensity: comparison.ghgIntensity,
    percentDiff: Number(percentDiff.toFixed(2)),
    compliant: comparison.ghgIntensity <= TARGET_INTENSITY
  };
};
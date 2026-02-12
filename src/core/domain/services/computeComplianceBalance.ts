import { Route } from "@core/domain/entities/route";
import { TARGET_INTENSITY } from "@shared/constants/fuel.constants";
import { ENERGY_FACTOR } from "@shared/constants/energy.constants";

export const computeComplianceBalance = (
  route: Route
): number => {

  if (route.fuelConsumption <= 0) {
    throw new Error("Fuel consumption must be greater than 0");
  }

  const energy = route.fuelConsumption * ENERGY_FACTOR;

  const cb = (TARGET_INTENSITY - route.ghgIntensity) * energy;

  return Number(cb.toFixed(2));
};
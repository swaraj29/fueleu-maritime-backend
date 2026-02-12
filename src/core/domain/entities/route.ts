export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;       // gCO2e/MJ
  fuelConsumption: number;    // tons
  distance: number;           // km
  totalEmissions: number;     // tons
  isBaseline: boolean;
}
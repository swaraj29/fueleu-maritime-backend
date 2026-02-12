export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number; // Compliance Balance
}
// types.ts (or anywhere you prefer)
export interface CarbonFormData {
    businessName: string;
    address: string;
    industryType: string;
    energyConsumption: number | string; // Use string if it can be empty
    renewableEnergyUsage: number | string; // Use string if it can be empty
    distanceTraveled: number | string; // Use string if it can be empty
    fuelType: string;
    fuelConsumption: number | string; // Use string if it can be empty
    totalWasteProduced: number | string; // Use string if it can be empty
    wasteRecycled: number | string; // Use string if it can be empty
}

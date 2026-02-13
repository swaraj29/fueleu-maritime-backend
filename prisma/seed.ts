import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prisma 7 requires a driver adapter for database connections
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing routes (optional - uncomment if you want to reset)
  // await prisma.route.deleteMany({});
  // console.log("🧹 Cleared existing routes");

  // Seed 5 routes as per assignment requirements
  const routes = [
    {
      routeId: "R001",
      vesselType: "Container",
      fuelType: "HFO",
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 4500,
      isBaseline: true // Set first route as baseline
    },
    {
      routeId: "R002",
      vesselType: "BulkCarrier",
      fuelType: "LNG",
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false
    },
    {
      routeId: "R003",
      vesselType: "Tanker",
      fuelType: "MGO",
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false
    },
    {
      routeId: "R004",
      vesselType: "RoRo",
      fuelType: "HFO",
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      totalEmissions: 4300,
      isBaseline: false
    },
    {
      routeId: "R005",
      vesselType: "Container",
      fuelType: "LNG",
      year: 2025,
      ghgIntensity: 90.5,
      fuelConsumption: 4950,
      distance: 11900,
      totalEmissions: 4400,
      isBaseline: false
    }
  ];

  // Insert routes using createMany with skipDuplicates
  try {
    const result = await prisma.route.createMany({
      data: routes,
      skipDuplicates: true
    });
    console.log(`✅ Created ${result.count} new routes`);
  } catch (error) {
    console.log("ℹ️  Routes may already exist, updating individually...");
    
    // If createMany fails, update each route individually
    for (const route of routes) {
      try {
        await prisma.route.create({
          data: route
        });
        console.log(`✅ Created route: ${route.routeId} (${route.year})`);
      } catch (err) {
        // Route already exists, update it
        await prisma.route.updateMany({
          where: {
            routeId: route.routeId,
            year: route.year
          },
          data: route
        });
        console.log(`🔄 Updated route: ${route.routeId} (${route.year})`);
      }
    }
  }

  console.log("✨ Seeding completed successfully!");
  console.log(`📊 Total routes: ${routes.length}`);
  console.log(`🎯 Baseline route: R001 (Container, HFO, 2024)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });

# FuelEU Maritime Compliance Backend

A REST API for managing maritime vessel compliance with the FuelEU regulation, supporting route tracking, compliance balance calculations, surplus banking, and pooling mechanisms.

## What is FuelEU Maritime?

FuelEU Maritime is an EU regulation that sets greenhouse gas (GHG) intensity limits for ships operating in European waters. Ships must meet a target GHG intensity (89.3368 gCO₂eq/MJ for 2025), and if they exceed it, they face a compliance deficit. This system includes:
- **Banking**: Ships with surplus compliance (better than target) can save it for future years
- **Pooling**: Multiple ships can pool their compliance balances to offset deficits
- **Penalties**: Non-compliant ships face financial penalties

This backend provides the infrastructure to track routes, calculate compliance, and manage banking/pooling operations.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express 5.2.1
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 7.4.0 (with pg adapter)
- **Validation**: Zod 4.3.6
- **Testing**: Jest + ts-jest
- **Architecture**: Hexagonal (Ports & Adapters)

## Architecture

This project follows **Hexagonal Architecture** to keep business logic independent from external dependencies:

```
src/
├── core/                          # Business logic (pure)
│   ├── domain/                    # Entities, types, domain services
│   │   ├── entities/              # Route, Pool, BankEntry, etc.
│   │   └── services/              # Compliance calculations, validations
│   ├── application/               # Use cases (orchestration)
│   │   ├── use-cases/
│   │   │   ├── routes/
│   │   │   ├── compliance/
│   │   │   ├── banking/
│   │   │   └── pooling/
│   └── ports/                     # Interfaces (contracts)
│       ├── RouteRepository.ts
│       ├── ComplianceRepository.ts
│       ├── BankRepository.ts
│       └── PoolRepository.ts
├── adapters/                      # External world adapters
│   ├── inbound/                   # HTTP controllers
│   │   └── http/
│   │       ├── routes.ts          # Express routes
│   │       └── controllers/
│   └── outbound/                  # Database implementations
│       └── postgres/
│           └── repositories/      # Prisma repositories
└── infrastructure/                # Framework setup
    ├── db/                        # Prisma client
    └── server/                    # Express app
```

### Why Hexagonal?

- ✅ Business logic doesn't know about Express or Prisma
- ✅ Easy to test (mock repositories)
- ✅ Can swap database or web framework without touching core logic
- ✅ Clear separation of concerns

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 15+ running locally
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/swaraj29/fueleu-maritime-backend.git
cd fueleu-maritime-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

## Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://postgres:1234@localhost:5432/fueleu_maritime"

# Server
PORT=3000

# CORS (optional)
CORS_ORIGIN="*"
```

## Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed initial data (5 sample routes)
npm run db:seed
```

This creates 5 routes in the database:
- **R001** (Container, HFO, 91.0 intensity) - Baseline, non-compliant
- **R002** (BulkCarrier, LNG, 88.0 intensity) - Compliant
- **R003** (Tanker, MGO, 93.5 intensity) - Non-compliant
- **R004** (RoRo, HFO, 89.2 intensity) - Slightly non-compliant
- **R005** (Container, LNG, 90.5 intensity) - Non-compliant

## Running the Application

### Development Mode
```bash
npm run dev
```
Server starts at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"ok"}
```

## API Endpoints

All endpoints are prefixed with `/api`. Content-Type: `application/json`

### Routes

#### Get All Routes
```http
GET /api/routes
```

**Response:**
```json
[
  {
    "id": "uuid",
    "routeId": "R001",
    "vesselType": "Container",
    "fuelType": "HFO",
    "year": 2024,
    "ghgIntensity": 91.0,
    "fuelConsumption": 5000,
    "distance": 12000,
    "totalEmissions": 4500,
    "isBaseline": true
  }
]
```

#### Set Route as Baseline
```http
POST /api/routes/:id/baseline
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/routes/R001/baseline
```

**Response:**
```json
{"message": "Baseline updated"}
```

#### Compare Routes Against Baseline
```http
GET /api/routes/comparison
```

**Response:**
```json
[
  {
    "baselineRouteId": "R001",
    "comparisonRouteId": "R002",
    "baselineIntensity": 91.0,
    "comparisonIntensity": 88.0,
    "percentDiff": -3.3,
    "compliant": true
  }
]
```

### Compliance

#### Calculate Compliance Balance
```http
GET /api/compliance/cb?shipId=R001&year=2024
```

**Formula:** `CB = (89.3368 - ghgIntensity) × (fuelConsumption × 41000)`

**Response:**
```json
{"cb": -340956000}
```

Negative = deficit (non-compliant), Positive = surplus (compliant)

#### Get Adjusted CB (with banking)
```http
GET /api/compliance/adjusted-cb?shipId=R001&year=2024
```

**Response:**
```json
{
  "originalCB": -340956000,
  "adjustedCB": -340956000
}
```

### Banking

#### Get Bank Records
```http
GET /api/banking/records?shipId=R002&year=2024
```

**Response:**
```json
{
  "shipId": "R002",
  "year": 2024,
  "totalBanked": 0
}
```

#### Bank Surplus
```http
POST /api/banking/bank
Content-Type: application/json

{
  "shipId": "R002",
  "year": 2024
}
```

**Response:**
```json
{"bankedAmount": 274044000}
```

#### Apply Banked Surplus
```http
POST /api/banking/apply
Content-Type: application/json

{
  "shipId": "R001",
  "year": 2024,
  "amount": 50000000
}
```

**Response:**
```json
{
  "cb_before": -340956000,
  "applied": 50000000,
  "cb_after": -290956000
}
```

### Pooling

#### Create Pool
```http
POST /api/pools
Content-Type: application/json

{
  "members": [
    {"shipId": "R002", "cbBefore": 274044000},
    {"shipId": "R001", "cbBefore": -340956000}
  ],
  "year": 2024
}
```

**Response:**
```json
[
  {
    "shipId": "R002",
    "cbBefore": 274044000,
    "cbAfter": 0,
    "year": 2024
  },
  {
    "shipId": "R001",
    "cbBefore": -340956000,
    "cbAfter": -66912000,
    "year": 2024
  }
]
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests (65 tests)
npm run test:edge          # Edge cases (26 tests)
npm run test:integration   # API tests

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Results:**
- ✅ 91 tests passing
- ✅ Unit tests for domain services
- ✅ Unit tests for use cases
- ✅ Edge case and boundary tests
- ✅ Execution time: ~2.7 seconds

See [TEST_SUMMARY.md](./TEST_SUMMARY.md) for detailed test documentation.

## Project Structure Details

### Core Layer
- **Entities**: Pure data structures (Route, Pool, BankEntry, etc.)
- **Services**: Business logic calculations (compliance balance, comparisons, validations)
- **Use Cases**: Application workflows (orchestrating domain services with repositories)
- **Ports**: Interfaces for external dependencies

### Adapter Layer
- **Inbound/HTTP**: Express controllers and routes
- **Outbound/Postgres**: Prisma repository implementations

### Infrastructure Layer
- **Database**: Prisma client configuration
- **Server**: Express app setup, middleware, error handling

## Key Features

✅ **Compliance Tracking**: Calculate CB based on FuelEU formula  
✅ **Banking System**: Save surplus, apply to deficits  
✅ **Pooling Algorithm**: Greedy redistribution of CB between ships  
✅ **Route Comparison**: Compare routes against baseline  
✅ **Validation**: Zod schemas on all endpoints  
✅ **Type Safety**: Full TypeScript with strict mode  
✅ **Error Handling**: Global error handler  
✅ **CORS**: Configurable CORS support  
✅ **Testing**: Comprehensive test suite  

## Business Rules Implemented

1. **Compliance Balance**: `CB = (Target - Actual) × Energy`
2. **Banking**: Only positive CB can be banked
3. **Apply Bank**: Only to deficit (negative CB)
4. **Pooling**: Total pool CB must be ≥ 0
5. **Pool Validation**: Surplus ships can't become negative, deficit ships can't get worse

## Database Schema

### Route
- Primary vessel data with GHG intensity and fuel consumption
- Unique constraint: (routeId, year)

### ShipCompliance
- Stores calculated compliance balances
- Unique constraint: (shipId, year)

### BankEntry
- Tracks banked surplus amounts
- Multiple entries per ship/year allowed

### Pool & PoolMember
- Pool groups ships for compliance redistribution
- PoolMember tracks before/after balances

See [prisma/schema.prisma](./prisma/schema.prisma) for full schema.

## Debugging

### Common Issues

**TypeScript errors about path aliases:**
```bash
# Regenerate Prisma client
npm run prisma:generate
```

**Database connection errors:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Test connection: `psql $DATABASE_URL`

**Port already in use:**
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

## Scripts Reference

```json
{
  "dev": "Start development server with hot reload",
  "build": "Compile TypeScript to JavaScript",
  "start": "Run production build",
  "test": "Run all tests",
  "test:watch": "Run tests in watch mode",
  "test:coverage": "Generate coverage report",
  "test:unit": "Run unit tests only",
  "test:integration": "Run API tests only",
  "test:edge": "Run edge case tests only",
  "prisma:generate": "Generate Prisma client",
  "prisma:migrate": "Run database migrations",
  "prisma:seed": "Seed database with initial data",
  "db:seed": "Generate client + seed in one command"
}
```

## Future Enhancements

- [ ] Frontend dashboard (React/Next.js)
- [ ] User authentication & authorization
- [ ] Multi-year compliance tracking
- [ ] Penalty calculation engine
- [ ] Export reports (PDF/Excel)
- [ ] Real-time WebSocket updates
- [ ] Audit logging
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)

## Contributing

This is a student project, but feedback is welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes.

## Contact

**Developer**: Swaraj  
**GitHub**: [@swaraj29](https://github.com/swaraj29)  
**Repository**: [fueleu-maritime-backend](https://github.com/swaraj29/fueleu-maritime-backend)

## Acknowledgments

- EU FuelEU Maritime Regulation documentation
- Prisma team for excellent ORM tooling
- Express.js community
- GitHub Copilot and ChatGPT for development assistance

---

**Built with ❤️ for sustainable maritime shipping**

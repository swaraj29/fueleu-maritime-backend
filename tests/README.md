# Test Suite Documentation

## Overview
Comprehensive test suite for the FuelEU Maritime Backend covering unit tests, integration tests, and edge cases.

## Test Structure

```
tests/
├── setup.ts                           # Test configuration
├── unit/                              # Unit tests (isolated)
│   ├── domain/
│   │   └── services/
│   │       ├── computeComplianceBalance.test.ts
│   │       ├── computeComparison.test.ts
│   │       └── validatePoolRules.test.ts
│   └── use-cases/
│       ├── pooling/
│       │   └── createPool.test.ts
│       ├── compliance/
│       │   └── compliance.test.ts
│       └── banking/
│           └── banking.test.ts
├── integration/                       # API endpoint tests
│   └── api/
│       └── routes.test.ts
└── edge-cases/                        # Edge cases & boundaries
    └── boundary.test.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Edge Case Tests Only
```bash
npm run test:edge
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

### Unit Tests
- ✅ **Domain Services** (3 test files, 50+ test cases)
  - `computeComplianceBalance`: 8 test cases
  - `computeComparison`: 9 test cases
  - `validatePoolRules`: 20+ test cases

- ✅ **Use Cases** (3 test files, 40+ test cases)
  - Pooling: 10 test cases
  - Compliance: 7 test cases
  - Banking: 12 test cases

### Integration Tests
- ✅ **API Routes** (1 test file, 20+ test cases)
  - GET /api/routes
  - POST /api/routes/:id/baseline
  - GET /api/routes/comparison
  - GET /api/compliance/cb
  - GET /api/compliance/adjusted-cb
  - POST /api/banking/bank
  - POST /api/banking/apply
  - GET /api/banking/records
  - POST /api/pools

### Edge Cases
- ✅ **Boundary Tests** (1 test file, 35+ test cases)
  - Extreme values (very large/small numbers)
  - Precision and rounding
  - Pool edge cases
  - String handling
  - Year boundaries
  - Numerical stability

## Coverage Targets

```json
{
  "branches": 70,
  "functions": 70,
  "lines": 70,
  "statements": 70
}
```

## Test Categories

### 1. Domain Service Tests
Tests the core business logic without dependencies:
- Compliance Balance calculations
- Route comparisons
- Pool validation rules

### 2. Use Case Tests
Tests application layer with mocked repositories:
- Banking operations
- Pooling algorithm
- Compliance adjustments

### 3. Integration Tests
Tests API endpoints with mocked repositories:
- Request validation (Zod schemas)
- Response formats
- HTTP status codes
- Error handling

### 4. Edge Case Tests
Tests boundary conditions:
- Extreme numerical values
- Floating-point precision
- Pool size boundaries
- State transitions
- String handling

## Key Test Patterns

### Mocking Repositories
```typescript
const mockRepo: Repository = {
  method: jest.fn()
};
```

### Testing Use Cases
```typescript
it("should perform action", async () => {
  (mockRepo.method as jest.Mock).mockResolvedValue(data);
  const result = await useCase(params, mockRepo);
  expect(result).toEqual(expected);
});
```

### Testing API Endpoints
```typescript
const response = await request(app)
  .post("/api/endpoint")
  .send(body);

expect(response.status).toBe(200);
expect(response.body).toHaveProperty("field");
```

## Test Scenarios Covered

### ✅ Happy Path
- Valid inputs produce expected outputs
- Successful database operations
- Correct business logic execution

### ✅ Error Handling
- Invalid inputs throw appropriate errors
- Missing data is handled gracefully
- Business rule violations are caught

### ✅ Boundary Conditions
- Zero values
- Negative values
- Very large values
- Empty arrays
- Exact thresholds

### ✅ Edge Cases
- Floating-point precision
- State transitions
- Complex multi-member scenarios
- Special characters

## Running Tests with Docker (Optional)

If using Docker for PostgreSQL:
```bash
docker-compose up -d
npm test
```

## Debugging Tests

Run a specific test file:
```bash
npm test -- tests/unit/domain/services/computeComplianceBalance.test.ts
```

Run tests matching a pattern:
```bash
npm test -- --testNamePattern="should calculate"
```

## CI/CD Integration

Tests are designed to run in CI pipelines:
- No external dependencies (mocked repositories)
- Deterministic results
- Fast execution
- Clear error messages

## Future Enhancements

- [ ] E2E tests with real database
- [ ] Performance/load tests
- [ ] Mutation testing
- [ ] Contract tests for APIs
- [ ] Visual regression tests (if UI added)

## Notes

- All tests use **mocked repositories** to avoid database dependencies
- Tests are **isolated** and can run in any order
- **Type-safe** mocks using TypeScript
- **Comprehensive** coverage of business logic
- **Fast** execution (no DB queries)

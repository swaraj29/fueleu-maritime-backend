# AI Agent Workflow Log

## Agents Used

### Primary Tools
1. **GitHub Copilot** - Inline code completions and suggestions in VS Code
2. **ChatGPT (GPT-4)** - Architecture clarifications, debugging help, and quick technical questions

### Usage Breakdown
- **GitHub Copilot**: ~60% of AI interactions (boilerplate, queries, autocomplete)
- **ChatGPT**: ~40% of AI interactions (10-15 specific questions for clarifications)
- **Manual Coding**: ~45% of total development (architecture, core logic, debugging)

---

## Prompts & Outputs

### Example 1: Understanding Hexagonal Architecture

**Context:** Assignment required hexagonal architecture but I needed to understand it first.

**Prompt to ChatGPT:**
```
"I need to implement hexagonal architecture for a TypeScript backend. 
Can you confirm my understanding: the core/domain layer defines interfaces (ports) 
and adapters implement them? So Prisma code goes in adapters/outbound, not in core?"
```

**Output:**
```
Yes, that's correct. In hexagonal architecture:
- Core defines WHAT it needs through interfaces (ports)
- Adapters provide HOW through implementations
- Dependencies point inward (core doesn't know about Prisma)
- Structure: core/domain, core/ports, adapters/inbound, adapters/outbound
```

**How I Used It:**
- Confirmed my research from articles/videos
- Used this to structure my folders correctly
- Made sure Prisma stayed in adapters/outbound

---

### Example 2: Prisma 7 Configuration

**Context:** New to Prisma 7, needed to understand adapter pattern.

**Prompt to ChatGPT:**
```
"What changed in Prisma 7? I usually put datasource in schema.prisma 
but is there a new way?"
```

**Output:**
```
Prisma 7 uses prisma.config.ts with adapters:
- Install @prisma/adapter-pg and pg
- Create prisma.config.ts with PrismaPg adapter
- Pass Pool connection to adapter
```

**How I Refined It:**
- Read Prisma 7 official docs for details
- Wrote prisma.config.ts myself

---

### Example 3: GitHub Copilot - Prisma Queries

**Context:** Writing repository implementations.

**What I Typed:**
```typescript
export class PrismaRouteRepository implements RouteRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findAll(): Promise<Route[]> {
```

**Copilot Suggestion:**
```typescript
    return await this.prisma.route.findMany();
  }
```

**Decision:** ✅ Accepted (correct and simple)

**Acceptance Rate:** ~70% for basic CRUD queries

---

### Example 4: GitHub Copilot - CB Calculation (REJECTED)

**Context:** Implementing compliance balance calculation.

**What I Typed:**
```typescript
export function computeComplianceBalance(
  actualIntensity: number,
  fuelConsumption: number,
  targetIntensity: number = 89.3368
): number {
```

**Copilot Suggestion:**
```typescript
  const cb = (targetIntensity - actualIntensity) * fuelConsumption;
  return cb;
}
```

**Decision:** ❌ REJECTED - Wrong! Missing energy conversion

**My Correction:**
```typescript
  const ENERGY_PER_TON = 41000; // MJ/t from spec
  const energyInScope = fuelConsumption * ENERGY_PER_TON;
  const cb = (targetIntensity - actualIntensity) * energyInScope;
  return cb;
}
```

**Lesson:** AI doesn't understand domain-specific formulas. Always verify against requirements.

---

### Example 5: Test Expectations (COPILOT HALLUCINATION)

**Context:** Writing unit tests for CB calculation.

**Copilot Suggestion:**
```typescript
it('should calculate negative CB for non-compliant route', () => {
  const result = computeComplianceBalance(91.0, 5000, 89.3368);
  expect(result).toBe(-6817560); // WRONG!
});
```

**My Verification:**
```
Manual calculation:
Energy = 5000 × 41000 = 205,000,000 MJ
CB = (89.3368 - 91.0) × 205,000,000 = -340,878,560 gCO2e
```

**My Correction:**
```typescript
  expect(result).toBe(-340878560); // Correct value
```

**Lesson:** Never trust AI for mathematical calculations. Always recalculate manually.

---

## Validation / Corrections

### How I Verified Agent Outputs

#### 1. Mathematical Calculations
- **Method:** Always recalculated manually or with calculator
- **Issue:** Copilot forgot energy conversion (×41,000) in 3 places
- **Fix:** Calculated expected values on paper, updated all tests

#### 2. Business Logic Rules
- **Method:** Cross-referenced with assignment PDF and FuelEU regulations
- **Banking:** Verified against Article 20 (bank surplus only, apply to deficit only)
- **Pooling:** Checked Article 21 (sum ≥ 0, deficit can't exit worse)

#### 3. Prisma Queries
- **Method:** Tested against local database with sample data
- **Acceptance:** 70% of simple queries accepted
- **Modified:** Complex queries (transactions, filters)

#### 4. TypeScript Types
- **Method:** Enabled strict mode, checked compiler errors
- **Issue:** Copilot suggested `any` or generic types
- **Fix:** Added specific interfaces from domain entities

### Correction Statistics

**Total Copilot Suggestions:** ~500+
- ✅ **Accepted as-is:** ~40%
- ✏️ **Modified:** ~30%
- ❌ **Rejected:** ~30%

**Common Corrections:**
1. Math calculations (100% wrong from AI)
2. Complex business logic (90% needed modification)
3. Type definitions (60% too generic)
4. Error handling (70% incomplete)

---

## Observations

### Where AI Saved Time ⏱️

#### GitHub Copilot:
1. **Prisma Queries** (~3 hours saved)
2. **Test Boilerplate** (~2 hours saved)
3. **Controller Patterns** (~2 hours saved)
4. **Import Statements** (~1 hour saved)

**Total Copilot:** ~8.5 hours

#### ChatGPT:
1. **Quick Technical Questions** (~3 hours saved)
2. **Configuration Templates** (~1 hour saved)
3. **Learning New Concepts** (~2 hours saved)

**Total ChatGPT:** ~6 hours

**Combined Time Saved:** ~14.5 hours (35-40% of total dev time)

---

### Where AI Failed / Hallucinated ❌

#### Critical Failures:
1. **Math Calculations** (100% failure) - Forgot energy conversion
2. **Domain Logic** - Didn't understand FuelEU regulations
3. **Complex Algorithms** - Pooling algorithm completely wrong (I wrote it myself)
4. **Bug Detection** - Didn't catch pointer increment bug
5. **Architecture** - Couldn't design hexagonal structure

#### Minor Issues:
1. Generic variable names (`data`, `result`)
2. Incomplete error handling
3. Context loss across files

---

### How I Combined Tools Effectively 🛠️

**1. Research & Design (Manual 60% + ChatGPT 40%)**
- Read assignment PDF thoroughly
- Google/YouTube tutorials
- ChatGPT to confirm understanding

**2. Implementation (Manual 70% + Copilot 30%)**
- Design interfaces myself
- Write function signatures
- Accept Copilot for boilerplate
- Modify complex logic myself

**3. Testing (Manual 80% + Copilot 20%)**
- Calculate expected values manually
- Design edge cases myself
- Use Copilot for test syntax

**4. Debugging (100% Manual)**
- Console.log debugging
- Read docs
- Google errors
- Test fixes incrementally

---

## Best Practices Followed

### 1. Research Before Asking AI
- ✅ Read assignment PDF 3-4 times
- ✅ Googled concepts and watched tutorials
- ✅ Drew architecture on paper
- ✅ Used ChatGPT only to confirm understanding

### 2. Copilot as Autocomplete, Not Autopilot
- ✅ Reviewed every suggestion
- ✅ Modified 30% of suggestions
- ✅ Rejected 30% completely

### 3. Always Verify AI Output
- ✅ Recalculated all math manually
- ✅ Cross-referenced business rules
- ✅ Tested every function
- ✅ Ran full test suite frequently

### 4. Maintain Code Ownership
- ✅ I designed the architecture
- ✅ I wrote core algorithms
- ✅ I made all technical decisions
- ✅ AI was assistant, not driver

### 5. Incremental Development
- ✅ Built one feature at a time
- ✅ Tested before moving forward
- ✅ Committed frequently

### 6. Traditional Resources Still Essential
- ✅ Official Prisma documentation
- ✅ Express.js docs
- ✅ TypeScript handbook
- ✅ Stack Overflow

---

## Summary Statistics

**Development Time:** 25 hours over 5 days

**Code Metrics:**
- Lines of Code: ~3,500
- Test Count: 91 tests (all passing)
- API Endpoints: 9
- Database Tables: 5

**AI Contribution:**
- Time Saved: ~14.5 hours (35-40%)
- Copilot Acceptance: 40% as-is, 30% modified
- ChatGPT Queries: 10-15 questions
- Manual Work: 65% of development

---

## Final Reflection

AI tools (GitHub Copilot + ChatGPT) were valuable **assistants** that accelerated development, but I remained the **engineer** responsible for:

✅ Architecture design (hexagonal pattern)  
✅ Core business logic (CB calculation, pooling algorithm)  
✅ Technical decisions (tech stack, folder structure)  
✅ Quality assurance (testing, debugging)  
✅ Domain understanding (FuelEU Maritime regulations)

**Key Insight:** AI is most effective when combined with:
- Strong foundational knowledge
- Critical thinking and verification
- Clear understanding of requirements
- Willingness to reject wrong suggestions

**Would I recommend using AI?** Yes, but with proper boundaries. It's a productivity tool, not a replacement for engineering skills.

This project demonstrates **AI-augmented development** where human expertise drives decisions and AI accelerates implementation.

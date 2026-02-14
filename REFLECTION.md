# Reflection: Building FuelEU Maritime Backend with AI Assistance

## Introduction

When I started this project, I was honestly a bit intimidated. Building a compliance tracking system for maritime regulations sounded complex, and I wasn't even sure where to begin. I had used GitHub Copilot before for simple autocomplete, but this was my first time relying heavily on AI tools for a complete project. Looking back now, it's been quite a learning journey - both technically and in understanding how to work effectively with AI.

## What I Learned Technically

### Understanding Hexagonal Architecture

Before this project, I had only built simple Express apps with controllers talking directly to database models. When ChatGPT suggested hexagonal architecture, I had to Google what that even meant. The concept of "ports and adapters" seemed over-engineered at first - why not just put Prisma calls in my controllers?

But as I built it, I started to see the value. Writing tests became so much easier because I could mock repositories instead of dealing with a real database. When I changed from one database query pattern to another, my business logic didn't care. The core folder genuinely didn't know Express or Prisma existed. That separation clicked for me around day 3, and now I actually prefer this approach.

### Prisma 7 and Modern ORMs

I had used Prisma 5 in a previous project, so I thought I knew it. Wrong. Prisma 7 completely changed how database connections work with adapters. I spent a frustrating hour getting errors about "adapter required" before ChatGPT explained the new pattern.

The learning here wasn't just "how to use Prisma 7" but understanding why they made this change. The adapter pattern gives you more control over connection pooling and makes Prisma work in edge runtimes. That's a deeper architectural decision, not just a syntax change.

### Domain Modeling

The FuelEU Maritime regulations were completely new to me. I had to read actual EU documentation to understand concepts like:
- What is GHG intensity and why does it matter?
- How is compliance balance calculated?
- Why do ships need banking and pooling mechanisms?

AI couldn't help much here. ChatGPT could explain concepts I already knew about, but understanding the actual business domain required reading, thinking, and asking myself "does this make sense?"

For example, the pooling algorithm - I asked ChatGPT for a redistribution algorithm, got a two-pointer approach, but had to figure out the exact business rules myself. Should deficit ships be allowed to improve beyond zero? Should surplus ships ever go negative? These were domain decisions, not coding questions.

## What Worked Well with AI

### Speed on Boilerplate

GitHub Copilot was incredible for repetitive code. Once I wrote my first repository implementation, Copilot could suggest similar patterns for the other four repositories. Same with Express routes - after the first two endpoints, Copilot understood the pattern and could scaffold the rest.

This probably saved me 5-6 hours of typing. Not thinking time, but actual typing time. That's significant.

### Learning New Concepts Quickly

Instead of reading 10-page documentation for every new library, I could ask ChatGPT "How do I validate requests in Express with TypeScript?" and get a focused answer with Zod examples. Then I'd dive into docs for deeper understanding.

This reversed learning flow - quick practical example first, then deeper theory - worked well for me. In school we usually learn theory first, but when building projects, I prefer solving immediate problems.

### Debugging Assistance

When I got cryptic TypeScript errors about path aliases, ChatGPT could quickly tell me "check your tsconfig.json baseUrl and jest.config.js moduleNameMapper." That's pattern recognition - the AI has seen this error a thousand times. Saved me from StackOverflow rabbit holes.

## What Didn't Work with AI

### Business Logic

This was the biggest gap. AI tools don't understand your specific domain. When I needed to decide whether a ship with positive CB should be allowed to receive pooled surplus, Copilot couldn't help. When I needed to validate pool rules, ChatGPT gave generic advice about validation patterns, not FuelEU Maritime rules.

I had to think through edge cases myself:
- What if pool sum is exactly zero?
- Should we allow negative pool sums?
- Can surplus ships become negative through pooling?

These required domain knowledge and careful thinking, not code generation.

### Incorrect Calculations

This surprised me - AI is bad at math. Copilot suggested test expectations with wrong calculations multiple times. I'd write a test for compliance balance, Copilot would suggest `expect(cb).toBe(-6817560)`, and I'd have to manually calculate to realize it should be `-340956000`.

I learned to never trust AI-generated numbers. Always verify calculations yourself.

### Architecture Decisions

ChatGPT suggested hexagonal architecture, but it couldn't make detailed structural decisions:
- How should I organize use cases?
- Where do validation rules belong - domain services or use cases?
- Should repositories return domain entities or raw Prisma objects?

These architectural choices required me to research, think, and make decisions. AI could explain patterns but couldn't architect my specific application.

## Challenges I Faced

### Over-Relying Initially

Day 1, I tried to let Copilot drive too much. I'd start typing a function and just accept whatever it suggested without thinking. This led to code that worked but didn't fit my architecture. I had to delete and rewrite several functions because I accepted suggestions too quickly.

I learned: AI suggestions are starting points, not finished code. Review, understand, and modify them.

### Context Limitations

GitHub Copilot doesn't remember your entire codebase. It looks at the current file and maybe nearby files, but it doesn't understand your full architecture. So suggestions would sometimes conflict with patterns I established elsewhere.

For example, Copilot would suggest putting database queries directly in controllers, not realizing I was using the repository pattern. I had to consciously maintain architectural consistency.

### Testing the AI-Generated Code

My initial tests were AI-generated and passed, but they weren't testing the right things. Copilot generated tests that checked if functions returned *something*, not if they calculated the *correct* thing.

I had to rewrite test expectations manually, thinking through each edge case. Good tests require understanding what should happen, and AI doesn't have that understanding.

## How I Adjusted My Workflow

### Prompting Strategy

I learned to be very specific with ChatGPT:

Bad: "How do I validate data?"
Good: "How do I validate Express request bodies with TypeScript type inference using Zod, and create reusable middleware?"

Specific prompts got me 80% solutions instead of 30% generic answers.

### Copilot Usage Pattern

I developed a rhythm:
1. Write function signature and docstring myself
2. Let Copilot suggest implementation
3. Review suggestion critically
4. Accept/modify/reject
5. Test it manually

This hybrid approach worked better than trying to let AI do everything or nothing.

### When to Stop Using AI

I learned to recognize when AI wasn't helping:
- Complex business logic → Think yourself
- Architecture decisions → Research and decide
- Debugging weird issues → Read source code
- Performance optimization → Profiling and analysis

Some problems need human reasoning, not pattern matching.

## Unexpected Benefits

### Code Consistency

Because Copilot suggested similar patterns across files, my code ended up more consistent than if I'd written everything from scratch at different times with different energy levels. All my repositories follow the same pattern, all my controllers have similar structure.

### Documentation Prompts

Having to explain my needs to ChatGPT made me think more clearly about requirements. If I couldn't articulate what I needed, I probably didn't understand it well enough to code it anyway.

### Testing Coverage

Copilot's aggressive test suggestions actually pushed me to write more tests than I normally would. Even though I modified most suggestions, having that scaffolding made me less lazy about testing.

## What I'd Do Differently

### Start with Domain Understanding

Next time, I'd spend more time upfront understanding the business domain before writing any code. I jumped into coding too fast, then had to refactor when I better understood FuelEU Maritime rules. AI can't compensate for domain ignorance.

### Manual First Draft

For core business logic, I'd write the first version completely manually, then use AI for refactoring and improvements. The pooling algorithm would have been better if I'd thought it through on paper first instead of asking AI for an algorithm I didn't fully understand.

### Better Test Planning

I'd plan test cases manually before writing any tests. Know what edge cases matter, then use AI to write the test boilerplate. My edge case tests came late because I let AI suggest test cases instead of thinking about them strategically.

## Impact on Learning

### Positive

- **Exposed to Patterns**: Saw architectural patterns (repository, dependency injection) that I might not have discovered alone
- **Faster Iteration**: Could try ideas quickly, fail fast, learn from failures
- **Practical Learning**: Learned by building, not just reading tutorials

### Concerns

- **Understanding Gaps**: Sometimes I accepted code I didn't fully understand initially
- **Dependency**: Worried I might struggle without AI assistance now
- **Depth vs Breadth**: Learned many things shallowly rather than few things deeply

I think the key is being aware of these concerns. Use AI to accelerate learning, but force yourself to understand everything you ship.

## Final Thoughts

This project took me about 20 hours with AI assistance. Without AI, I estimate it would have taken 35-40 hours. That's real time savings. But the time I saved was mostly mechanical time (typing, reading docs, debugging common errors), not thinking time.

The hard parts were still hard:
- Understanding the domain
- Designing the architecture
- Making business decisions
- Finding algorithmic bugs
- Ensuring correctness

AI tools made me more productive, but they didn't make me smarter. I still had to bring domain knowledge, critical thinking, and engineering judgment. AI is a powerful tool for developers who know what they're building. It's less helpful for developers who don't.

Would I use AI on future projects? Absolutely. But I now understand its strengths and limitations better. It's a productivity multiplier, not a replacement for understanding.

## Advice for Others

If you're using AI for development:

1. **Understand before accepting** - Never ship code you don't understand
2. **Verify everything** - Especially calculations and business logic
3. **Use for acceleration, not delegation** - You're still the engineer
4. **Learn the fundamentals** - AI can't replace foundational knowledge
5. **Stay critical** - Question suggestions, don't assume AI is right

AI-assisted development is a skill in itself. It takes practice to know when to use it, how to prompt effectively, and when to set it aside and think. This project was my training ground for that skill.

---

**Final Score**: AI assistance was valuable and time-saving, but this project's success came from combining AI capabilities with human understanding, judgment, and domain knowledge. I'm proud of what I built, and I'm glad I learned to use AI effectively rather than letting it use me.

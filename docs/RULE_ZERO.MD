# RULE ZERO

1. Documentation is the source of truth.

2. No code may violate documentation.

3. No architecture changes during implementation.

4. Every milestone must pass validation before the next milestone.

5. Every feature must include:
   - Tests
   - Documentation updates (if required)
   - Error handling
   - Logging
   - Security review

6. No feature is considered complete until it passes validation.


Every dependency must include a justification. If a package is added, explain why it is required, whether it is runtime or development-only, and whether a lighter alternative exists.
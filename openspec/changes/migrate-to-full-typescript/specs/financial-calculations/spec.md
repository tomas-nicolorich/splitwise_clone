## MODIFIED Requirements

### Requirement: Exhaustive Split Verification
The financial splitting logic MUST be verified against an exhaustive test suite and MUST use explicit numeric and array types to prevent calculation errors.

#### Scenario: Split with rounding remainder
- **WHEN** $100 is split among 3 equal earners
- **THEN** the system uses the Largest Remainder Method to ensure the total is exactly $100.00, with all intermediate steps using typed `number` values

### Requirement: Budget Transfer Adjustment
Manual budget transfers MUST correctly adjust the income-weighted shares for a category, with all transfer data objects strictly adhering to the `BudgetTransfer` interface.

#### Scenario: Budget transfer between members
- **WHEN** a transfer of $10 is recorded from User A to User B for Category X
- **THEN** User A's calculated share for Category X is reduced by $10 and User B's is increased by $10, verified by type-safe property access

### Requirement: Optimized Memoization
The splitting calculations MUST use an efficient memoization strategy to prevent redundant CPU cycles, with the cache key being a strictly typed hash of the input data.

#### Scenario: Component re-render without data change
- **WHEN** a component re-renders but the underlying group data (Group, Members, Incomes, Expenses, Categories) remains identical according to a deep-equality check of their typed properties
- **THEN** the splitting logic returns the cached result without re-executing the algorithm

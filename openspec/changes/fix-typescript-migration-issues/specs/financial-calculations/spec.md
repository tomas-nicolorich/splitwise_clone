## MODIFIED Requirements

### Requirement: Optimized Memoization
The splitting calculations MUST use an efficient memoization strategy to prevent redundant CPU cycles, with the cache key being a strictly typed hash of the input data or a unique version string that updates on data change.

#### Scenario: Component re-render with stale version key
- **WHEN** a component re-renders but the underlying group data version remains unchanged
- **THEN** the splitting logic returns the cached result without re-executing the algorithm

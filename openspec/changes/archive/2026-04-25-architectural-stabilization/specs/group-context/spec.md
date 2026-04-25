## ADDED Requirements

### Requirement: Centralized Group Provider
The system MUST provide a React Context Provider that manages all state and data fetching for a specific group.

#### Scenario: Mount GroupProvider with valid ID
- **WHEN** `GroupProvider` is mounted with a `groupId`
- **THEN** it fetches group details, members, incomes, categories, and expenses in parallel

### Requirement: Shared State Consumption
Child components MUST be able to consume group data and actions via a `useGroup` hook.

#### Scenario: Consume group name in header
- **WHEN** a component calls `useGroup()` within the provider
- **THEN** it receives the `group` object and can render `group.name`

### Requirement: Memoized Financial Calculations
The `GroupProvider` MUST provide memoized financial splits based on the latest group data.

#### Scenario: Expense added to group
- **WHEN** a new expense is added via the context action
- **THEN** the `categorySplits` are automatically re-calculated and shared with all consumers

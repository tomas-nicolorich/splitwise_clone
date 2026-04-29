# Purpose
Manage group state and data fetching using React Context and TanStack Query.

## Requirements

### Requirement: Centralized Group Provider
The system MUST provide a strictly typed React Context Provider that manages all state and data fetching for a specific group, ensuring all state variables have explicit non-nullable types where appropriate.

#### Scenario: Mount GroupProvider with valid ID
- **WHEN** `GroupProvider` is mounted with a `groupId`
- **THEN** it fetches group details, members, incomes, categories, and expenses in parallel using strictly typed TanStack Query hooks

### Requirement: Shared State Consumption
Child components MUST be able to consume group data and actions via a `useGroup` hook which MUST return a strictly typed context object.

#### Scenario: Consume group name in header
- **WHEN** a component calls `useGroup()` within the provider
- **THEN** it receives the `group` object with a guaranteed structure (or `null` if loading) and can render `group.name` with full IDE autocomplete

### Requirement: Memoized Financial Calculations
The `GroupProvider` MUST provide memoized financial splits based on the latest group data, with all calculation inputs and outputs strictly typed.

#### Scenario: Expense added to group
- **WHEN** a new expense is added via the context action
- **THEN** the `categorySplits` are automatically re-calculated and shared with all consumers as a strictly typed object map

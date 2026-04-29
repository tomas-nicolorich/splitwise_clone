## ADDED Requirements

### Requirement: Centralized Type Source of Truth
The system MUST provide a central location for TypeScript interfaces and types that are shared between the frontend (React) and the backend (Vercel API).

#### Scenario: Update shared interface
- **WHEN** a field is added to a shared interface (e.g., `Group`)
- **THEN** both the frontend components and backend handlers immediately reflect the new type contract

### Requirement: Frontend-Compatible Database Models
The system MUST provide "Frontend" versions of Prisma models where `BigInt` fields are represented as `string` and `Decimal` fields as `number` to match JSON serialization behavior.

#### Scenario: Use Group model in React
- **WHEN** a React component uses the `Group` type
- **THEN** the `id` field is treated as a `string` and the `total_budget` (if applicable) is a `number`

# Purpose
Define a central source of truth for shared TypeScript interfaces and frontend-compatible models to ensure type safety across the application.

## Requirements

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

### Requirement: Recursive Frontend Type Mapper
The system SHALL provide a `ToFrontend<T>` utility type that recursively transforms complex database types (BigInt, Decimal, Date) into their JSON-safe frontend equivalents (string, number, ISO-string).

#### Scenario: Map Prisma User model
- **WHEN** `ToFrontend<PrismaUser>` is used
- **THEN** fields like `id` (bigint) are mapped to `string`, and `amount` (Decimal) are mapped to `number`

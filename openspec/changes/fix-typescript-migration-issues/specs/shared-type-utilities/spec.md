## ADDED Requirements

### Requirement: Recursive Frontend Type Mapper
The system SHALL provide a `ToFrontend<T>` utility type that recursively transforms complex database types (BigInt, Decimal, Date) into their JSON-safe frontend equivalents (string, number, ISO-string).

#### Scenario: Map Prisma User model
- **WHEN** `ToFrontend<PrismaUser>` is used
- **THEN** fields like `id` (bigint) are mapped to `string`, and `amount` (Decimal) are mapped to `number`

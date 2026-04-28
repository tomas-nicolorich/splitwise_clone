## MODIFIED Requirements

### Requirement: Type-Safe Request Body Validation
All POST, PUT, and PATCH requests to entity endpoints MUST validate the request body against a Zod schema that is explicitly tied to a shared TypeScript interface.

#### Scenario: Update schema without updating interface
- **WHEN** a field is added to `ExpenseSchema` but not to the `Expense` interface
- **THEN** the system throws a compile-time error in the schema definition file

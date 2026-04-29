# Purpose
Transition from generic `/api/data` to entity-specific RESTful endpoints for improved type safety and API structure.

## Requirements

### Requirement: Entity-Specific RESTful Routes
The system MUST provide dedicated API endpoints for each core entity (Groups, Expenses, Incomes, Categories, Users), where each handler function MUST have strictly typed request and response objects.

#### Scenario: Fetch Groups list
- **WHEN** a GET request is made to `/api/groups`
- **THEN** the system returns a JSON array where each element matches the `Group` frontend interface, and the response header is `application/json`

### Requirement: Type-Safe Request Body Validation
All POST, PUT, and PATCH requests to entity endpoints MUST validate the request body against a Zod schema that is explicitly tied to a shared TypeScript interface.

#### Scenario: Update schema without updating interface
- **WHEN** a field is added to `ExpenseSchema` but not to the `Expense` interface
- **THEN** the system throws a compile-time error in the schema definition file

### Requirement: Consistent Error Handling
All specific API endpoints MUST use a standardized error response format.

#### Scenario: Resource not found
- **WHEN** an update is attempted on a non-existent group ID
- **THEN** the system returns a JSON response with `error` and `message` fields

# Purpose
Transition from generic `/api/data` to entity-specific RESTful endpoints for improved type safety and API structure.

## Requirements

### Requirement: Entity-Specific RESTful Routes
The system MUST provide dedicated API endpoints for each core entity (Groups, Expenses, Incomes, Categories, Users) replacing the generic `/api/data` endpoint.

#### Scenario: Fetch Groups list
- **WHEN** a GET request is made to `/api/groups`
- **THEN** the system returns a list of groups with BigInt IDs serialized as strings

### Requirement: Request Data Validation
Each specific API endpoint MUST validate incoming request bodies using Zod schemas.

#### Scenario: Create Expense with invalid amount
- **WHEN** a POST request is made to `/api/expenses` with a negative amount
- **THEN** the system returns a 400 Bad Request error with validation details

### Requirement: Consistent Error Handling
All specific API endpoints MUST use a standardized error response format.

#### Scenario: Resource not found
- **WHEN** an update is attempted on a non-existent group ID
- **THEN** the system returns a JSON response with `error` and `message` fields

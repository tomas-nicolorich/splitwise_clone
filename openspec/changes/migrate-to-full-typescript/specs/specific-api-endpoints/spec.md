## MODIFIED Requirements

### Requirement: Entity-Specific RESTful Routes
The system MUST provide dedicated API endpoints for each core entity (Groups, Expenses, Incomes, Categories, Users), where each handler function MUST have strictly typed request and response objects.

#### Scenario: Fetch Groups list
- **WHEN** a GET request is made to `/api/groups`
- **THEN** the system returns a JSON array where each element matches the `Group` frontend interface, and the response header is `application/json`

### Requirement: Type-Safe Request Body Validation
All POST, PUT, and PATCH requests to entity endpoints MUST validate the request body against a Zod schema that is tied to a TypeScript interface.

#### Scenario: Create new expense
- **WHEN** a POST request is made to `/api/expenses` with a body
- **THEN** the system validates the body using `ExpenseSchema` and returns a 400 error with typed error messages if validation fails

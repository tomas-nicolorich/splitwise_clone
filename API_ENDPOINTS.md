# API Endpoints Structure (Specific per Entity)

## Overview
Replace the generic `/api/data?entity=X&operation=Y` pattern with specific RESTful endpoints for each entity:
- `/api/auth/*` - Authentication operations
- `/api/groups/*` - Group CRUD operations
- `/api/users/*` - User profile operations
- `/api/incomes/*` - Income CRUD operations
- `/api/categories/*` - Budget category CRUD operations
- `/api/expenses/*` - Expense CRUD operations

## Endpoint Details

### Auth Endpoints (`/api/auth/*`)
- `POST /api/auth/me` - Get current user profile (creates if missing)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/update-me` - Update current user profile

### Groups Endpoints (`/api/groups/*`)
- `GET /api/groups` - List groups (with pagination/filtering)
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group (cascades to related data)

### Users Endpoints (`/api/users/*`)
- `GET /api/users` - List users (with filtering by group)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user profile

### Incomes Endpoints (`/api/incomes/*`)
- `GET /api/incomes` - List incomes (filter by group_id)
- `GET /api/incomes/:id` - Get income by ID
- `POST /api/incomes` - Create income entry
- `PUT /api/incomes/:id` - Update income entry
- `DELETE /api/incomes/:id` - Delete income entry

### Categories Endpoints (`/api/categories/*`)
- `GET /api/categories` - List categories (filter by group_id)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create budget category
- `PUT /api/categories/:id` - Update budget category
- `DELETE /api/categories/:id` - Delete budget category

### Expenses Endpoints (`/api/expenses/*`)
- `GET /api/expenses` - List expenses (filter by group_id, date range)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Benefits of Specific Endpoints
1. **Type Safety**: Each endpoint has predictable request/response types
2. **Better Caching**: TanStack Query can invalidate specific entity types
3. **Clearer Contracts**: OpenAPI/Swagger generation becomes straightforward
4. **Performance**: No need to parse entity/operation parameters
5. **Security**: Easier to apply entity-specific middleware/validation
6. **Dev Experience**: IDE autocomplete works naturally

## Implementation Notes
- Each endpoint file will use the same Prisma client singleton
- Validation will use Zod schemas (imported from `@/lib/schemas`)
- Error handling will be consistent across all endpoints
- BigInt/Decimal serialization handled in response formatting
- Supabase auth integration remains in `/api/auth/me` endpoint
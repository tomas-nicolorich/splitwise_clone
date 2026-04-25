## MODIFIED Requirements

### Requirement: Centralized BigInt Serialization
The system MUST provide a shared utility to serialize BigInt values to strings for JSON responses, using explicit type guards to ensure only BigInts or Objects containing BigInts are processed.

#### Scenario: Serialize BigInt in Object
- **WHEN** an object containing a BigInt is passed to the serializer
- **THEN** the BigInt is converted to a string in the resulting JSON, and the returned type reflects the string transformation

### Requirement: Postgres Sequence Synchronization
The system MUST provide a utility to synchronize Postgres primary key sequences with the maximum ID in the table, using typed Prisma client calls to ensure table and field names are valid.

#### Scenario: Sync Sequence after manual insert
- **WHEN** the sync utility is called for a table
- **THEN** the sequence is set to `max(id) + 1` and the operation is logged with the table name

### Requirement: UUID to BigInt Mapping
The system MUST provide a utility to map Supabase `auth_id` (UUID) to internal user `id` (BigInt), with strict validation of the UUID format.

#### Scenario: Map valid auth_id
- **WHEN** a valid UUID `auth_id` is provided
- **THEN** the utility returns the corresponding BigInt `id` from the Users table, or `null` if the user is not found

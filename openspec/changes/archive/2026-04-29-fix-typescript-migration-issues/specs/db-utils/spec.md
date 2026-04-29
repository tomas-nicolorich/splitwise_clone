## MODIFIED Requirements

### Requirement: Centralized BigInt Serialization
The system MUST provide a shared utility to serialize BigInt values to strings for JSON responses, using explicit type guards to ensure only BigInts or Objects containing BigInts are processed.

#### Scenario: Serialize BigInt in Object
- **WHEN** an object containing a BigInt is passed to the serializer
- **THEN** the BigInt is converted to a string in the resulting JSON, and the returned type reflects the string transformation

# node-flair-api-ts

A TypeScript implementation of the Flair Smart Vent API with OAuth 2.0 support and comprehensive device management.

## Features

- Full TypeScript support with type definitions
- OAuth 2.0 client credentials authentication (secure)
- Generic CRUD API for any resource type
- Support for all Flair devices:
  - Smart Vents
  - Pucks (temperature sensors)  
  - HVAC Units (minisplits)
  - Thermostats
  - Bridges
  - Remote Sensors
- Webhook support for real-time updates
- Schedule management
- Comprehensive error handling

## Installation

```bash
npm install flair-api-ts
```

## Quick Start

```typescript
import { Client } from 'flair-api-ts';

// Initialize with OAuth 2.0 client credentials (secure)
const client = new Client('your_client_id', 'your_client_secret');

// Use the generic CRUD API for any resource type
const structures = await client.get('structures');
const vents = await client.get('vents');
await client.update('vents', vents[0].id, { 'percent-open': 50 });

// Create new resources
const newVent = await client.create('vents', { name: 'Living Room Vent' });

// Delete resources
await client.delete('vents', 'vent-id');
```

## Authentication

This library uses OAuth 2.0 client credentials flow for secure authentication:

1. Create a Flair account at [my.flair.co](https://my.flair.co)
2. Access your OAuth 2.0 client credentials through Account Settings
3. For business use, contact [partners@flair.co](mailto:partners@flair.co)

**Breaking Change in 2.0**: Password grant authentication removed for security.

## API Methods

### Generic CRUD Operations

- `get<T>(resourceType, id?)` - Get resource(s) of any type
- `create<T>(resourceType, attributes, relationships?)` - Create new resource  
- `update<T>(resourceType, id, attributes, relationships?)` - Update resource
- `delete(resourceType, id)` - Delete resource

**Examples:**

```typescript
// Get all vents
const vents = await client.get('vents');

// Get specific user
const user = await client.get('users', 'user123');

// Create new resource
const newVent = await client.create('vents', { name: 'Living Room Vent' });

// Update resource attributes
await client.update('vents', 'vent123', { 'percent-open': 75 });

// Delete resource
await client.delete('vents', 'vent123');
```

## Migration from 1.x

**Breaking Changes in 2.0:**

- **Authentication**: Replace username/password with client credentials:

```typescript
// OLD (insecure)
const client = new Client('client_id', 'client_secret', 'username', 'password');

// NEW (secure)
const client = new Client('client_id', 'client_secret');
```

- **API Methods**: Legacy methods removed, use generic CRUD:

```typescript
// OLD
const vents = await client.getVents();
await client.setVentPercentOpen(vent, 50);

// NEW
const vents = await client.get('vents');
await client.update('vents', vent.id, { 'percent-open': 50 });
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Docs

Docs are located at [https://bassrock.github.io/node-flair-api-ts/index.html](https://bassrock.github.io/node-flair-api-ts/index.html)

### Commit format

Commits should be formatted as `type(scope): message`

The following types are allowed:

| Type     | Description                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------- |
| feat     | A new feature                                                                                         |
| fix      | A bug fix                                                                                             |
| docs     | Documentation only changes                                                                            |
| style    | Changes that do not affect the meaning of the code (white-space, formatting,missing semi-colons, etc) |
| refactor | A code change that neither fixes a bug nor adds a feature                                             |
| perf     | A code change that improves performance                                                               |
| test     | Adding missing or correcting existing tests                                                           |
| chore    | Changes to the build process or auxiliary tools and libraries such as documentation generation        |
| deps     | Update to dependencies                                                                                |

### Releasing

A new version is released when a merge or push to `main` occurs.

## License

MIT

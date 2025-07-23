# @jarlbrak/flair-api-ts

A TypeScript/Node.js implementation of the Flair Smart Vent API, supporting the latest OAuth 2.0 authentication and all current Flair devices including Smart Vents, Pucks, HVAC units (minisplits), thermostats, bridges, and remote sensors.

## Features

- Full TypeScript support with type definitions
- OAuth 2.0 authentication with automatic token refresh
- Support for all Flair devices:
  - Smart Vents
  - Pucks (temperature sensors)
  - HVAC Units (minisplits)
  - Thermostats
  - Bridges
  - Remote Sensors
- Webhook support for real-time updates
- Schedule management
- Comprehensive structure and room control

## Installation

```bash
npm install @jarlbrak/flair-api-ts
```

## Quick Start

```typescript
import { Client } from '@jarlbrak/flair-api-ts';

// Initialize the client with your OAuth 2.0 client credentials
const client = new Client(
  'your_client_id',
  'your_client_secret'
);

// Get all structures (homes) using the new generic API
const structures = await client.get('structures');
const primaryHome = structures.find(s => s.attributes.primary);

// Get and control vents using generic CRUD operations
const vents = await client.get('vents');
const vent = vents[0];
await client.update('vents', vent.id, { 'percent-open': 50 });

// Control HVAC units (minisplits) with type-safe operations
const hvacUnits = await client.get('hvac-units');
const hvac = hvacUnits[0];
await client.update('hvac-units', hvac.id, {
  temperature: 72,
  mode: 'Cool',
  'fan-speed': 'Auto',
  swing: 'On',
  power: 'On'
});

// Or use the legacy methods (still supported)
const structuresLegacy = await client.getStructures();
```

## API Documentation

### Authentication

This library uses OAuth 2.0 client credentials flow for secure authentication. You'll need to obtain credentials from Flair:

1. Create a Flair account at [my.flair.co](https://my.flair.co)
2. Access your OAuth 2.0 client credentials through the Flair App's Account Settings
3. For professional/business use, contact [partners@flair.co](mailto:partners@flair.co)

**Security Note**: Version 2.0+ uses the secure client credentials flow instead of password grants.

### Client Methods

#### Generic CRUD Operations (New in 2.0)
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

// Update resource
await client.update('vents', 'vent123', { 'percent-open': 75 });

// Delete resource
await client.delete('vents', 'vent123');
```

#### Legacy Methods (Still Supported)

##### Structure Management
- `getStructures()` - Get all structures
- `getStructure(structure)` - Get specific structure details
- `getPrimaryStructure()` - Get the primary home structure
- `setStructureMode(structure, mode)` - Set structure to Manual or Auto mode
- `setStructureHeatingCoolMode(structure, mode)` - Set heating/cooling mode
- `setStructureSetPoint(structure, tempC)` - Set structure temperature
- `setStructureWebhook(structure, callbackUrl)` - Register webhook for updates
- `setStructureActiveSchedule(structure, scheduleId)` - Set active schedule

##### Room Management
- `getRooms()` - Get all rooms
- `getRoom(room)` - Get specific room details
- `setRoomSetPoint(room, tempC)` - Set room temperature
- `setRoomAway(room, away)` - Set room occupancy

##### Vent Control
- `getVents()` - Get all vents
- `getVentReading(vent)` - Get current vent sensor readings
- `setVentPercentOpen(vent, percent)` - Control vent opening (0-100)

##### Puck Management
- `getPucks()` - Get all Pucks
- `getPuckReading(puck)` - Get current Puck sensor readings

##### HVAC Unit Control (Minisplits)
- `getHvacUnits()` - Get all HVAC units
- `getHvacUnit(hvacUnit)` - Get specific HVAC unit details
- `setHvacUnit(hvacUnit, attributes)` - Control HVAC unit settings

##### Thermostat Support
- `getThermostats()` - Get all thermostats

##### Bridge Management
- `getBridges()` - Get all bridges
- `getBridgeReading(bridge)` - Get bridge status and signal strength

##### Remote Sensors
- `getRemoteSensorReading(remoteSensor)` - Get remote sensor readings

##### User Management
- `getUsers()` - Get all users

## Webhook Support

Register a webhook to receive real-time updates:

```typescript
await client.setStructureWebhook(structure, 'https://your-domain.com/webhook');
```

Webhook events include:
- Room set point changes
- Room occupancy changes
- Temperature and humidity updates

## Models and Types

The library exports all TypeScript interfaces and enums for type-safe development:

```typescript
import {
  Structure,
  Room,
  Vent,
  Puck,
  HvacUnit,
  HvacMode,
  FanSpeed,
  FlairMode,
  StructureHeatCoolMode
} from '@jarlbrak/flair-api-ts';
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

## Commit Format

This project follows conventional commits. Please format your commits as `type(scope): message`

Types: feat, fix, docs, style, refactor, perf, test, chore, deps

## License

MIT

## Credits

This package is based on the original [flair-api-ts](https://github.com/bassrock/node-flair-api-ts) by bassrock. Version 2.0.0 represents a major update to support the latest Flair API with OAuth 2.0.

## Contributing

Pull requests are welcome! Please ensure:
- All tests pass
- Code follows the existing style (run `npm run lint`)
- Commits follow the conventional format
- New features include appropriate tests

## Changelog

### Recent Changes (Breaking)
- **BREAKING**: Package renamed from `flair-api-ts` to `@jarlbrak/flair-api-ts`
- **BREAKING**: Updated to OAuth 2.0 client credentials flow (password grants no longer supported)
- **NEW**: Generic CRUD API supporting any resource type with `get()`, `create()`, `update()`, `delete()` methods
- **NEW**: Full JSON-API specification compliance with relationship management
- **NEW**: Structured error handling with `ApiError` and `EmptyBodyError` classes
- **NEW**: Enhanced Model base class with client reference and instance methods
- Added support for HVAC units (minisplits) with full control capabilities
- Added support for thermostats, bridges, and remote sensors
- Added webhook registration for real-time updates
- Added schedule management functionality
- Enhanced Structure model with 30+ new attributes (location, setup, hold settings, etc.)
- Improved TypeScript type definitions and added new enums
- Fixed critical security vulnerability in authentication flow
- Reduced client code by ~70% while adding functionality

### Migration from 1.x
If upgrading from the original `flair-api-ts` package:
1. Update your import to use `@jarlbrak/flair-api-ts`
2. **CRITICAL**: Replace username/password authentication with client credentials:
   ```typescript
   // OLD (insecure)
   const client = new Client('client_id', 'client_secret', 'username', 'password');
   
   // NEW (secure)
   const client = new Client('client_id', 'client_secret');
   ```
3. Consider using the new generic CRUD methods for cleaner code
4. Legacy methods remain supported for backward compatibility
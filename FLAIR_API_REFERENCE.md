# Flair API Reference

A comprehensive reference for the Flair Smart Home API, extracted from the official Postman collection.

## Overview

The Flair API provides programmatic access to Flair Smart Home devices including smart vents, temperature sensors (pucks), HVAC units, thermostats, bridges, and remote sensors. The API follows JSON-API specification and uses OAuth 2.0 for authentication.

## Authentication

### OAuth 2.0 Client Credentials (Recommended)

The Flair API uses OAuth 2.0 client credentials flow for secure authentication:

1. Create a Flair account at [my.flair.co](https://my.flair.co)
2. Access your OAuth 2.0 client credentials through Account Settings
3. For business use, contact [partners@flair.co](mailto:partners@flair.co)

**Token Endpoint:** `POST /oauth/token`

```json
{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret", 
  "grant_type": "client_credentials"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## Base URL

All API endpoints are relative to: `https://api.flair.co`

## Headers

- `Accept: application/vnd.api+json`
- `Content-Type: application/json`
- `Authorization: Bearer {access_token}`

## Resource Types

The Flair API supports the following resource types:

### Core Resources

- **users** - User accounts and profiles
- **structures** - Buildings/homes containing devices
- **rooms** - Individual rooms within structures

### Device Resources

- **pucks** - Temperature and humidity sensors
- **vents** - Smart air vents with controllable dampers
- **thermostats** - Traditional and smart thermostats
- **hvac-units** - HVAC systems (including mini-splits)
- **bridges** - Communication hubs for devices
- **remote-sensors** - Additional temperature sensors

### Configuration Resources

- **schedules** - Automated scheduling rules
- **webhooks** - Real-time event notifications

## Generic CRUD Operations

All resources support standard CRUD operations following JSON-API specification:

### GET Resources

**Get all resources:**

```bash
GET /api/{resource-type}
```

**Get single resource:**

```bash
GET /api/{resource-type}/{id}
```

**Example Response:**

```json
{
  "data": {
    "id": "1",
    "type": "vents",
    "attributes": {
      "name": "Living Room Vent",
      "percent-open": 100,
      "system-mode": "auto"
    },
    "relationships": {
      "room": {
        "data": { "id": "2", "type": "rooms" }
      }
    }
  }
}
```

### POST (Create) Resources

```bash
POST /api/{resource-type}
```

**Request Body:**

```json
{
  "data": {
    "type": "{resource-type}",
    "attributes": {
      "name": "New Device"
    },
    "relationships": {
      "room": {
        "data": { "id": "1", "type": "rooms" }
      }
    }
  }
}
```

### PATCH (Update) Resources

```bash
PATCH /api/{resource-type}/{id}
```

**Request Body:**

```json
{
  "data": {
    "id": "{id}",
    "type": "{resource-type}",
    "attributes": {
      "percent-open": 50
    }
  }
}
```

### DELETE Resources

```bash
DELETE /api/{resource-type}/{id}
```

Returns `204 No Content` on success.

## Resource Attributes

### Users

- `email` - User email address
- `name` - Display name
- `created-at` - Account creation timestamp
- `updated-at` - Last modification timestamp

### Structures  

- `name` - Building/home name
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Rooms

- `name` - Room name
- `level` - Floor/level number
- `room-type` - Category (bedroom, living-room, etc.)
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Pucks (Temperature Sensors)

- `name` - Device name
- `current-temperature` - Current temperature reading (°F)
- `current-humidity` - Current humidity percentage
- `current-temperature-c` - Current temperature (°C)
- `rssi` - Signal strength
- `voltage` - Battery voltage
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Vents

- `name` - Vent name
- `percent-open` - Damper position (0-100%)
- `system-mode` - Operating mode (auto, manual)
- `rssi` - Signal strength
- `voltage` - Battery voltage
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Thermostats

- `name` - Thermostat name
- `current-temperature` - Current temperature reading
- `set-point-temperature` - Target temperature
- `system-mode` - Operating mode (heat, cool, auto, off)
- `fan-mode` - Fan setting (auto, on)
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### HVAC Units

- `name` - Unit name
- `make-model` - Manufacturer and model
- `ir-setup-enabled` - IR control availability
- `swing-mode` - Air direction control
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Bridges

- `name` - Bridge name  
- `rssi` - Signal strength
- `current-firmware-version` - Firmware version
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

### Remote Sensors

- `name` - Sensor name
- `current-temperature` - Temperature reading
- `current-humidity` - Humidity reading
- `rssi` - Signal strength
- `voltage` - Battery voltage
- `created-at` - Creation timestamp
- `updated-at` - Last modification timestamp

## Common Relationships

### Structure Relationships

- `admin-users` - Users with admin access
- `rooms` - Rooms within the structure
- `pucks` - Temperature sensors in structure
- `vents` - Vents in structure
- `hvac-units` - HVAC systems in structure

### Room Relationships  

- `structure` - Parent structure
- `pucks` - Temperature sensors in room
- `vents` - Vents in room
- `hvac-units` - HVAC units serving room

### Device Relationships

- `structure` - Parent structure
- `room` - Room containing device
- `bridge` - Communication bridge (for wireless devices)

## Error Handling

The API returns standard HTTP status codes and JSON-API error objects:

**Error Response Format:**

```json
{
  "errors": [{
    "title": "Not Found",
    "code": "404", 
    "detail": "vents resource with id 123 was not found"
  }]
}
```

**Common Status Codes:**

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to ensure fair usage. Specific limits are not publicly documented but reasonable usage patterns should not encounter limits.

## Webhooks

Webhooks can be configured to receive real-time notifications when device states change. Contact Flair support for webhook configuration details.

## Examples

### Control a Vent

```typescript
// Get all vents
const vents = await client.get('vents');

// Set vent to 50% open
await client.update('vents', vents[0].id, { 'percent-open': 50 });
```

### Read Temperature

```typescript  
// Get all pucks (temperature sensors)
const pucks = await client.get('pucks');

// Access current temperature
const temperature = pucks[0].attributes['current-temperature'];
```

### Control HVAC Unit

```typescript
// Get HVAC units
const hvacUnits = await client.get('hvac-units');

// Update system mode
await client.update('hvac-units', hvacUnits[0].id, { 
  'system-mode': 'cool',
  'set-point-temperature': 72
});
```

## SDKs and Tools

- **TypeScript/JavaScript:** [flair-api-ts](https://www.npmjs.com/package/flair-api-ts)
- **Python:** [flair-api-client-py](https://github.com/flair-systems/flair-api-client-py) (legacy OAuth 1.0)

## Support

For technical support and business partnerships:

- Email: [partners@flair.co](mailto:partners@flair.co)
- Documentation: [Official API Docs](https://documenter.getpostman.com/view/5353571/TzsbKTAG)

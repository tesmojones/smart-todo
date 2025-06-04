# WhatsApp Module

This module integrates WhatsApp Web functionality into the NestJS application using the `whatsapp-web.js` library.

## Features

- Send messages to individual contacts
- Send messages to groups
- Get list of chats
- Get list of contacts
- Real-time status monitoring
- QR code authentication

## Setup

1. The module is automatically initialized when the application starts
2. On first run, a QR code will be displayed in the console
3. Scan the QR code with your WhatsApp mobile app
4. Once authenticated, the client will be ready to send/receive messages

## API Endpoints

### GET /api/whatsapp/status
Get the current status of the WhatsApp client and QR code if authentication is needed.

**Response:**
```json
{
  "isReady": true,
  "qrCode": null
}
```

### POST /api/whatsapp/send-message
Send a message to an individual contact.

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Hello from AI Todo App!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "to": "+1234567890",
    "message": "Hello from AI Todo App!",
    "messageId": "message_id_here",
    "timestamp": 1234567890
  }
}
```

### POST /api/whatsapp/send-group-message
Send a message to a group.

**Request Body:**
```json
{
  "groupId": "1234567890-1234567890@g.us",
  "message": "Hello group from AI Todo App!"
}
```

### GET /api/whatsapp/chats
Get all chats (individual and group conversations).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890@c.us",
      "name": "John Doe",
      "isGroup": false,
      "unreadCount": 0
    }
  ]
}
```

### GET /api/whatsapp/contacts
Get all contacts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890@c.us",
      "name": "John Doe",
      "number": "1234567890",
      "isMyContact": true
    }
  ]
}
```

### GET /api/whatsapp/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "whatsapp",
  "timestamp": "2023-12-07T10:00:00.000Z"
}
```

## Phone Number Format

Phone numbers can be provided in various formats:
- `+1234567890`
- `1234567890`
- `(123) 456-7890`

The service will automatically format them correctly for WhatsApp.

## Error Handling

The module includes comprehensive error handling:
- **503 Service Unavailable**: WhatsApp client is not ready (need to scan QR code)
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: General server errors

## Authentication Persistence

The module uses `LocalAuth` strategy which saves authentication data locally. Once authenticated, you won't need to scan the QR code again unless:
- The authentication session expires
- The local auth data is deleted
- WhatsApp Web session is logged out from the mobile app

## Usage in Other Modules

You can inject the `WhatsappService` into other modules:

```typescript
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SomeOtherService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async sendNotification(phoneNumber: string, message: string) {
    return await this.whatsappService.sendMessage(phoneNumber, message);
  }
}
```

## Troubleshooting

1. **QR Code not appearing**: Check console logs for errors
2. **Authentication fails**: Try deleting the `.wwebjs_auth` folder and restart
3. **Messages not sending**: Ensure the client is ready by checking `/api/whatsapp/status`
4. **Phone number format errors**: Ensure phone numbers include country code

## Security Notes

- Keep your authentication session secure
- Don't share QR codes
- Monitor for unauthorized access
- Consider implementing rate limiting for message endpoints
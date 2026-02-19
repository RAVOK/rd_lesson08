# Testing FileRecord API with Postman

## Prerequisites

1. Start the NestJS application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

2. Ensure the database migration has been run:
```bash
# First, manually insert existing migration records if needed
# Then run:
npm run migration:run
```

## Postman Collection Setup

### Base URL
```
http://localhost:3000/files
```

## Test Cases

### 1. Create File Record (POST /files)

**Request:**
```http
POST http://localhost:3000/files
Content-Type: application/json

{
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "status": "PENDING",
  "visibility": "PRIVATE"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "status": "PENDING",
  "visibility": "PRIVATE",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:00:00.000Z"
}
```

**Test Variations:**

**Minimal required fields:**
```json
{
  "ownerId": 1,
  "key": "uploads/user1/document.pdf",
  "contentType": "application/pdf",
  "size": 512000
}
```
*Note: `status` and `visibility` will default to PENDING and PRIVATE*

**Public file:**
```json
{
  "ownerId": 1,
  "key": "uploads/public/banner.png",
  "contentType": "image/png",
  "size": 204800,
  "visibility": "PUBLIC"
}
```

**Ready status file:**
```json
{
  "ownerId": 1,
  "key": "uploads/user1/avatar.jpg",
  "contentType": "image/jpeg",
  "size": 51200,
  "status": "READY",
  "visibility": "PRIVATE"
}
```

---

### 2. Get File Record by ID (GET /files/:id)

**Request:**
```http
GET http://localhost:3000/files/1
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "status": "PENDING",
  "visibility": "PRIVATE",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:00:00.000Z"
}
```

**Error Case - Not Found (404):**
```http
GET http://localhost:3000/files/999
```

**Expected Response:**
```json
{
  "statusCode": 404,
  "message": "FileRecord with ID 999 not found",
  "error": "Not Found"
}
```

---

### 3. Get Files by Owner ID (GET /files?ownerId=X)

**Request:**
```http
GET http://localhost:3000/files?ownerId=1
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "ownerId": 1,
    "entityId": 1,
    "key": "uploads/user1/profile-photo.jpg",
    "contentType": "image/jpeg",
    "size": 102400,
    "status": "PENDING",
    "visibility": "PRIVATE",
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T09:00:00.000Z"
  },
  {
    "id": 2,
    "ownerId": 1,
    "entityId": null,
    "key": "uploads/user1/document.pdf",
    "contentType": "application/pdf",
    "size": 512000,
    "status": "PENDING",
    "visibility": "PRIVATE",
    "createdAt": "2026-02-18T09:01:00.000Z",
    "updatedAt": "2026-02-18T09:01:00.000Z"
  }
]
```

**Empty Result:**
```http
GET http://localhost:3000/files?ownerId=999
```

**Expected Response:**
```json
[]
```

---

### 4. Get Files by Entity ID (GET /files/entity/:entityId)

**Request:**
```http
GET http://localhost:3000/files/entity/1
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "ownerId": 1,
    "entityId": 1,
    "key": "uploads/user1/profile-photo.jpg",
    "contentType": "image/jpeg",
    "size": 102400,
    "status": "PENDING",
    "visibility": "PRIVATE",
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T09:00:00.000Z"
  }
]
```

---

### 5. Update File Status (PUT /files/:id/status)

**Request:**
```http
PUT http://localhost:3000/files/1/status
Content-Type: application/json

{
  "status": "READY"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "status": "READY",
  "visibility": "PRIVATE",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:05:00.000Z"
}
```

**Valid Status Values:**
- `PENDING`
- `READY`

---

### 6. Update File Visibility (PUT /files/:id/visibility)

**Request:**
```http
PUT http://localhost:3000/files/1/visibility
Content-Type: application/json

{
  "visibility": "PUBLIC"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "status": "READY",
  "visibility": "PUBLIC",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:06:00.000Z"
}
```

**Valid Visibility Values:**
- `PRIVATE`
- `PUBLIC`

---

### 7. Delete File Record (DELETE /files/:id)

**Request:**
```http
DELETE http://localhost:3000/files/1
```

**Expected Response (204 No Content):**
*Empty response body*

**Verify Deletion:**
```http
GET http://localhost:3000/files/1
```

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "FileRecord with ID 1 not found",
  "error": "Not Found"
}
```

---

## Postman Collection JSON

You can import this collection into Postman:

```json
{
  "info": {
    "name": "FileRecord API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ],
  "item": [
    {
      "name": "Create File Record",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"ownerId\": 1,\n  \"entityId\": 1,\n  \"key\": \"uploads/user1/profile-photo.jpg\",\n  \"contentType\": \"image/jpeg\",\n  \"size\": 102400,\n  \"status\": \"PENDING\",\n  \"visibility\": \"PRIVATE\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/files",
          "host": ["{{baseUrl}}"],
          "path": ["files"]
        }
      }
    },
    {
      "name": "Get File by ID",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/files/1",
          "host": ["{{baseUrl}}"],
          "path": ["files", "1"]
        }
      }
    },
    {
      "name": "Get Files by Owner",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/files?ownerId=1",
          "host": ["{{baseUrl}}"],
          "path": ["files"],
          "query": [
            {
              "key": "ownerId",
              "value": "1"
            }
          ]
        }
      }
    },
    {
      "name": "Get Files by Entity",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/files/entity/1",
          "host": ["{{baseUrl}}"],
          "path": ["files", "entity", "1"]
        }
      }
    },
    {
      "name": "Update Status",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"READY\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/files/1/status",
          "host": ["{{baseUrl}}"],
          "path": ["files", "1", "status"]
        }
      }
    },
    {
      "name": "Update Visibility",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"visibility\": \"PUBLIC\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/files/1/visibility",
          "host": ["{{baseUrl}}"],
          "path": ["files", "1", "visibility"]
        }
      }
    },
    {
      "name": "Delete File",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "{{baseUrl}}/files/1",
          "host": ["{{baseUrl}}"],
          "path": ["files", "1"]
        }
      }
    }
  ]
}
```

---

## Testing Checklist

- [ ] Create a file record with all fields
- [ ] Create a file record with minimal required fields
- [ ] Create a public file record
- [ ] Create a file with READY status
- [ ] Get a file record by ID
- [ ] Get files by owner ID
- [ ] Get files by entity ID
- [ ] Update file status from PENDING to READY
- [ ] Update file visibility from PRIVATE to PUBLIC
- [ ] Delete a file record
- [ ] Verify 404 error for non-existent file
- [ ] Test with invalid status value (should fail validation)
- [ ] Test with invalid visibility value (should fail validation)

---

## Common Issues

### Migration Not Run
If you get errors about missing tables, ensure the migration has been run:
```bash
npm run migration:run
```

### Application Not Running
Make sure the NestJS application is running:
```bash
npm run start:dev
```

### Database Connection Issues
Check your database configuration in `config/.env.local`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=course_db
DB_SCHEMA=site
```

---

## Additional Testing Tips

1. **Use Postman Environments**: Create different environments for local, dev, and prod
2. **Save Responses**: Save sample responses for documentation
3. **Automated Tests**: Add Postman tests to validate responses
4. **Collection Runner**: Run all tests in sequence with the Collection Runner
5. **Monitor Database**: Use pgAdmin or psql to verify data changes

Example Postman Test Script:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.exist;
});

pm.test("Status is PENDING", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("PENDING");
});
```

---

## Presigned URL Upload Flow

### Overview

The presigned URL upload flow allows clients to upload files directly to AWS S3 without exposing AWS credentials. The flow consists of three steps:

1. **Request Presigned URL** - Client requests a presigned upload URL from the backend
2. **Upload to S3** - Client uploads the file directly to S3 using the presigned URL
3. **Confirm Upload** - Client notifies the backend that the upload is complete (optional)

### 8. Request Presigned Upload URL (POST /files/presign)

**Prerequisites:**
- You must have a valid JWT token
- Set the token in the Authorization header: `Bearer <your-jwt-token>`

**Request:**
```http
POST http://localhost:3000/files/presign
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "fileName": "profile-photo.jpg",
  "contentType": "image/jpeg",
  "folder": "uploads/user1",
  "entityId": 1,
  "fileSize": 102400
}
```

**Request Parameters:**
- `fileName` (required): The name of the file to upload
- `contentType` (required): The MIME type of the file
- `folder` (optional): The folder path in S3 (default: "uploads")
- `entityId` (optional): ID of the entity the file belongs to (e.g., product ID)
- `fileSize` (optional): Expected file size in bytes

**Expected Response (200 OK):**
```json
{
  "fileId": 1,
  "key": "uploads/user1/20260218-abc123-profile-photo.jpg",
  "uploadUrl": "https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=3600&X-Amz-SignedHeaders=...&X-Amz-Signature=...",
  "contentType": "image/jpeg"
}
```

**Response Fields:**
- `fileId`: The ID of the created FileRecord in the database
- `key`: The S3 key where the file will be stored
- `uploadUrl`: The presigned URL for uploading the file (valid for 1 hour by default)
- `contentType`: The content type of the file

**Test Variations:**

**Minimal request (no folder or entityId):**
```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf"
}
```
*Note: The file will be stored in the default "uploads" folder*

**Upload to custom folder:**
```json
{
  "fileName": "product-image.png",
  "contentType": "image/png",
  "folder": "products/123"
}
```

**Upload with file size validation:**
```json
{
  "fileName": "large-video.mp4",
  "contentType": "video/mp4",
  "folder": "videos",
  "fileSize": 52428800
}
```

---

### 9. Upload File to S3 (PUT to presigned URL)

**Request:**
```http
PUT https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg?X-Amz-Algorithm=...
Content-Type: image/jpeg
Content-Length: 102400

<binary file data>
```

**Important Notes:**
- Use the `uploadUrl` from the presign response
- Set the `Content-Type` header to match the `contentType` from the presign response
- Send the actual file binary data in the request body
- The presigned URL is valid for 1 hour (configurable via `AWS_PRESIGN_EXPIRATION`)

**Expected Response (200 OK):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUploadResult>
  <Location>https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg</Location>
  <Bucket>your-bucket</Bucket>
  <Key>uploads/user1/20260218-abc123-profile-photo.jpg</Key>
</CompleteMultipartUploadResult>
```

---

### 10. Verify File Record (GET /files/:id)

After uploading, verify that the FileRecord was created correctly:

**Request:**
```http
GET http://localhost:3000/files/1
Authorization: Bearer <your-jwt-token>
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/20260218-abc123-profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": null,
  "status": "PENDING",
  "visibility": "PRIVATE",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:00:00.000Z"
}
```

*Note: The `size` field will be null until you update it after upload*

---

### 11. Update File Status After Upload (PUT /files/:id/status)

After successful upload to S3, update the file status to READY:

**Request:**
```http
PUT http://localhost:3000/files/1/status
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "status": "READY"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "ownerId": 1,
  "entityId": 1,
  "key": "uploads/user1/20260218-abc123-profile-photo.jpg",
  "contentType": "image/jpeg",
  "size": null,
  "status": "READY",
  "visibility": "PRIVATE",
  "createdAt": "2026-02-18T09:00:00.000Z",
  "updatedAt": "2026-02-18T09:05:00.000Z"
}
```

---

### 12. Get Download URL (GET /files/:id/download)

To get a presigned download URL for a file:

**Request:**
```http
GET http://localhost:3000/files/1/download
Authorization: Bearer <your-jwt-token>
```

**Expected Response (200 OK):**
```json
{
  "downloadUrl": "https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=3600&X-Amz-SignedHeaders=...&X-Amz-Signature=..."
}
```

**Error Case - File Not Ready (400 Bad Request):**
If the file status is not READY, you'll get an error:
```json
{
  "statusCode": 400,
  "message": "File is not ready for download",
  "error": "Bad Request"
}
```

---

## Complete Upload Flow Example

Here's a complete example of the upload flow using curl:

```bash
# Step 1: Get JWT token (assuming you have an auth endpoint)
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# Step 2: Request presigned URL
PRESIGN_RESPONSE=$(curl -X POST http://localhost:3000/files/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "profile-photo.jpg",
    "contentType": "image/jpeg",
    "folder": "uploads/user1",
    "entityId": 1
  }')

FILE_ID=$(echo $PRESIGN_RESPONSE | jq -r '.fileId')
UPLOAD_URL=$(echo $PRESIGN_RESPONSE | jq -r '.uploadUrl')

echo "File ID: $FILE_ID"
echo "Upload URL: $UPLOAD_URL"

# Step 3: Upload file to S3
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @profile-photo.jpg

# Step 4: Update file status to READY
curl -X PUT http://localhost:3000/files/$FILE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "READY"}'

# Step 5: Get download URL
curl -X GET http://localhost:3000/files/$FILE_ID/download \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection with Presigned URL Tests

Updated Postman collection including presigned URL tests:

```json
{
  "info": {
    "name": "FileRecord API with Presigned URLs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "jwtToken",
      "value": "your-jwt-token-here"
    }
  ],
  "item": [
    {
      "name": "1. Request Presigned URL",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{jwtToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fileName\": \"profile-photo.jpg\",\n  \"contentType\": \"image/jpeg\",\n  \"folder\": \"uploads/user1\",\n  \"entityId\": 1\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/files/presign",
          "host": ["{{baseUrl}}"],
          "path": ["files", "presign"]
        }
      },
      "response": []
    },
    {
      "name": "2. Upload to S3",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "image/jpeg"
          }
        ],
        "body": {
          "mode": "file",
          "file": {
            "src": "/path/to/your/file.jpg"
          }
        },
        "url": {
          "raw": "{{uploadUrl}}",
          "host": ["{{uploadUrl}}"]
        }
      },
      "response": []
    },
    {
      "name": "3. Update Status to READY",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{jwtToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"READY\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/files/{{fileId}}/status",
          "host": ["{{baseUrl}}"],
          "path": ["files", "{{fileId}}", "status"]
        }
      },
      "response": []
    },
    {
      "name": "4. Get Download URL",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwtToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/files/{{fileId}}/download",
          "host": ["{{baseUrl}}"],
          "path": ["files", "{{fileId}}", "download"]
        }
      },
      "response": []
    }
  ]
}
```

---

## Updated Testing Checklist

### Basic CRUD Operations
- [ ] Create a file record with all fields
- [ ] Create a file record with minimal required fields
- [ ] Create a public file record
- [ ] Create a file with READY status
- [ ] Get a file record by ID
- [ ] Get files by owner ID
- [ ] Get files by entity ID
- [ ] Update file status from PENDING to READY
- [ ] Update file visibility from PRIVATE to PUBLIC
- [ ] Delete a file record
- [ ] Verify 404 error for non-existent file
- [ ] Test with invalid status value (should fail validation)
- [ ] Test with invalid visibility value (should fail validation)

### Presigned URL Upload Flow
- [ ] Request presigned URL with all parameters
- [ ] Request presigned URL with minimal parameters
- [ ] Request presigned URL with custom folder
- [ ] Request presigned URL with file size
- [ ] Upload file to S3 using presigned URL
- [ ] Verify FileRecord created with PENDING status
- [ ] Update file status to READY after upload
- [ ] Get download URL for READY file
- [ ] Test download URL error for PENDING file
- [ ] Test presigned URL expiration (wait 1 hour)
- [ ] Test unauthorized access (no JWT token)
- [ ] Test invalid JWT token

---

## Common Issues

### AWS Credentials Not Configured
If you get errors about AWS credentials, ensure you've configured them in `config/.env.dev`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your-bucket-name
AWS_PRESIGN_EXPIRATION=3600
```

### S3 Bucket Not Accessible
Ensure your S3 bucket:
- Exists and is accessible
- Has proper CORS configuration
- Has the correct IAM permissions for your AWS credentials

### JWT Token Missing
The presign endpoint requires authentication. Make sure to:
- Include the `Authorization: Bearer <token>` header
- Use a valid JWT token from your auth endpoint

### Presigned URL Expired
Presigned URLs expire after the configured time (default: 1 hour). If you get an expired error:
- Request a new presigned URL
- Or increase `AWS_PRESIGN_EXPIRATION` in your environment config

### Content Type Mismatch
When uploading to S3, ensure the `Content-Type` header matches the `contentType` from the presign response exactly.

---

## Security Considerations

1. **Never expose AWS credentials** - Presigned URLs allow secure uploads without exposing credentials
2. **Validate file types** - Always validate `contentType` on the backend
3. **Limit file sizes** - Implement size limits to prevent abuse
4. **Use HTTPS** - Always use HTTPS for presigned URLs
5. **Set appropriate expiration** - Don't make presigned URLs valid for too long
6. **Verify ownership** - Ensure users can only access their own files

---

## Performance Tips

1. **Use CDN** - Configure CloudFront or another CDN for faster downloads
2. **Optimize images** - Compress images before upload
3. **Use multipart upload** - For large files (>100MB), use multipart upload
4. **Cache presigned URLs** - Cache presigned URLs for short periods if needed
5. **Monitor S3 costs** - Track S3 usage and costs
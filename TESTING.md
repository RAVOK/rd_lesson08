# Як протестувати Files/Storage API

## 📋 Передумови (Prerequisites)

Перед початком тестування переконайтеся, що:

1. **Встановлені залежності:**
   ```bash
   npm install
   ```

2. **Налаштована база даних PostgreSQL:**
   - Переконайтеся, що PostgreSQL запущений
   - Створіть базу даних (наприклад, `course_db`)
   - Налаштуйте з'єднання в `config/.env.local`

3. **Налаштований AWS S3:**
   - Створіть S3 bucket
   - Отримайте AWS credentials (Access Key ID та Secret Access Key)
   - Налаштуйте CORS для bucket (див. нижче)

4. **Запущена міграція:**
   ```bash
   npm run migration:run
   ```

---

## 🚀 Запуск додатку

Запустіть додаток в режимі розробки:
```bash
npm run start:dev
```

API буде доступний за адресою: `http://localhost:3000`

---

## 🔐 Отримання JWT токена

Більшість ендпоінтів вимагають JWT аутентифікації. Спочатку отримайте токен:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

Збережіть отриманий `access_token` для використання в наступних запитах.

---

## 📝 Тестування з Postman

### 1. Імпорт колекції

Імпортуйте колекцію з `src/files/TESTING.md` або створіть нову:

**Base URL:** `http://localhost:3000`

### 2. Налаштування змінних

Створіть змінні в Postman Environment:
- `baseUrl`: `http://localhost:3000`
- `jwtToken`: ваш JWT токен

### 3. Тестування ендпоінтів

#### 3.1. Запит presigned URL для завантаження

**Request:**
```http
POST {{baseUrl}}/files/presign
Content-Type: application/json
Authorization: Bearer {{jwtToken}}

{
  "fileName": "profile-photo.jpg",
  "contentType": "image/jpeg",
  "folder": "uploads/user1",
  "entityId": 1
}
```

**Expected Response (200 OK):**
```json
{
  "fileId": 1,
  "key": "uploads/user1/20260218-abc123-profile-photo.jpg",
  "uploadUrl": "https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg?X-Amz-Algorithm=...",
  "contentType": "image/jpeg"
}
```

#### 3.2. Завантаження файлу в S3

Використайте `uploadUrl` з попереднього відповіді:

**Request:**
```http
PUT {{uploadUrl}}
Content-Type: image/jpeg

<binary file data>
```

**Expected Response (200 OK):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUploadResult>
  <Location>https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg</Location>
  <Bucket>your-bucket</Bucket>
  <Key>uploads/user1/20260218-abc123-profile-photo.jpg</Key>
</CompleteMultipartUploadResult>
```

#### 3.3. Оновлення статусу файлу

**Request:**
```http
PUT {{baseUrl}}/files/{{fileId}}/status
Content-Type: application/json
Authorization: Bearer {{jwtToken}}

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

#### 3.4. Отримання download URL

**Request:**
```http
GET {{baseUrl}}/files/{{fileId}}/download
Authorization: Bearer {{jwtToken}}
```

**Expected Response (200 OK):**
```json
{
  "downloadUrl": "https://your-bucket.s3.amazonaws.com/uploads/user1/20260218-abc123-profile-photo.jpg?X-Amz-Algorithm=..."
}
```

---

## 🖥️ Тестування з curl

### Повний цикл завантаження файлу

```bash
# 1. Отримання JWT токена
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

echo "JWT Token: $TOKEN"

# 2. Запит presigned URL
PRESIGN_RESPONSE=$(curl -s -X POST http://localhost:3000/files/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "test-image.jpg",
    "contentType": "image/jpeg",
    "folder": "uploads/test"
  }')

FILE_ID=$(echo $PRESIGN_RESPONSE | jq -r '.fileId')
UPLOAD_URL=$(echo $PRESIGN_RESPONSE | jq -r '.uploadUrl')
KEY=$(echo $PRESIGN_RESPONSE | jq -r '.key')

echo "File ID: $FILE_ID"
echo "S3 Key: $KEY"
echo "Upload URL: $UPLOAD_URL"

# 3. Завантаження файлу в S3
echo "Uploading file to S3..."
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test-image.jpg

echo "File uploaded successfully!"

# 4. Оновлення статусу на READY
echo "Updating file status to READY..."
curl -X PUT http://localhost:3000/files/$FILE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "READY"}'

# 5. Отримання download URL
echo "Getting download URL..."
curl -X GET http://localhost:3000/files/$FILE_ID/download \
  -H "Authorization: Bearer $TOKEN"

# 6. Перевірка запису в базі даних
echo "Checking file record in database..."
curl -X GET http://localhost:3000/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🗄️ Перевірка бази даних

### Використання psql

```bash
# Підключення до бази даних
psql -U postgres -d course_db

# Перехід до схеми
SET search_path TO site;

# Перегляд всіх файлів
SELECT * FROM s_file_record;

# Перегляд файлів конкретного користувача
SELECT * FROM s_file_record WHERE "ownerId" = 1;

# Перегляд файлів за статусом
SELECT * FROM s_file_record WHERE status = 'PENDING';

# Перегляд файлів за видимістю
SELECT * FROM s_file_record WHERE visibility = 'PUBLIC';
```

### Використання pgAdmin

1. Відкрийте pgAdmin
2. Підключіться до бази даних `course_db`
3. Перейдіть до схеми `site`
4. Відкрийте таблицю `s_file_record`
5. Перегляньте дані в браузері таблиць

---

## 🧪 Тестові сценарії

### Сценарій 1: Завантаження зображення профілю

```bash
# 1. Запит presigned URL
curl -X POST http://localhost:3000/files/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "profile.jpg",
    "contentType": "image/jpeg",
    "folder": "uploads/profiles",
    "entityId": 1
  }'

# 2. Завантаження файлу
curl -X PUT "<upload_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @profile.jpg

# 3. Оновлення статусу
curl -X PUT http://localhost:3000/files/<file_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "READY"}'
```

### Сценарій 2: Завантаження документа

```bash
# 1. Запит presigned URL
curl -X POST http://localhost:3000/files/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "contract.pdf",
    "contentType": "application/pdf",
    "folder": "uploads/documents"
  }'

# 2. Завантаження файлу
curl -X PUT "<upload_url>" \
  -H "Content-Type: application/pdf" \
  --data-binary @contract.pdf
```

### Сценарій 3: Публічний файл

```bash
# 1. Створення публічного файлу
curl -X POST http://localhost:3000/files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ownerId": 1,
    "key": "uploads/public/banner.png",
    "contentType": "image/png",
    "size": 204800,
    "visibility": "PUBLIC"
  }'
```

---

## ⚠️ Поширені помилки та їх вирішення

### Помилка 1: "Migration not run"

**Симптом:** Помилка про відсутність таблиці `s_file_record`

**Рішення:**
```bash
npm run migration:run
```

### Помилка 2: "AWS credentials not configured"

**Симптом:** Помилка про відсутність AWS credentials

**Рішення:**
Перевірте `config/.env.dev`:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your-bucket-name
```

### Помилка 3: "Unauthorized" (401)

**Симптом:** Помилка авторизації при запиті до `/files/presign`

**Рішення:**
Переконайтеся, що:
- JWT токен дійсний
- Токен передається в заголовку `Authorization: Bearer <token>`
- Токен не закінчився

### Помилка 4: "Presigned URL expired"

**Симптом:** Помилка при завантаженні в S3

**Рішення:**
- Запитайте новий presigned URL
- Або збільште `AWS_PRESIGN_EXPIRATION` в конфігурації

### Помилка 5: "Content-Type mismatch"

**Симптом:** Помилка при завантаженні в S3

**Рішення:**
Переконайтеся, що `Content-Type` в запиті до S3 збігається з `contentType` з presign відповіді.

---

## 🔧 Налаштування CORS для S3 Bucket

Для того, щоб клієнт міг завантажувати файли напряму в S3, налаштуйте CORS:

1. Відкрийте AWS Console → S3 → ваш bucket
2. Перейдіть до вкладки "Permissions"
3. Прокрутіть до "Cross-origin resource sharing (CORS)"
4. Додайте наступну конфігурацію:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "PUT",
      "POST",
      "GET",
      "DELETE"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

**Примітка:** У продакшені замініть `"*"` на конкретні домени.

---

## 📊 Перевірка результатів

### Перевірка в S3

1. Відкрийте AWS Console → S3 → ваш bucket
2. Перейдіть до папки `uploads/`
3. Переконайтеся, що файл завантажено
4. Перевірте metadata файлу

### Перевірка в базі даних

```bash
# Підключення до бази даних
psql -U postgres -d course_db

# Перегляд останніх записів
SELECT id, "ownerId", "entityId", key, "contentType", status, visibility 
FROM s_file_record 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Перевірка через API

```bash
# Отримання всіх файлів користувача
curl -X GET "http://localhost:3000/files?ownerId=1" \
  -H "Authorization: Bearer $TOKEN"

# Отримання файлу за ID
curl -X GET "http://localhost:3000/files/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Чек-лист тестування

- [ ] Додаток запущено (`npm run start:dev`)
- [ ] Міграція виконана (`npm run migration:run`)
- [ ] AWS credentials налаштовані
- [ ] JWT токен отримано
- [ ] Presigned URL запитано успішно
- [ ] Файл завантажено в S3
- [ ] Статус файлу оновлено на READY
- [ ] Download URL отримано успішно
- [ ] Запис створено в базі даних
- [ ] Файл видно в S3 bucket
- [ ] CORS налаштовано для S3

---

## 🎯 Наступні кроки

Після успішного тестування:

1. **Додайте валідацію розміру файлу** на бекенді
2. **Реалізуйте видалення файлів** з S3 при видаленні запису
3. **Додайте обробку помилок** для S3 operations
4. **Налаштуйте логування** для відстеження завантажень
5. **Додайте rate limiting** для запитів presigned URL
6. **Реалізуйте webhook** для сповіщень про завершення завантаження

---

## 📚 Додаткові ресурси

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Postman Documentation](https://learning.postman.com/)
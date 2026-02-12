1.3. Захист від oversell (конкурентність)
  pessimistic locking - най простіше
1.4. Обробка помилок

## Error Handling

- Недостатній stock: 409 Conflict (бізнес-помилка).
- Duplicate idempotencyKey: повертається існуюче замовлення з кодом 200 OK.
- Інші помилки: rollback транзакції та 500 Internal Server Error.

2.1 Обираємо “гарячий” запит
    SELECT o.id, o.total, o.created_at, u.name, u.email,
          i.quantity, i.price, p.name, p.price
    FROM site.s_order o
    JOIN site.s_user u ON u.id = o.user_id
    JOIN site.s_order_item i ON i.order_id = o.id
    JOIN site.s_product p ON p.id = i.product_id
    WHERE o.created_at >= '2026-01-01'
    ORDER BY o.created_at DESC;
        використовується Seq Scan по s_order, бо немає індексу на created_at.
        -- індекс для швидкої фільтрації замовлень за датою
        CREATE INDEX idx_order_created_at ON site.s_order(created_at);
        -- індекс для швидкого пошуку items по order_id
        CREATE INDEX idx_order_item_order_id ON site.s_order_item(order_id);
        -- індекс для швидкого пошуку продуктів по id
        CREATE INDEX idx_product_id ON site.s_product(id);

Оптимізаці: було 140мс, стало 50мс

### GraphQL

Для інтеграції GraphQL у NestJS було обрано **code‑first підхід** з використанням декораторів (`@nestjs/graphql`). Оскільки проєкт уже активно використовує TypeScript та декоратори (DTO, Entities, модулі), code‑first дозволяє описувати схему безпосередньо в коді, отримувати автогенеровану `.gql`‑схему та тримати типи, резолвери й бізнес‑логіку синхронізованими в одному місці. Це спрощує рефакторинг, зменшує ризики розсинхронізації між кодом і схемою та краще вписується в існуючу архітектуру, ніж окремі `.graphql` файли (schema‑first).


http://localhost:4000/products
http://localhost:4000/users       http://localhost:4000/users/2
http://localhost:4000/orders
http://localhost:4000/order-items

Migration:
npx ts-node ./node_modules/typeorm/cli.js migration:generate src/migrations/InitSchema -d src/database/migration-data-source.ts


МЕТА

Проєкт побудований на NestJS з акцентом на модульність, масштабованість та зрозумілість. Основна ідея архітектури полягає в тому, щоб кожна бізнес‑область була ізольована в окремому модулі, а конфігурація середовища була централізованою та легко керованою. Це дозволяє швидко розширювати систему, підтримувати її у довгостроковій перспективі та робити зрозумілою для нових розробників.

Поки бачу, що це буде API сервер.

ЗАГАЛЬНА АРХІТЕКТУРА

- main.ts — точка входу, де запускається NestJS, підключається конфігурація та документація.
- app.module.ts — головний модуль, який збирає всі інші модулі.
- config/ — папка для конфігурації середовищ (local, dev, prod). Тут зберігаються файли для налаштувань додатку та бази даних.
- users/ — модуль користувачів. Містить контролер, сервіс, DTO та сутності.
- docs/ - модуль документацій API, планую на Swagger
- shared/ - модуль, який містить спільні утіліти. Планую додати щось для логування подій
- autorization/ - модуль авторизації, щось типу прийому login/password та видача token
- security/ - модуль контролю запитів, верифікація токенів, перевірка повноважень

СКЛАД МОДУЛІВ

- Модулі — кожна бізнес‑область винесена окремо, що дозволяє ізолювати логіку та уникати плутанини.
- Контролери — відповідають за прийом HTTP‑запитів і повертають дані у стандартизованому форматі.
- Сервіси — містять бізнес‑логіку. Контролери делегують роботу сервісам, що забезпечує розділення відповідальностей.
- DTO та Entities — DTO описують структуру даних для запитів і відповідей, Entities — моделі даних у базі.

З бізнес моделлю ще не визначився. Хотів би зробити міні CRM

ТЕХНІЧНА ІНФОРМАЦІЯ

  Запуск серверу:
    npm run start:<ENV>
    Кожний ENV посилається на відповідний файл конфігурації. Для роботи зі змінними оточення використаний: cross-env
    доступні ENV:
      local (.env.local)
      dev   (.env.dev)
      debag (.env.dev)
      prod  (.env.prod)
    Кожний ENV посилається на відповідний файл конфігурації .env.dev/
### 1.1 GraphQL module

У додатку підключено GraphQL через `@nestjs/graphql` та `@nestjs/apollo` з драйвером Apollo і Express 5 (`@as-integrations/express5`). GraphQL модуль налаштовано в `AppModule` з endpoint `/graphql`, а схему будуємо у **code‑first підході**: типи і резолвери описуються декораторами TypeScript, а файл `schema.gql` генерується автоматично.

**Чому code‑first:** проєкт уже використовує TypeScript, декоратори та DTO/Entities, тому опис типів прямо в коді дозволяє тримати бізнес‑логіку, типи та GraphQL‑схему синхронізованими в одному місці. Це спрощує рефакторинг, зменшує ризик розсинхронізації між кодом і `.graphql` файлами та краще вписується в модульну NestJS‑архітектуру, ніж schema‑first з окремими файлами схеми.

Після запуску сервера GraphQL Playground доступний за адресою:
POST: http://localhost:4000/graphql
Тестовий запит:
{
    "query": "{ hello }"
}

### 2.1 Типи домену
GraphQL‑типи домену винесені в окремі файли
• Order → OrderType у src/graphQL/types/order.type.ts
• OrderItem → OrderItemType у src/graphQL/types/order-item.type.ts
• Product → ProductType у src/graphQL/types/product.type.ts

Звʼязки в схемі виконані за вимогами
    Order.items: [OrderItem!]!
    у OrderType: @Field(() => [OrderItemType]) items: OrderItemType[];
    у сервісі завантажуються relations: ['items', 'items.product', 'user'], щоб не було null усередині списку.
    OrderItem.product: Product!
    у OrderItemType: @Field(() => ProductType) product: ProductType; (не nullable).
Enum для статусу замовлення
    В БД є тип order_status, у entity Order.status: OrderStatus.
    В order.type.ts використовується той самий enum з entity
Non‑null (через @Field() без nullable: true) там, де поле обовʼязкове для домену:
    OrderType: id, items, total, idempotencyKey, customerName, status, createdAt, updatedAt.
    OrderItemType: id, quantity, price, product, created_at, updated_at.
    ProductType: id, name, price, stock, created_at, updated_at.
Nullable тільки там, де це продиктовано реальними даними:
    Синтетично! OrderType.user nullable: true, бо в БД реально є замовлення без user → щоб GraphQL не падав, а віддавав user: null.

http://localhost:4000/graphql
{
  "query": "{ orders { id total status customerName user { id email } items { id quantity price product { id name price } } } }"
}

### 2.2 Input types
Створено OrdersFilterInput (src/graphQL/types/orders-filter.input.ts):
    status?: OrderStatus
    dateFrom?: Date → в схемі це DateTime
    dateTo?: Date → в схемі це DateTime
Створено OrdersPaginationInput (src/graphQL/types/orders-pagination.input.ts):
    limit?: number
    offset?: number
Підключено input‑типи до GraphQL‑схеми:
    В orders.resolver.ts запит orders тепер приймає аргументи
        filter?: OrdersFilterInput і pagination?: OrdersPaginationInput.
Реалізовано фільтрацію та пагінацію в сервісі:
    Додано метод getOrders(filter, pagination) у OrdersService, який через QueryBuilder:
        фільтрує за status, createdAt >= dateFrom, createdAt <= dateTo;
        застосовує пагінацію через take(limit) і skip(offset).

http://localhost:4000/graphql
{
  "query": "query TestOrders($filter: OrdersFilterInput, $pagination: OrdersPaginationInput) { orders(filter: $filter, pagination: $pagination) { id status createdAt total } }",
  "variables": {
    "filter": {
      "status": "PENDING",
      "dateFrom": "2026-02-08T00:00:00.000Z",
      "dateTo": "2026-02-09T00:00:00.000Z"
    },
    "pagination": {
      "limit": 3,
      "offset": 0
    }
  }
}

### 3.1 Query orders

{
  "query": "query TestOrders($filter: OrdersFilterInput, $pagination: OrdersPaginationInput) { orders(filter: $filter, pagination: $pagination) { id status createdAt total items {quantityproduct {  id  title  price} } } }",
  "variables": {
    "filter": {
      "status": "PENDING",
      "dateFrom": "2026-02-08T00:00:00.000Z",
      "dateTo": "2026-02-09T00:00:00.000Z"
    },
    "pagination": {
      "limit": 3,
      "offset": 0
    }
  }
}

responce:
{
    "data": {
        "orders": [
            {
                "id": "1",
                "status": "PENDING",
                "createdAt": "2026-02-08T12:53:19.029Z",
                "total": 2600,
                "items": [
                    {
                        "quantity": 2,
                        "product": {
                            "id": "4",
                            "title": "Monitor LG 27\"",
                            "price": 400
                        }
                    },
                    {
                        "quantity": 2,
                        "product": {
                            "id": "2",
                            "title": "Smartphone Samsung",
                            "price": 800
                        }
                    },
                    {
                        "quantity": 2,
                        "product": {
                            "id": "5",
                            "title": "Keyboard Logitech",
                            "price": 100
                        }
                    }
                ]
            },
            {
                "id": "2",
                "status": "PENDING",
                "createdAt": "2026-02-08T12:53:19.054Z",
                "total": 1680,
                "items": [
                    {
                        "quantity": 1,
                        "product": {
                            "id": "2",
                            "title": "Smartphone Samsung",
                            "price": 800
                        }
                    },
                    {
                        "quantity": 2,
                        "product": {
                            "id": "4",
                            "title": "Monitor LG 27\"",
                            "price": 400
                        }
                    },
                    {
                        "quantity": 1,
                        "product": {
                            "id": "6",
                            "title": "Mouse Razer",
                            "price": 80
                        }
                    }
                ]
            },
            {
                "id": "3",
                "status": "PENDING",
                "createdAt": "2026-02-08T12:53:19.067Z",
                "total": 4080,
                "items": [
                    {
                        "quantity": 1,
                        "product": {
                            "id": "4",
                            "title": "Monitor LG 27\"",
                            "price": 400
                        }
                    },
                    {
                        "quantity": 3,
                        "product": {
                            "id": "1",
                            "title": "Laptop Lenovo",
                            "price": 1200
                        }
                    },
                    {
                        "quantity": 1,
                        "product": {
                            "id": "6",
                            "title": "Mouse Razer",
                            "price": 80
                        }
                    }
                ]
            }
        ]
    }
}
### 3.2 Формат відповіді для pagination
Обраний варіант:Relay Connection Pattern (`OrdersConnection`)

Клієнт отримує `totalCount` для розрахунку кількості сторінок
`pageInfo` дає інформацію про наявність наступної/попередньої сторінки
Стандарт GraphQL (Relay specification)
Масштабується краще за простий offset-based підхід

Приклад запиту:
{
  "query": "query TestOrdersConnection($filter: OrdersFilterInput, $pagination: OrdersPaginationInput) { ordersConnection(filter: $filter, pagination: $pagination) { nodes { id status createdAt total items { quantity product { id title price } } } totalCount pageInfo { hasNextPage hasPreviousPage startCursor endCursor } } }",
  "variables": {
    "filter": { "status": "PENDING" },
    "pagination": { "limit": 3, "offset": 0 }
  }
}
Відповідь:
{
    "data": {
        "ordersConnection": {
            "nodes": [
                {
                    "id": "1",
                    "status": "PENDING",
                    "createdAt": "2026-02-08T12:53:19.029Z",
                    "total": 2600,
                    "items": [
                        {
                            "quantity": 2,
                            "product": {
                                "id": "4",
                                "title": "Monitor LG 27\"",
                                "price": 400
                            }
                        },
                        {
                            "quantity": 2,
                            "product": {
                                "id": "2",
                                "title": "Smartphone Samsung",
                                "price": 800
                            }
                        },
                        {
                            "quantity": 2,
                            "product": {
                                "id": "5",
                                "title": "Keyboard Logitech",
                                "price": 100
                            }
                        }
                    ]
                },
                {
                    "id": "2",
                    "status": "PENDING",
                    "createdAt": "2026-02-08T12:53:19.054Z",
                    "total": 1680,
                    "items": [
                        {
                            "quantity": 1,
                            "product": {
                                "id": "2",
                                "title": "Smartphone Samsung",
                                "price": 800
                            }
                        },
                        {
                            "quantity": 2,
                            "product": {
                                "id": "4",
                                "title": "Monitor LG 27\"",
                                "price": 400
                            }
                        },
                        {
                            "quantity": 1,
                            "product": {
                                "id": "6",
                                "title": "Mouse Razer",
                                "price": 80
                            }
                        }
                    ]
                },
                {
                    "id": "3",
                    "status": "PENDING",
                    "createdAt": "2026-02-08T12:53:19.067Z",
                    "total": 4080,
                    "items": [
                        {
                            "quantity": 1,
                            "product": {
                                "id": "4",
                                "title": "Monitor LG 27\"",
                                "price": 400
                            }
                        },
                        {
                            "quantity": 3,
                            "product": {
                                "id": "1",
                                "title": "Laptop Lenovo",
                                "price": 1200
                            }
                        },
                        {
                            "quantity": 1,
                            "product": {
                                "id": "6",
                                "title": "Mouse Razer",
                                "price": 80
                            }
                        }
                    ]
                }
            ],
            "totalCount": 7,
            "pageInfo": {
                "hasNextPage": true,
                "hasPreviousPage": false,
                "startCursor": "b2Zmc2V0OjA=",
                "endCursor": "b2Zmc2V0OjM="
            }
        }
    }
}
### 4.1 Виявити N+1
Я розумію що очікуємо N+1 і звідки вони повінні взятися. Але поточна реалізація не тягне поштучно дочірні сутності, а достає їх джоіном.

Отримані скрипти:
1. кількість ордерів, для `totalCount`
2. отримання ідентифікаторів замовлень відповідно до `"pagination": { "limit": 3, "offset": 0 }`
3. отримання інформації по замовленням (з дочірніми сутностями) та обмеженням order id = даним з п.2

Запит 1
SELECT COUNT(1) AS "cnt" FROM "site"."s_order" "order" WHERE "order"."status" = $1 -- PARAMETERS: ["PENDING"]

Запит 2
SELECT DISTINCT "distinctAlias"."order_id" AS "ids_order_id"
FROM
  (SELECT "order"."id" AS "order_id",
          "order"."total" AS "order_total",
          "order"."idempotencyKey" AS "order_idempotencyKey",
          "order"."customer_name" AS "order_customer_name",
          "order"."status" AS "order_status",
          "order"."created_at" AS "order_created_at",
          "order"."updated_at" AS "order_updated_at",
          "order"."user_id" AS "order_user_id",
          "items"."id" AS "items_id",
          "items"."quantity" AS "items_quantity",
          "items"."price" AS "items_price",
          "items"."created_at" AS "items_created_at",
          "items"."updated_at" AS "items_updated_at",
          "items"."order_id" AS "items_order_id",
          "items"."product_id" AS "items_product_id",
          "product"."id" AS "product_id",
          "product"."name" AS "product_name",
          "product"."price" AS "product_price",
          "product"."stock" AS "product_stock",
          "product"."created_at" AS "product_created_at",
          "product"."updated_at" AS "product_updated_at",
          "user"."id" AS "user_id",
          "user"."email" AS "user_email",
          "user"."name" AS "user_name",
          "user"."password" AS "user_password"
   FROM "site"."s_order" "order"
   LEFT JOIN "site"."s_order_item" "items" ON "items"."order_id"="order"."id"
   LEFT JOIN "site"."s_product" "product" ON "product"."id"="items"."product_id"
   LEFT JOIN "site"."s_user" "user" ON "user"."id"="order"."user_id"
   WHERE "order"."status" = $1) "distinctAlias"
ORDER BY "order_id" ASC
LIMIT 3
OFFSET 0 -- PARAMETERS: ["PENDING"]

Запит3
SELECT "order"."id" AS "order_id",
       "order"."total" AS "order_total",
       "order"."idempotencyKey" AS "order_idempotencyKey",
       "order"."customer_name" AS "order_customer_name",
       "order"."status" AS "order_status",
       "order"."created_at" AS "order_created_at",
       "order"."updated_at" AS "order_updated_at",
       "order"."user_id" AS "order_user_id",
       "items"."id" AS "items_id",
       "items"."quantity" AS "items_quantity",
       "items"."price" AS "items_price",
       "items"."created_at" AS "items_created_at",
       "items"."updated_at" AS "items_updated_at",
       "items"."order_id" AS "items_order_id",
       "items"."product_id" AS "items_product_id",
       "product"."id" AS "product_id",
       "product"."name" AS "product_name",
       "product"."price" AS "product_price",
       "product"."stock" AS "product_stock",
       "product"."created_at" AS "product_created_at",
       "product"."updated_at" AS "product_updated_at",
       "user"."id" AS "user_id",
       "user"."email" AS "user_email",
       "user"."name" AS "user_name",
       "user"."password" AS "user_password"
FROM "site"."s_order" "order"
LEFT JOIN "site"."s_order_item" "items" ON "items"."order_id"="order"."id"
LEFT JOIN "site"."s_product" "product" ON "product"."id"="items"."product_id"
LEFT JOIN "site"."s_user" "user" ON "user"."id"="order"."user_id"
WHERE ("order"."status" = $1)
  AND ("order"."id" IN (1,
                        2,
                        3)) -- PARAMETERS: ["PENDING"]

### 4.2 Реалізувати DataLoader
Додано фабрику DataLoader:
    файл: product.loader.ts
Поставлено DataLoader в контекст GraphQL:
    файл: graphql.module.ts (context створює loaders.productLoader на кожен request через 
    scope «one loader per request».
Змінено резолвер для OrderItem:
    файл: src/order-items/order-items.resolver.ts

### 4.3 Доказ, що N+1 зник
N+1 відсутній:
Усього 2 sql запити:
1. отримання ідентифікаторів замовлень з урахуванням пагінації
2. отримання результуючого запиту


Запит:
{
  "query": "query TestDataLoader($pagination: OrdersPaginationInput) { orders(pagination: $pagination) { id items { quantity product { id title price } } } }",
  "variables": {
    "pagination": { "limit": 2, "offset": 0 }
  }
}
Відповідь:
{"data":{"orders":[{"id":"2","items":[{"quantity":1,"product":{"id":"6","title":"Mouse Razer","price":80}},{"quantity":2,"product":{"id":"4","title":"Monitor LG 27\"","price":400}},{"quantity":1,"product":{"id":"2","title":"Smartphone Samsung","price":800}}]},{"id":"1","items":[{"quantity":2,"product":{"id":"5","title":"Keyboard Logitech","price":100}},{"quantity":2,"product":{"id":"2","title":"Smartphone Samsung","price":800}},{"quantity":2,"product":{"id":"4","title":"Monitor LG 27\"","price":400}}]}]}}

SQL:
Запит 1
SELECT DISTINCT "distinctAlias"."order_id" AS "ids_order_id"
FROM
  (SELECT "order"."id" AS "order_id",
          "order"."total" AS "order_total",
          "order"."idempotencyKey" AS "order_idempotencyKey",
          "order"."customer_name" AS "order_customer_name",
          "order"."status" AS "order_status",
          "order"."created_at" AS "order_created_at",
          "order"."updated_at" AS "order_updated_at",
          "order"."user_id" AS "order_user_id",
          "items"."id" AS "items_id",
          "items"."quantity" AS "items_quantity",
          "items"."price" AS "items_price",
          "items"."created_at" AS "items_created_at",
          "items"."updated_at" AS "items_updated_at",
          "items"."order_id" AS "items_order_id",
          "items"."product_id" AS "items_product_id",
          "product"."id" AS "product_id",
          "product"."name" AS "product_name",
          "product"."price" AS "product_price",
          "product"."stock" AS "product_stock",
          "product"."created_at" AS "product_created_at",
          "product"."updated_at" AS "product_updated_at",
          "user"."id" AS "user_id",
          "user"."email" AS "user_email",
          "user"."name" AS "user_name",
          "user"."password" AS "user_password"
   FROM "site"."s_order" "order"
   LEFT JOIN "site"."s_order_item" "items" ON "items"."order_id"="order"."id"
   LEFT JOIN "site"."s_product" "product" ON "product"."id"="items"."product_id"
   LEFT JOIN "site"."s_user" "user" ON "user"."id"="order"."user_id") "distinctAlias"
ORDER BY "order_id" ASC
LIMIT 2
OFFSET 0

Запит 2
SELECT "order"."id" AS "order_id",
       "order"."total" AS "order_total",
       "order"."idempotencyKey" AS "order_idempotencyKey",
       "order"."customer_name" AS "order_customer_name",
       "order"."status" AS "order_status",
       "order"."created_at" AS "order_created_at",
       "order"."updated_at" AS "order_updated_at",
       "order"."user_id" AS "order_user_id",
       "items"."id" AS "items_id",
       "items"."quantity" AS "items_quantity",
       "items"."price" AS "items_price",
       "items"."created_at" AS "items_created_at",
       "items"."updated_at" AS "items_updated_at",
       "items"."order_id" AS "items_order_id",
       "items"."product_id" AS "items_product_id",
       "product"."id" AS "product_id",
       "product"."name" AS "product_name",
       "product"."price" AS "product_price",
       "product"."stock" AS "product_stock",
       "product"."created_at" AS "product_created_at",
       "product"."updated_at" AS "product_updated_at",
       "user"."id" AS "user_id",
       "user"."email" AS "user_email",
       "user"."name" AS "user_name",
       "user"."password" AS "user_password"
FROM "site"."s_order" "order"
LEFT JOIN "site"."s_order_item" "items" ON "items"."order_id"="order"."id"
LEFT JOIN "site"."s_product" "product" ON "product"."id"="items"."product_id"
LEFT JOIN "site"."s_user" "user" ON "user"."id"="order"."user_id"
WHERE "order"."id" IN (1,
                       2)

### 5 — Error handling
Валідація input через class-validator + DTOs:
    orders-filter.input.ts
    orders-pagination.input.ts
    Додано global ValidationPipe в src/main.ts.
    GraphQL конфіг: форматування помилок (debug: false, formatError) — коротке повідомлення клієнту      логування в сервісі (Logger.error).
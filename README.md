# 🎯 Prisma Learning Project - Підготовка до співбесіди Node.js Middle

Цей проєкт створений для вивчення **Prisma ORM** з **PostgreSQL** для підготовки до співбесіди на позицію Node.js Middle Developer.

## 📚 Що ви вивчите

- **Основи Prisma ORM** - схема, міграції, клієнт
- **CRUD операції** - Create, Read, Update, Delete
- **Складні запити** - relations, filtering, aggregation
- **Продвинуті техніки** - транзакції, middleware, raw SQL
- **PostgreSQL** - підключення, налаштування, оптимізація

## 🚀 Швидкий старт

### 1. Запуск PostgreSQL в Docker

```bash
# Запустити PostgreSQL та pgAdmin
docker-compose up -d

# Перевірити статус контейнерів
docker-compose ps
```

**Доступ до сервісів:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:8080` (admin@example.com / admin123)

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування бази даних

```bash
# Генерація Prisma клієнта
npm run db:generate

# Створення таблиць в базі
npm run db:push

# Заповнення бази тестовими даними
npm run db:seed
```

### 4. Запуск сервера

```bash
# Режим розробки з автоперезавантаженням
npm run dev

# Або звичайний запуск
npm start
```

Сервер буде доступний на `http://localhost:3000`

## 🗂️ Структура проєкту

```
prisma-learning/
├── prisma/
│   ├── schema.prisma      # Схема бази даних
│   └── seed.js           # Скрипт заповнення тестовими даними
├── src/
│   └── index.js          # Express сервер з API endpoints
├── examples/
│   └── basic-crud.js     # Приклади CRUD операцій
├── config/
│   └── database.js       # Конфігурація підключення до БД
└── docker-compose.yml    # Налаштування PostgreSQL в Docker
```

## 📖 Основні концепції Prisma

### 🎲 Схема бази даних (schema.prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  @@map("users")
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

**Основні декоратори:**
- `@id` - первинний ключ
- `@unique` - унікальне значення
- `@default()` - значення за замовчуванням
- `@map()` - назва таблиці в БД
- `@relation()` - зв'язок між моделями

### 🔗 Типи зв'язків

1. **One-to-One** (Один до одного)
```prisma
model User {
  profile Profile?
}

model Profile {
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
```

2. **One-to-Many** (Один до багатьох)
```prisma
model User {
  posts Post[]
}

model Post {
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

3. **Many-to-Many** (Багато до багатьох)
```prisma
model Post {
  categories PostCategory[]
}

model Category {
  posts PostCategory[]
}

model PostCategory {
  post       Post     @relation(fields: [postId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
  postId     Int
  categoryId Int
  @@unique([postId, categoryId])
}
```

## 🛠️ Основні команди Prisma

```bash
# Генерація клієнта після змін схеми
npx prisma generate

# Створення нової міграції
npx prisma migrate dev --name init

# Застосування міграцій до БД
npx prisma migrate deploy

# Відновлення схеми з БД
npx prisma db pull

# Застосування схеми до БД (без міграцій)
npx prisma db push

# Відкриття Prisma Studio (GUI для БД)
npx prisma studio

# Скидання БД та запуск seed
npx prisma migrate reset
```

## 🎪 Приклади API Endpoints

### Користувачі

```bash
# Отримати всіх користувачів з пагінацією
GET /api/users?page=1&limit=10&include_profile=true

# Отримати користувача з усіма зв'язками
GET /api/users/1

# Створити нового користувача
POST /api/users
{
  "email": "test@example.com",
  "name": "Test User",
  "age": 25,
  "profile": {
    "bio": "Developer",
    "location": "Kyiv"
  }
}

# Оновити користувача
PUT /api/users/1
{
  "name": "Updated Name",
  "age": 26
}

# Видалити користувача
DELETE /api/users/1
```

### Аналітика та пошук

```bash
# Аналітика постів по категоріях
GET /api/analytics/posts

# Пошук постів з фільтрами
GET /api/posts/search?q=prisma&category=Technology&published=true

# Перенесення поста іншому автору (транзакція)
POST /api/posts/1/transfer
{
  "newAuthorEmail": "newauthor@example.com"
}

# Активність користувачів (raw SQL)
GET /api/raw/user-activity
```

## 🎓 Приклади коду для співбесіди

### 1. Базові CRUD операції

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe'
  }
})

// READ
const users = await prisma.user.findMany({
  where: { isActive: true },
  include: { posts: true },
  orderBy: { createdAt: 'desc' }
})

// UPDATE
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'John Updated' }
})

// DELETE
await prisma.user.delete({
  where: { id: 1 }
})
```

### 2. Складні запити

```javascript
// Пошук з фільтрацією
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      { views: { gte: 100 } },
      {
        OR: [
          { title: { contains: 'Prisma' } },
          { content: { contains: 'database' } }
        ]
      }
    ]
  },
  include: {
    author: { select: { name: true, email: true } },
    comments: true
  }
})

// Агрегація
const stats = await prisma.post.aggregate({
  _count: { id: true },
  _avg: { views: true },
  _max: { views: true },
  where: { published: true }
})

// Групування
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: { id: true },
  having: { id: { _count: { gte: 2 } } }
})
```

### 3. Транзакції

```javascript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'test@example.com', name: 'Test' }
  })
  
  const post = await tx.post.create({
    data: {
      title: 'Test Post',
      authorId: user.id
    }
  })
  
  return { user, post }
})
```

### 4. Raw SQL

```javascript
const result = await prisma.$queryRaw`
  SELECT u.name, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.author_id
  GROUP BY u.id, u.name
  ORDER BY post_count DESC
`
```

## 🐛 Типові помилки та їх вирішення

### P2002: Unique constraint violation
```javascript
try {
  await prisma.user.create({
    data: { email: 'existing@example.com' }
  })
} catch (error) {
  if (error.code === 'P2002') {
    console.log('Email already exists')
  }
}
```

### P2025: Record not found
```javascript
try {
  await prisma.user.update({
    where: { id: 999 },
    data: { name: 'New Name' }
  })
} catch (error) {
  if (error.code === 'P2025') {
    console.log('User not found')
  }
}
```

## 🔧 Корисні команди для розробки

```bash
# Перегляд логів Docker
docker-compose logs postgres

# Підключення до PostgreSQL через командний рядок
docker exec -it prisma_postgres_1 psql -U admin -d prisma_learning

# Запуск прикладів CRUD
node examples/basic-crud.js

# Очищення та пересідінг БД
npm run db:reset
```

## 🎯 Питання для співбесіди

### Теоретичні питання:
1. Що таке ORM і чому Prisma краще за Sequelize?
2. Різниця між `migrate dev` та `db push`?
3. Як працюють зв'язки в Prisma?
4. Що таке транзакції і коли їх використовувати?
5. Як оптимізувати запити в Prisma?

### Практичні завдання:
1. Створити модель з many-to-many зв'язком
2. Написати складний запит з фільтрацією та агрегацією
3. Реалізувати пагінацію з підрахунком загальної кількості
4. Обробити помилки унікальності та відсутності записів
5. Написати транзакцію для перенесення даних

## 📱 Додаткові ресурси

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Examples](https://github.com/prisma/prisma-examples)

---

**🎉 Успішної підготовки до співбесіди!** 
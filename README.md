# 🚀 Prisma Learning Project - Enterprise-Grade ORM Implementation

## 📋 Project Overview

This repository demonstrates comprehensive knowledge of **Prisma ORM** with **PostgreSQL** for enterprise-level Node.js applications. The project showcases advanced database design patterns, complex query optimization, and production-ready API architecture.

## 🎯 Purpose

**Educational/Interview Demonstration Project** - Showcasing proficiency in:
- Modern ORM patterns and best practices
- Database relationship modeling
- Query optimization and performance tuning
- Enterprise API design
- Docker containerization
- Production-ready code structure

## 🏗️ Architecture & Design Patterns

### Database Schema Design
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │───▶│   Profile   │    │  Category   │
│             │    │             │    │             │
│ - id        │    │ - bio       │    │ - name      │
│ - email     │    │ - avatar    │    │ - color     │
│ - name      │    │ - website   │    └─────────────┘
│ - role      │    │ - location  │           │
└─────────────┘    └─────────────┘           │
        │                                    │
        │          ┌─────────────┐           │
        └─────────▶│    Post     │◀──────────┘
                   │             │    (Many-to-Many)
                   │ - title     │
                   │ - content   │    ┌─────────────┐
                   │ - views     │───▶│   Comment   │
                   │ - published │    │             │
                   └─────────────┘    │ - content   │
                                      │ - authorId  │
                                      └─────────────┘
```

### Key Relationships Implemented
- **One-to-One**: User ↔ Profile (Unique constraint pattern)
- **One-to-Many**: User → Posts, Posts → Comments
- **Many-to-Many**: Posts ↔ Categories (Junction table pattern)

## 🛠️ Technology Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js with modern middleware
- **ORM**: Prisma 5.x with advanced features
- **Database**: PostgreSQL 15 with custom configurations
- **Containerization**: Docker Compose for development
- **Development**: Hot reload with Nodemon
- **Data Generation**: Faker.js for realistic test datasets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Setup & Installation
```bash
# Clone repository
git clone https://github.com/AlexSerbinov/prisma-learning.git
cd prisma-learning

# Install dependencies
npm install

# Start PostgreSQL + pgAdmin
docker-compose up -d

# Configure database
npx prisma migrate dev --name init
npx prisma generate

# Seed with realistic data
npm run db:seed

# Start development server
npm run dev
```

### Services Access
- **API Server**: http://localhost:3001
- **Prisma Studio**: `npm run db:studio`
- **pgAdmin**: http://localhost:8080 (admin@admin.com / admin)
- **PostgreSQL**: localhost:5432

## 📚 Core Features & Demonstrations

### 1. Advanced Query Patterns
```javascript
// Complex filtering with relations
const posts = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      role: 'ADMIN'
    },
    categories: {
      some: {
        category: {
          name: 'Technology'
        }
      }
    }
  },
  include: {
    author: {
      select: { name: true, email: true }
    },
    categories: {
      include: { category: true }
    },
    _count: { comments: true }
  },
  orderBy: [
    { views: 'desc' },
    { createdAt: 'desc' }
  ]
})
```

### 2. Transaction Management
```javascript
// Atomic operations with rollback handling
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email, name, role }
  })
  
  await tx.profile.create({
    data: { userId: user.id, bio, avatar }
  })
  
  return user
})
```

### 3. Performance Optimization
- **Query batching** to prevent N+1 problems
- **Selective field loading** with `select` vs `include`
- **Database indexing** strategies
- **Connection pooling** configuration
- **Raw SQL integration** for complex analytics

### 4. Error Handling Patterns
```javascript
// Prisma-specific error handling
try {
  await prisma.user.create({ data })
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('Email already exists')
  }
  if (error.code === 'P2025') {
    throw new Error('Record not found')
  }
  throw error
}
```

## 🔍 Interview-Ready Concepts

### Database Design Questions
- **Normalization**: Why and when to denormalize
- **Indexing strategies**: Composite indexes, partial indexes
- **Constraint management**: Foreign keys, unique constraints
- **Migration strategies**: Zero-downtime deployments

### ORM vs Raw SQL Trade-offs
- **Type safety** vs **Performance optimization**
- **Development speed** vs **Query control**
- **Maintainability** vs **Flexibility**
- **When to use** raw SQL vs ORM queries

### Scalability Considerations
- **Connection pooling** configuration
- **Query optimization** strategies  
- **Caching layers** integration
- **Read replicas** and write/read separation

### Production Concerns
- **Environment management**: Dev/staging/prod configurations
- **Security patterns**: SQL injection prevention, data validation
- **Monitoring**: Query performance tracking, error logging
- **Backup strategies**: Point-in-time recovery, data integrity

## 🧪 Testing & Validation

### Available Examples
```bash
# Basic CRUD operations demonstration
node examples/basic-crud.js

# Advanced interview scenarios
node examples/interview-questions.js
```

### API Endpoints
```
GET    /api/users              # Pagination, filtering, relations
GET    /api/users/:id          # Complex nested relations
POST   /api/users              # Validation, error handling
PUT    /api/users/:id          # Optimistic updates
DELETE /api/users/:id          # Cascade delete patterns

GET    /api/posts/search       # Advanced filtering
POST   /api/posts/:id/transfer # Transaction examples
GET    /api/analytics/posts    # Aggregation queries
GET    /api/raw/user-activity  # Raw SQL integration
```

## 📊 Performance Benchmarks

The project includes performance comparison examples:
- **Include vs Select**: ~40% performance difference
- **Batch operations**: 10x faster than individual queries
- **Raw SQL**: When 5x+ performance gain justifies complexity
- **Index impact**: Query time improvements demonstrated

## 🔒 Security Features

- **Input validation** with comprehensive error handling
- **SQL injection prevention** through parameterized queries
- **Role-based access** patterns in data models
- **Environment variable** security for sensitive configuration

## 🎓 Learning Outcomes

After studying this project, you'll demonstrate:
- **Enterprise database design** capabilities
- **Advanced ORM usage** beyond basic CRUD
- **Performance optimization** mindset
- **Production-ready code** patterns
- **Interview confidence** in database/ORM topics

## 📝 Interview Questions Coverage

### Technical Depth Questions
- Explain the difference between `findMany` and `findUnique` performance implications
- How would you handle a situation where Prisma generates inefficient SQL?
- Describe your approach to handling database migrations in a production environment
- What strategies would you use to optimize a slow query involving multiple joins?

### Architecture Questions  
- How would you design a many-to-many relationship for a real-world scenario?
- Explain when you would choose raw SQL over Prisma queries
- How do you ensure data consistency in complex transactions?
- What's your approach to handling database schema changes in a team environment?

### Production Scenarios
- How would you handle connection pool exhaustion?
- Describe your error handling strategy for database failures
- How do you approach database testing in your development workflow?
- What metrics would you monitor for database performance?

## 🤝 Contributing & Discussion

This project serves as a foundation for technical discussions about:
- Modern ORM patterns in enterprise applications
- Database design best practices
- Performance optimization strategies
- Production deployment considerations

---

**Note**: This is an educational project designed to demonstrate comprehensive understanding of Prisma ORM, PostgreSQL, and modern Node.js development patterns for interview and learning purposes. 
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// ==================== CRUD Examples ====================

// 🔍 READ Operations
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, include_profile, role, search } = req.query
    
    const skip = (page - 1) * limit
    const take = parseInt(limit)
    
    // Build where clause
    const where = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Build include clause
    const include = {}
    if (include_profile === 'true') include.profile = true
    
    const users = await prisma.user.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
    
    const total = await prisma.user.count({ where })
    
    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID with all relations
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: true,
        posts: {
          include: {
            categories: {
              include: {
                category: true
              }
            },
            comments: {
              include: {
                author: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        },
        comments: {
          include: {
            post: {
              select: { id: true, title: true }
            }
          }
        }
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✏️ CREATE Operations
app.post('/api/users', async (req, res) => {
  try {
    const { email, name, age, role, profile } = req.body
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        age,
        role,
        ...(profile && {
          profile: {
            create: profile
          }
        })
      },
      include: {
        profile: true
      }
    })
    
    res.status(201).json(user)
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

// 🔄 UPDATE Operations
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { email, name, age, role, profile } = req.body
    
    const updateData = { email, name, age, role }
    
    // Handle profile update
    if (profile) {
      updateData.profile = {
        upsert: {
          create: profile,
          update: profile
        }
      }
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { profile: true }
    })
    
    res.json(user)
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

// 🗑️ DELETE Operations
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })
    
    res.status(204).send()
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
})

// ==================== Advanced Queries ====================

// Complex filtering and aggregation
app.get('/api/analytics/posts', async (req, res) => {
  try {
    // Post statistics by category
    const categoryStats = await prisma.category.findMany({
      include: {
        posts: {
          include: {
            post: {
              select: {
                id: true,
                views: true,
                published: true
              }
            }
          }
        }
      }
    })
    
    const analytics = categoryStats.map(category => ({
      category: category.name,
      totalPosts: category.posts.length,
      publishedPosts: category.posts.filter(p => p.post.published).length,
      totalViews: category.posts.reduce((sum, p) => sum + p.post.views, 0)
    }))
    
    // Top authors by post count
    const topAuthors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    })
    
    res.json({
      categoryAnalytics: analytics,
      topAuthors
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search posts with complex filtering
app.get('/api/posts/search', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      author, 
      published, 
      min_views, 
      date_from, 
      date_to,
      page = 1,
      limit = 10 
    } = req.query
    
    const where = {}
    
    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ]
    }
    
    // Filter by category
    if (category) {
      where.categories = {
        some: {
          category: {
            name: { equals: category, mode: 'insensitive' }
          }
        }
      }
    }
    
    // Filter by author
    if (author) {
      where.author = {
        name: { contains: author, mode: 'insensitive' }
      }
    }
    
    // Filter by published status
    if (published !== undefined) {
      where.published = published === 'true'
    }
    
    // Filter by minimum views
    if (min_views) {
      where.views = { gte: parseInt(min_views) }
    }
    
    // Date range filtering
    if (date_from || date_to) {
      where.createdAt = {}
      if (date_from) where.createdAt.gte = new Date(date_from)
      if (date_to) where.createdAt.lte = new Date(date_to)
    }
    
    const skip = (page - 1) * limit
    const take = parseInt(limit)
    
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    })
    
    const total = await prisma.post.count({ where })
    
    res.json({
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== Transaction Example ====================

app.post('/api/posts/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params
    const { newAuthorEmail } = req.body
    
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find new author
      const newAuthor = await tx.user.findUnique({
        where: { email: newAuthorEmail }
      })
      
      if (!newAuthor) {
        throw new Error('New author not found')
      }
      
      // Get current post
      const currentPost = await tx.post.findUnique({
        where: { id: parseInt(id) },
        include: { author: true }
      })
      
      if (!currentPost) {
        throw new Error('Post not found')
      }
      
      // Update post author
      const updatedPost = await tx.post.update({
        where: { id: parseInt(id) },
        data: { authorId: newAuthor.id },
        include: {
          author: true,
          categories: {
            include: { category: true }
          }
        }
      })
      
      return {
        post: updatedPost,
        previousAuthor: currentPost.author
      }
    })
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ==================== Raw SQL Example ====================

app.get('/api/raw/user-activity', async (req, res) => {
  try {
    // Example of raw SQL query for complex analytics
    const result = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count,
        AVG(p.views) as avg_post_views,
        MAX(p.created_at) as last_post_date
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      LEFT JOIN comments c ON u.id = c.author_id
      WHERE u.is_active = true
      GROUP BY u.id, u.name, u.email
      ORDER BY post_count DESC, comment_count DESC
      LIMIT 10
    `
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== Server Startup ====================

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log('📚 Available endpoints:')
      console.log('  GET  /api/users - List users with pagination and filtering')
      console.log('  GET  /api/users/:id - Get user with all relations')
      console.log('  POST /api/users - Create new user')
      console.log('  PUT  /api/users/:id - Update user')
      console.log('  DELETE /api/users/:id - Delete user')
      console.log('  GET  /api/analytics/posts - Get post analytics')
      console.log('  GET  /api/posts/search - Search posts with filters')
      console.log('  POST /api/posts/:id/transfer - Transfer post to another author')
      console.log('  GET  /api/raw/user-activity - Raw SQL query example')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer() 
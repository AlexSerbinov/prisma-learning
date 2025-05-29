import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🎯 Interview Questions & Practical Examples

console.log('🎭 Prisma Interview Preparation Examples\n')

// ==================== Question 1: Relations ====================
console.log('📋 Question 1: How do you handle different types of relations in Prisma?')

async function demonstrateRelations() {
  console.log('\n1️⃣ One-to-One Relation (User ↔ Profile):')
  
  // Get user with profile
  const userWithProfile = await prisma.user.findFirst({
    include: { profile: true }
  })
  console.log('User with profile:', userWithProfile?.name, '→', userWithProfile?.profile?.bio)
  
  console.log('\n2️⃣ One-to-Many Relation (User → Posts):')
  
  // Get user with all posts
  const userWithPosts = await prisma.user.findFirst({
    include: {
      posts: {
        select: { id: true, title: true, published: true }
      }
    }
  })
  console.log('User posts:', userWithPosts?.name, '→', userWithPosts?.posts?.length, 'posts')
  
  console.log('\n3️⃣ Many-to-Many Relation (Posts ↔ Categories):')
  
  // Get post with categories through join table
  const postWithCategories = await prisma.post.findFirst({
    include: {
      categories: {
        include: {
          category: {
            select: { name: true, color: true }
          }
        }
      }
    }
  })
  console.log('Post categories:', postWithCategories?.title)
  postWithCategories?.categories.forEach(pc => {
    console.log('  →', pc.category.name, pc.category.color)
  })
}

// ==================== Question 2: Complex Queries ====================
console.log('\n📋 Question 2: How do you build complex queries with filtering and sorting?')

async function demonstrateComplexQueries() {
  console.log('\n1️⃣ Complex WHERE conditions:')
  
  // Find posts with complex conditions
  const complexQuery = await prisma.post.findMany({
    where: {
      AND: [
        { published: true },
        { views: { gte: 200 } },
        {
          OR: [
            { title: { contains: 'a', mode: 'insensitive' } },
            { content: { contains: 'the', mode: 'insensitive' } }
          ]
        }
      ]
    },
    select: {
      title: true,
      views: true,
      author: {
        select: { name: true }
      }
    },
    orderBy: [
      { views: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 3
  })
  
  console.log('Complex query results:')
  complexQuery.forEach(post => {
    console.log(`  • ${post.title} (${post.views} views) by ${post.author.name}`)
  })
  
  console.log('\n2️⃣ Nested filtering:')
  
  // Find users who have published posts in specific categories
  const usersWithTechPosts = await prisma.user.findMany({
    where: {
      posts: {
        some: {
          AND: [
            { published: true },
            {
              categories: {
                some: {
                  category: {
                    name: { equals: 'Technology', mode: 'insensitive' }
                  }
                }
              }
            }
          ]
        }
      }
    },
    select: {
      name: true,
      email: true,
      _count: {
        select: { posts: true }
      }
    }
  })
  
  console.log('Users with Technology posts:')
  usersWithTechPosts.forEach(user => {
    console.log(`  • ${user.name} (${user._count.posts} posts)`)
  })
}

// ==================== Question 3: Transactions ====================
console.log('\n📋 Question 3: How do you handle transactions in Prisma?')

async function demonstrateTransactions() {
  console.log('\n1️⃣ Simple transaction example:')
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create a new user
      const newUser = await tx.user.create({
        data: {
          email: `transaction-user-${Date.now()}@example.com`,
          name: 'Transaction User',
          age: 25
        }
      })
      
      // Create a post for this user
      const newPost = await tx.post.create({
        data: {
          title: 'Transaction Test Post',
          content: 'This post was created in a transaction',
          published: true,
          authorId: newUser.id
        }
      })
      
      // If we wanted to simulate an error:
      // throw new Error('Something went wrong!')
      
      return { user: newUser, post: newPost }
    })
    
    console.log('Transaction successful:')
    console.log(`  • Created user: ${result.user.name}`)
    console.log(`  • Created post: ${result.post.title}`)
    
  } catch (error) {
    console.log('Transaction failed:', error.message)
  }
  
  console.log('\n2️⃣ Advanced transaction with rollback:')
  
  try {
    await prisma.$transaction(async (tx) => {
      // Update multiple records
      await tx.post.updateMany({
        where: { published: false },
        data: { views: { increment: 10 } }
      })
      
      // Create audit log (this would fail if table doesn't exist)
      // await tx.auditLog.create({
      //   data: { action: 'BULK_UPDATE_VIEWS' }
      // })
      
      console.log('Advanced transaction completed successfully')
    })
  } catch (error) {
    console.log('Advanced transaction failed (as expected):', error.code)
  }
}

// ==================== Question 4: Performance & Optimization ====================
console.log('\n📋 Question 4: How do you optimize Prisma queries for performance?')

async function demonstrateOptimization() {
  console.log('\n1️⃣ Using select vs include:')
  
  // BAD: Loading unnecessary data
  console.time('Bad query')
  const badQuery = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
      comments: true
    }
  })
  console.timeEnd('Bad query')
  console.log(`Bad query loaded ${badQuery.length} users with all relations`)
  
  // GOOD: Only selecting needed fields
  console.time('Good query')
  const goodQuery = await prisma.user.findMany({
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
    }
  })
  console.timeEnd('Good query')
  console.log(`Good query loaded ${goodQuery.length} users with minimal data`)
  
  console.log('\n2️⃣ Pagination for large datasets:')
  
  const page = 1
  const limit = 5
  const skip = (page - 1) * limit
  
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        views: true,
        author: {
          select: { name: true }
        }
      },
      orderBy: { views: 'desc' }
    }),
    prisma.post.count()
  ])
  
  console.log(`Paginated results: ${posts.length} posts (page ${page} of ${Math.ceil(totalCount / limit)})`)
  
  console.log('\n3️⃣ Aggregation for analytics:')
  
  const analyticsData = await prisma.post.aggregate({
    _count: { id: true },
    _avg: { views: true },
    _max: { views: true },
    _min: { views: true },
    where: { published: true }
  })
  
  console.log('Post analytics:', {
    totalPosts: analyticsData._count.id,
    averageViews: Math.round(analyticsData._avg.views || 0),
    maxViews: analyticsData._max.views,
    minViews: analyticsData._min.views
  })
}

// ==================== Question 5: Error Handling ====================
console.log('\n📋 Question 5: How do you handle common Prisma errors?')

async function demonstrateErrorHandling() {
  console.log('\n1️⃣ Unique constraint violation (P2002):')
  
  try {
    await prisma.user.create({
      data: {
        email: 'john.doe@example.com', // This email might already exist
        name: 'Duplicate User'
      }
    })
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Handled unique constraint error:', error.meta.target)
    } else {
      console.log('❌ Unexpected error:', error.code)
    }
  }
  
  console.log('\n2️⃣ Record not found (P2025):')
  
  try {
    await prisma.user.update({
      where: { id: 999999 },
      data: { name: 'Non-existent User' }
    })
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('✅ Handled record not found error')
    } else {
      console.log('❌ Unexpected error:', error.code)
    }
  }
  
  console.log('\n3️⃣ Safe record operations:')
  
  // Using findUnique instead of direct update
  const userToUpdate = await prisma.user.findUnique({
    where: { email: 'jane.smith@example.com' }
  })
  
  if (userToUpdate) {
    const updated = await prisma.user.update({
      where: { id: userToUpdate.id },
      data: { name: 'Jane Smith Updated Safely' }
    })
    console.log('✅ Safely updated user:', updated.name)
  } else {
    console.log('❌ User not found for safe update')
  }
}

// ==================== Question 6: Raw SQL ====================
console.log('\n📋 Question 6: When and how do you use raw SQL in Prisma?')

async function demonstrateRawSQL() {
  console.log('\n1️⃣ Raw query for complex analytics:')
  
  const complexAnalytics = await prisma.$queryRaw`
    SELECT 
      u.name,
      u.role,
      COUNT(DISTINCT p.id) as post_count,
      COUNT(DISTINCT c.id) as comment_count,
      COALESCE(AVG(p.views), 0) as avg_post_views
    FROM users u
    LEFT JOIN posts p ON u.id = p."authorId" AND p.published = true
    LEFT JOIN comments c ON u.id = c."authorId"
    WHERE u."isActive" = true
    GROUP BY u.id, u.name, u.role
    HAVING COUNT(DISTINCT p.id) > 0
    ORDER BY post_count DESC, avg_post_views DESC
    LIMIT 5
  `
  
  console.log('User activity analysis:')
  complexAnalytics.forEach(user => {
    console.log(`  • ${user.name} (${user.role}): ${user.post_count} posts, ${user.comment_count} comments, ${Math.round(Number(user.avg_post_views))} avg views`)
  })
  
  console.log('\n2️⃣ Raw execute for database operations:')
  
  try {
    await prisma.$executeRaw`
      UPDATE posts 
      SET views = views + 1 
      WHERE published = true AND views < 100
    `
    console.log('✅ Bulk updated low-view posts')
  } catch (error) {
    console.log('❌ Raw execute failed:', error.message)
  }
}

// ==================== Run All Examples ====================
async function runAllExamples() {
  try {
    await demonstrateRelations()
    await demonstrateComplexQueries()
    await demonstrateTransactions()
    await demonstrateOptimization()
    await demonstrateErrorHandling()
    await demonstrateRawSQL()
    
    console.log('\n🎉 All interview examples completed successfully!')
    console.log('\n💡 Key takeaways for interviews:')
    console.log('   • Understand relation types and how to query them')
    console.log('   • Know how to build complex WHERE conditions')
    console.log('   • Use transactions for data consistency')
    console.log('   • Optimize queries with select vs include')
    console.log('   • Handle common Prisma error codes')
    console.log('   • Use raw SQL for complex analytics when needed')
    
  } catch (error) {
    console.error('❌ Error in interview examples:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runAllExamples() 
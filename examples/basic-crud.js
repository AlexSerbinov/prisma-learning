import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 📚 Basic CRUD Operations Examples for Interview Preparation

async function basicCrudExamples() {
  console.log('🎯 Starting Basic CRUD Examples...\n')

  try {
    // ==================== CREATE Examples ====================
    console.log('1️⃣ CREATE Operations:')
    
    // Simple create
    const newUser = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        age: 30
      }
    })
    console.log('✅ Created user:', newUser)

    // Create with nested data (one-to-one relation)
    const userWithProfile = await prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        age: 28,
        profile: {
          create: {
            bio: 'Software Developer',
            website: 'https://janesmith.dev',
            location: 'San Francisco'
          }
        }
      },
      include: {
        profile: true
      }
    })
    console.log('✅ Created user with profile:', userWithProfile)

    // Create with existing relations
    const newPost = await prisma.post.create({
      data: {
        title: 'Learning Prisma ORM',
        content: 'Prisma is a powerful ORM for Node.js...',
        published: true,
        authorId: newUser.id
      }
    })
    console.log('✅ Created post:', newPost)

    console.log('\n')

    // ==================== READ Examples ====================
    console.log('2️⃣ READ Operations:')
    
    // Find many with filtering
    const users = await prisma.user.findMany({
      where: {
        age: { gte: 25 },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    console.log('✅ Found users (age >= 25):', users)

    // Find unique with includes
    const userWithRelations = await prisma.user.findUnique({
      where: { email: 'jane.smith@example.com' },
      include: {
        profile: true,
        posts: {
          where: { published: true },
          include: {
            comments: {
              include: {
                author: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      }
    })
    console.log('✅ User with relations:', JSON.stringify(userWithRelations, null, 2))

    // Complex where conditions
    const recentPosts = await prisma.post.findMany({
      where: {
        AND: [
          { published: true },
          { views: { gte: 100 } },
          {
            OR: [
              { title: { contains: 'Prisma', mode: 'insensitive' } },
              { content: { contains: 'database', mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    })
    console.log('✅ Recent posts with complex filtering:', recentPosts)

    console.log('\n')

    // ==================== UPDATE Examples ====================
    console.log('3️⃣ UPDATE Operations:')
    
    // Simple update
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        age: 31,
        name: 'John Doe Updated'
      }
    })
    console.log('✅ Updated user:', updatedUser)

    // Update with nested data
    const userProfileUpdate = await prisma.user.update({
      where: { email: 'jane.smith@example.com' },
      data: {
        profile: {
          update: {
            bio: 'Senior Software Developer & Tech Lead',
            location: 'Remote'
          }
        }
      },
      include: {
        profile: true
      }
    })
    console.log('✅ Updated user with profile:', userProfileUpdate)

    // Update many
    const updateResult = await prisma.post.updateMany({
      where: {
        authorId: newUser.id,
        published: false
      },
      data: {
        published: true
      }
    })
    console.log('✅ Updated posts count:', updateResult.count)

    // Upsert (update or create)
    const upsertedUser = await prisma.user.upsert({
      where: { email: 'bob.wilson@example.com' },
      update: {
        name: 'Bob Wilson Updated',
        age: 35
      },
      create: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        age: 33
      }
    })
    console.log('✅ Upserted user:', upsertedUser)

    console.log('\n')

    // ==================== DELETE Examples ====================
    console.log('4️⃣ DELETE Operations:')
    
    // Delete single record
    const deletedPost = await prisma.post.delete({
      where: { id: newPost.id }
    })
    console.log('✅ Deleted post:', deletedPost)

    // Delete many with conditions
    const deleteResult = await prisma.post.deleteMany({
      where: {
        published: false,
        views: { lt: 10 }
      }
    })
    console.log('✅ Deleted posts count:', deleteResult.count)

    console.log('\n')

    // ==================== Aggregation Examples ====================
    console.log('5️⃣ AGGREGATION Operations:')
    
    // Count
    const userCount = await prisma.user.count({
      where: {
        isActive: true
      }
    })
    console.log('✅ Active users count:', userCount)

    // Aggregate functions
    const postStats = await prisma.post.aggregate({
      _count: {
        id: true
      },
      _avg: {
        views: true
      },
      _max: {
        views: true
      },
      _min: {
        views: true
      },
      _sum: {
        views: true
      },
      where: {
        published: true
      }
    })
    console.log('✅ Post statistics:', postStats)

    // Group by
    const postsByAuthor = await prisma.post.groupBy({
      by: ['authorId'],
      _count: {
        id: true
      },
      _avg: {
        views: true
      },
      having: {
        id: {
          _count: {
            gte: 2
          }
        }
      }
    })
    console.log('✅ Posts grouped by author:', postsByAuthor)

  } catch (error) {
    console.error('❌ Error in CRUD examples:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run examples
basicCrudExamples() 
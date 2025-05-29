import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.comment.deleteMany()
  await prisma.postCategory.deleteMany()
  await prisma.post.deleteMany()
  await prisma.category.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create categories first
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        color: '#3B82F6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Programming',
        color: '#10B981'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        color: '#F59E0B'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        color: '#EF4444'
      }
    })
  ])

  console.log('📂 Created categories')

  // Create users with profiles
  const users = []
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 65 }),
        role: i === 0 ? 'ADMIN' : i === 1 ? 'MODERATOR' : 'USER',
        profile: {
          create: {
            bio: faker.lorem.paragraph(),
            avatar: faker.image.avatar(),
            website: faker.internet.url(),
            location: `${faker.location.city()}, ${faker.location.country()}`
          }
        }
      }
    })
    users.push(user)
  }

  console.log('👥 Created users with profiles')

  // Create posts with categories
  for (const user of users) {
    const postCount = faker.number.int({ min: 1, max: 5 })
    
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          published: faker.datatype.boolean(),
          views: faker.number.int({ min: 0, max: 1000 }),
          authorId: user.id
        }
      })

      // Assign random categories to post
      const numCategories = faker.number.int({ min: 1, max: 3 })
      const randomCategories = faker.helpers.arrayElements(categories, numCategories)
      
      for (const category of randomCategories) {
        await prisma.postCategory.create({
          data: {
            postId: post.id,
            categoryId: category.id
          }
        })
      }

      // Create comments for post
      const commentCount = faker.number.int({ min: 0, max: 5 })
      for (let j = 0; j < commentCount; j++) {
        const randomUser = faker.helpers.arrayElement(users)
        await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            authorId: randomUser.id,
            postId: post.id
          }
        })
      }
    }
  }

  console.log('📝 Created posts with categories and comments')

  // Show statistics
  const stats = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    posts: await prisma.post.count(),
    categories: await prisma.category.count(),
    comments: await prisma.comment.count(),
    postCategories: await prisma.postCategory.count()
  }

  console.log('📊 Database seeding completed!')
  console.log('Statistics:', stats)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
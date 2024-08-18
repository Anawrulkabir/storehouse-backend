const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb')

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}

const app = express()
const port = process.env.PORT || 3000

app.use(cors(corsOptions))
app.options('', cors(corsOptions))

app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster10.vknr6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster10`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const db = client.db('storehouse')
    const allProductsCollection = db.collection('all-new-products')

    // 1. Get all the products
    app.get('/all', async (req, res) => {
      const query = {}
      const sort = {}

      // Filter by categoryname

      if (req.query.categoryName) {
        query.categoryName = new RegExp(req.query.categoryName, 'i')
      }

      // Filter by subcategory
      if (req.query.subcategoryName) {
        query.subcategoryName = new RegExp(req.query.subcategoryName, 'i')
      }

      // Filter by brandName
      if (req.query.brandName) {
        query.brandName = new RegExp(req.query.brandName, 'i')
      }

      // Filter by price (e.g., ?minPrice=10&maxPrice=100)
      if (req.query.minPrice && req.query.maxPrice) {
        query.price = {
          $gte: parseFloat(req.query.minPrice),
          $lte: parseFloat(req.query.maxPrice),
        }
      } else if (req.query.minPrice) {
        query.price = { $gte: parseFloat(req.query.minPrice) }
      } else if (req.query.maxPrice) {
        query.price = { $lte: parseFloat(req.query.maxPrice) }
      }

      // Filter by dateAdded
      if (req.query.startDate && req.query.endDate) {
        query.dateAdded = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        }
      } else if (req.query.startDate) {
        query.dateAdded = { $gte: new Date(req.query.startDate) }
      } else if (req.query.endDate) {
        query.dateAdded = { $lte: new Date(req.query.endDate) }
      }

      // Filter by relevance
      if (req.query.relevance) {
        query.relevance = parseFloat(req.query.relevance)
      }

      // General search across multiple fields (brandName, categoryName, subcategoryName)
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i')
        query.$or = [
          { brandName: searchRegex },
          { categoryName: searchRegex },
          { subcategoryName: searchRegex },
        ]
      }

      // Sort by price
      if (req.query.sortBy === 'priceLowToHigh') {
        sort.price = 1 // Ascending order
      } else if (req.query.sortBy === 'priceHighToLow') {
        sort.price = -1 // Descending order
      }

      const result = await await allProductsCollection
        .find(query)
        .sort(sort)
        .toArray()
      res.send(result)
      console.log(result.length)
    })

    // 2. Get all the apparel-accessories
    app.get('/apparel-accessories', async (req, res) => {
      const query = {
        categoryName: 'Apparel & Accessories',
      }
      const result = await allProductsCollection.find(query).toArray()
      res.send(result)
    })
    // 2. Get all the lifestyle-gadgets
    app.get('/lifecycle-gadgets', async (req, res) => {
      const query = {
        categoryName: 'Lifestyle & Gadgets',
      }
      const result = await allProductsCollection.find(query).toArray()
      res.send(result)
    })

    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } catch (err) {
    console.log(err.message)
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Server is running at http://localhost:3000')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

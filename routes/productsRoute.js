const express = require('express')
const router = express.Router()
const Products = require('../models/productSchema')

router.get('/all', async (req, res) => {
  try {
    const query = {}
    const sort = {}

    // Pagination parameters
    const page = parseInt(req.query.page) || 1
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 9
    const skip = (page - 1) * itemsPerPage

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
    // Fetch the products with pagination
    const totalProducts = await Products.countDocuments(query)
    const products = await Products.find(query)
      .sort(sort)
      .skip(skip)
      .limit(itemsPerPage)

    // Return products along with pagination info
    res.status(500).json({
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / itemsPerPage),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

module.exports = router

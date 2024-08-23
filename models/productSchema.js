const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  subcategoryName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dateAdded: {
    type: Date,
    required: true,
  },
  relevance: {
    type: Number,
    required: true,
  },
  imageLink: {
    type: String,
    required: true,
  },
})

module.exports = productSchema

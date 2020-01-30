const mongoose = require('mongoose');

const schema_stock = new mongoose.Schema ({
  name : {type: String, required: true},
  likes: {type: Number, default: 1}
})

module.exports = mongoose.model(process.env.DB_STOCKS, schema_stock);
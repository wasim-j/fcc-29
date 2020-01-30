const mongoose = require('mongoose');

const schema_user = new mongoose.Schema ({
  ip : {type: String, required: true},
  likes: [{type: String, required: true}]
})

module.exports = mongoose.model(process.env.DB_USERS, schema_user);
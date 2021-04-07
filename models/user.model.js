const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  registered_with: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

exports.User = User;

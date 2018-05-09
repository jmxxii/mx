const mongoose     = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: String,
  email: String,
  phone: String,
  profilePic: { type: String, default: '/public/images/default-icon.png' },
  username: String,
  password: String,
  role: {type: String, enum: ['Music', 'Art', 'Film']}
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;
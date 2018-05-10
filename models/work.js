const mongoose     = require('mongoose');
const Schema = mongoose.Schema;

const workSchema = new Schema({
  projectname: String,
  artistname: String,
  genre: String,
  albumArt: { type: String, default: '/images/default-icon.png' },
  media: String,
  user: Schema.Types.ObjectId,
});

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
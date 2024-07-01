const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const mongoURI = 'mongodb+srv://Sandy:Sandy%40356@cluster0.gxhcr.mongodb.net/auth-sys?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle connection events
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;

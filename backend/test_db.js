const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://sonmaliashwini24_db_user:student@cluster0.twb7w44.mongodb.net/?appName=Cluster0')
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect:', err.message);
    process.exit(1);
  });

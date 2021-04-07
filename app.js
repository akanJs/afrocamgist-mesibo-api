// jshint esversion:8
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const mesiboApi = require('./routes/mesibo');

const app = express();

const PORT = process.env.port || 8000;


// MONGOOSE CONFIG
mongoose.connect('mongodb://localhost:27017/AfrocamgistDB', {
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// App config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/mesibo', mesiboApi());


app.get('**', (req, res) => {
  return res.status(404).json({
    status: false,
    error: 'not found'
  });
});

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});

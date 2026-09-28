require("dotenv").config();
const productRoutes = require('./routes/productRoutes');
const logger = require('./middleware/logger');
const connectDB = require('./config/db');


const express = require('express');
const app = express();
connectDB();
app.use(express.json());
app.use("/api/products", logger, productRoutes);


app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


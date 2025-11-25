require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require('./routes/wishlist');

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // allow cookies / authorization headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/user', userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/user", userRoutes);


app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

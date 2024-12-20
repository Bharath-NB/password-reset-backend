import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';  // Import dotenv
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRouter } from './routes/user.js';

// Load environment variables from .env file
dotenv.config();  // This loads variables from .env

// Initialize express
const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// CORS options
const corsOptions = {
  origin: "https://password-reset-forntend-bharath.netlify.app/",  // Ensure this matches your frontend
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
app.use('/auth', UserRouter);

// Log the MongoDB URI to verify it's loaded correctly
console.log('MongoDB URI:', process.env.MONGO_URI);  // Verify if it's loaded

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

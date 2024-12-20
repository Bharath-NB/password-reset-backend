import mongoose from 'mongoose';

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetToken: { type: String }, // Token for password reset
});

// Create User model
const User = mongoose.model('User', userSchema);

export default User;  // Export User model using default export

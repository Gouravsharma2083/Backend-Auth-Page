// Importing necessary modules
const express = require("express"); // Importing Express framework
const mongoose = require("mongoose"); // Importing Mongoose for MongoDB interactions
const bcrypt = require("bcrypt"); // Importing bcrypt for password hashing
const jwt = require("jsonwebtoken"); // Importing jsonwebtoken for JWT authentication
const cors = require("cors"); // Importing CORS to handle cross-origin requests
require('dotenv').config(); // Loading environment variables from .env file

// Initializing the Express app
const app = express();
const PORT = 5000; // Port on which the server will run
const JWT_SECRET = "Fullstack"; // Secret key for JWT signing (replace with a strong key in production)

// Middleware
app.use(express.json()); // Parsing incoming JSON requests
app.use(cors()); // Enabling CORS for all routes

// MongoDB Atlas connection string
const mongoUri =
  "mongodb+srv://gouravsharmaprofessional:5btnTP4d9giCYZb2@cluster0.okr7w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB Atlas connection string

// Connecting to MongoDB Atlas
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true, // Using new URL parser
    useUnifiedTopology: true, // Using new server discovery and monitoring engine
  })
  .then(() => console.log("Connected to MongoDB Atlas")) // Logging success message
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err)); // Logging error message

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Username field (required and unique)
  password: { type: String, required: true }, // Password field (required)
});
const User = mongoose.model("User", userSchema); // Creating the User model

// Routes

// Register Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body; // Extracting username and password from request body

  // Validating input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." }); // Sending error response if fields are missing
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashing the password with bcrypt
    const newUser = new User({ username, password: hashedPassword }); // Creating a new user instance
    await newUser.save(); // Saving the user to the database
    res.status(201).json({ message: "User registered successfully!" }); // Sending success response
  } catch (error) {
    res.status(500).json({ message: "Error registering user.", error }); // Sending error response
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // Extracting username and password from request body

  // Validating input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." }); // Sending error response if fields are missing
  }

  try {
    const user = await User.findOne({ username }); // Finding the user by username
    if (!user) {
      return res.status(404).json({ message: "User not found." }); // Sending error response if user is not found
    }

    const isMatch = await bcrypt.compare(password, user.password); // Comparing the provided password with the hashed password
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." }); // Sending error response if passwords don't match
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" }); // Generating a JWT token
    res.json({ message: "Login successful!", token }); // Sending success response with the token
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error }); // Sending error response
  }
});

// Starting the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`) // Logging server start message
);
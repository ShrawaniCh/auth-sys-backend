const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const bcrypt =require ('bcrypt')
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors())


const JWT_SECRET = 'hire_me_1181';//secret key
// Connect to MongoDB
const mongoURI = 'mongodb+srv://Sandy:Sandy%40356@cluster0.gxhcr.mongodb.net/auth-sys?retryWrites=true&w=majority';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, 
  });
  
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'Access Denied' });
  
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).send({ message: 'Invalid Token' });
    }
  };
  
  


app.post('/register', async (req, res) => {
    const { name, email, password, dob } = req.body;
    
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        name,
        email,
        password: hashedPassword,
        dob
      });
  
      await user.save()
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });;
      res.status(201).send({ message: 'User registered successfully' , token });
    } catch (error) {
        console.log(error)
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ message: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
      const {name,dob } = user
      res.send({name,dob, email : user.email, token });
    } catch (error) {
        console.log(error)
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

  // Fetch All Users Route
app.get('/users', authenticate,async (req, res) => {
    try {
      const users = await User.find({}, 'name email dob');
      res.send(users);
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });
  
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

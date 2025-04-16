const express = require('express');
const path = require('path'); 
const dotenv = require('dotenv');
const connectDB = require('./src/config/dbConfig');
const morganMiddleware = require('./src/middleware/morgan');
const rateLimitMiddleware = require('./src/middleware/rateLimit');
const corsMiddleware = require('./src/middleware/cors');
const securityHeaders = require('./src/middleware/securityHeaders');
const route = require('./src/route/authRoute');
const cookieParser = require('cookie-parser');
const app = express();

dotenv.config();
connectDB();


app.set('trust proxy', 1);
app.use(express.json());
app.use(morganMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(securityHeaders);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/verify-otp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'otp-verification.html'));
});

app.use('/api', route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

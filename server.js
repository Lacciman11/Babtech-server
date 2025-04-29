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

// Add this middleware before your routes
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';" +
    "connect-src 'self' http://localhost:5000 https://nomands.vercel.app;" +
    "script-src 'self' 'unsafe-inline';" +
    "style-src 'self' 'unsafe-inline';" +
    "img-src 'self' data:;"
  );
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/verify-otp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','html', 'otp.html'));
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

app.use('/api', route);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

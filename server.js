const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/dbConfig');
const morganMiddleware = require('./src/middleware/morgan');
const rateLimitMiddleware = require('./src/middleware/rateLimit');
// const corsMiddleware = require('./src/middleware/cors');
const securityHeaders = require('./src/middleware/securityHeaders');
const authRoute = require('./src/route/authRoute');
const cohortRoute = require('./src/route/cohortRoute');
// const examRoute = require('./src/route/examRoute');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const nodemailer = require('nodemailer');

dotenv.config();
connectDB();
// Set up CORS options
const corsOptions = {
  origin: ["http://localhost:3000", "https://nomands.vercel.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
// Initialize CORS middleware
const corsMiddleware = cors(corsOptions);

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Babtech API',
      version: '1.0.0',
      description: 'API for Babtech authentication and cohort management',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://babtech-server.onrender.com' : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
  },
  apis: ['./src/route/*.js'], // Path to route files with Swagger comments
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.set('trust proxy', 1);
app.use(express.json());
app.use(morganMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(securityHeaders);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Dynamic CSP based on NODE_ENV
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const backendUrls = isProduction
    ? 'https://babtech-server.onrender.com http://localhost:5000' // Allow localhost for testing in prod
    : 'http://localhost:5000 https://babtech-server.onrender.com'; // Allow prod URL in dev for flexibility

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';" +
    `connect-src 'self' ${backendUrls} ${process.env.FRONTEND_URL};` +
    "script-src 'self' 'unsafe-inline';" +
    "style-src 'self' 'unsafe-inline';" +
    "img-src 'self' data:;"
  );
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/verify-otp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'otp.html'));
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

app.use('/api', authRoute);
app.use('/api/cohorts', cohortRoute);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// Endpoint to send score email
// This endpoint is for sending the score email after the quiz
app.post('/send-score', async (req, res) => {
  const { email, score } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your React Quiz Score',
      html: `<p>Thank you for completing the test.</p><h3>Your Score: ${score}/30</h3>`,
    });
    res.status(200).json({ message: 'Email sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
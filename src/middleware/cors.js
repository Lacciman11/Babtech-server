const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const isLocalhost3000 = origin === 'http://localhost:5000';
    const isLocalIP = /^http:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(origin || '');
    const allowedOrigins = ['https://nomands.vercel.app'];

    if (!origin || isLocalhost3000 || isLocalIP || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false // Let CORS middleware handle preflight
};

module.exports = cors(corsOptions);
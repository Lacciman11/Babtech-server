const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1'],
  methods: ['POST', 'GET', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = cors(corsOptions);

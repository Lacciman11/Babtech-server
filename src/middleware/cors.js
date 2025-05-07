const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Accept all origins dynamically
  },
  methods: ['POST', 'GET', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};


module.exports = cors(corsOptions);

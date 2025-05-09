module.exports = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    res.setHeader('Permissions-Policy', 'geolocation=(), midi=()');
    next();
  };
  
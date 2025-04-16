module.exports = (req, res, next) => {
    const { email, password } = req.body;
  
    if (req.path.includes('register')) {
      const { firstname, lastname } = req.body;
      if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
    }
  
    next();
  };
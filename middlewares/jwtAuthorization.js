const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get the access token from authorization header
      token = req.headers.authorization.split(" ")[1];

      // verify the access token for correctness
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get authorized user from the database
      req.user = await User.findById(decoded.id).select("-password");

      // proceed to next process
      next();
    } catch (error) {
      res.status(403).json("Authorization token invalid.");
    }
  }

  if (!token) {
    res.status(401).json("Not authorized for this action.");
  }
};

module.exports = protect;

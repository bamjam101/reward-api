const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const handleUserSignUp = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password: clientPassword,
      interests,
      error,
    } = req.body;

    if (error) return res.status(400).json("Application error encountered.");

    if (!name && !phone && !email && !clientPassword) {
      return res.status(402).send("All inputs are required");
    }

    let user = await User.findOne({ email });

    if (user) return res.status(400).res("This email is already taken.");

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(clientPassword, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPass,
      interests: interests || [],
    });

    user = await newUser.save();

    const { password, ...others } = user._doc;

    res.status(200).json({ user: others });
  } catch (err) {
    res.status(500).json("Internal Server Error");
    console.log(err);
  }
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password, error } = req.body;

    if (error) return res.status(400).json("Application error encountered.");

    if (!email && !password) {
      res.status(400).json("All inputs are required.");
    }

    const user = await User.findOne({ email });

    if (user || (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      const { password, ...others } = user._doc;

      res.status(200).json({ user: others, token });
    } else {
      res.status(400).json("Wrong credentials!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  handleUserSignUp,
  handleUserLogin,
};

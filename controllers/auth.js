const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Reward = require("../models/Reward");

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

    const rewardWallet = new Reward({
      userId: user._id,
    });

    await rewardWallet.save();

    user = await newUser.save();

    const { password, ...others } = user._doc;
    const { points } = rewardWallet._doc;

    res.status(200).json({ user: { ...others, points } });
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
      const now = new Date().getTime();
      const secondsLimit = 24 * 60 * 60 * 1000;

      let rewardWallet = await Reward.findOne({ userId: user._id });

      if (rewardWallet) {
        if (now - rewardWallet.lastOnline < secondsLimit) {
          if (rewardWallet.streak === 7) {
            rewardWallet.points += 100;
            rewardWallet.streak = 1;
          } else {
            rewardWallet.points += 10 * rewardWallet.streak;
            rewardWallet.streak += 1;
          }
        }

        rewardWallet.lastOnline = now;

        await rewardWallet.save();
      } else {
        const newRewardWallet = new Reward({
          userId: user._id,
        });

        rewardWallet = await newRewardWallet.save();

        rewardWallet.points += 10;
        rewardWallet.streak = 1;

        await rewardWallet.save();
      }

      const { password, ...others } = user._doc;
      const { points } = rewardWallet._doc;

      res.status(200).json({ user: { ...others, points } });
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

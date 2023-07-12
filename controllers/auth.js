const bcrypt = require("bcrypt");
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

    // encryption of password
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(clientPassword, salt);

    // user object creation
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPass,
      interests: interests || [],
    });

    // user wallet creation
    const rewardWallet = new Reward({
      userId: newUser._id,
    });

    // updating objects in database
    user = await newUser.save();
    const userWallet = await rewardWallet.save();

    const { password, ...others } = user._doc;
    const { points } = userWallet._doc;

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
      let rewardWallet = await Reward.findOne({ userId: user._id });

      if (!rewardWallet) return res.status(404).json("Wallet was not found.");
      console.log(rewardWallet);
      const lastOnlineTime = rewardWallet.lastOnlineTime.getTime();
      const now = new Date().getTime();
      // amount of time (in days) elapsed after the previous login
      const daysDiff = Math.floor(
        (now - lastOnlineTime) / (1000 * 60 * 60 * 24)
      );
      // streak based points allottment
      let streak = daysDiff === 1 ? rewardWallet.streak + 1 : 1;
      // if more than a day has elapsed then chain has been broken so the streak is reset to 1
      console.log(daysDiff);
      if (daysDiff > 1) {
        streak = 1;
      }
      // the points to be added to user wallet
      let newPoints;
      if (streak === 7) {
        newPoints = 100;
        streak = 0;
      } else {
        newPoints = 10 * streak;
      }

      // if 24h has been elapsed from the moment the previous reward was collected
      if (
        !rewardWallet.lastRewardTime ||
        (now - rewardWallet.lastOnlineTime) / (1000 * 60 * 60 * 24) >= 1
      ) {
        // updating the object
        rewardWallet.points += newPoints;
        console.log(streak);
        rewardWallet.streak = streak;
        rewardWallet.lastRewardTime = now;
        rewardWallet.lastOnlineTime = now;
        // saving the new object
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

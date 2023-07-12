// route import statements
const authRoutes = require("./routes/auth");

// importing necessary packages
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();
mongoose.set("strictQuery", true);

const app = express();

// Configuration
app.use(express.json());
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use("/public", express.static(path.join(__dirname, "public")));

// Port number for server execution
const PORT = process.env.PORT || 5001;

// Routes
app.use("/auth", authRoutes);

// MongoDB connection setup
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
  })
  .catch((err) => {
    console.log(`${err}. Could Not Connect.`);
    process.exit(1);
  });

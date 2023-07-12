const express = require("express");

const { handleUserSignUp, handleUserLogin } = require("../controllers/auth");

const router = express.Router();

route.post("/sign-up", handleUserSignUp);
router.post("/log-in", handleUserLogin);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createContactMessage,
  contactLimiter,
} = require("../controllers/contactController");

router.route("/").post(contactLimiter, createContactMessage);

module.exports = router;

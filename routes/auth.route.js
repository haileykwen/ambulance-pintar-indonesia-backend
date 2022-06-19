const express = require('express');
const router = express.Router();
const { login, getUserData } = require("../controllers/auth.controller.js");

router.post('/signin', login);
router.post('/user', getUserData);

module.exports = router;
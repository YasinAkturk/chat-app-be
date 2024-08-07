const { getMessageToday } = require("../controllers/message");

const router = require("express").Router();

router.get("/today", getMessageToday);

module.exports = router;
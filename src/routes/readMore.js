const router = require("express").Router()
const { readMore }  = require('../controllers/readMore');

router.post("/readMore", readMore);

module.exports = router; 
const router = require("express").Router()
const  readMoreController  = require('../controllers/readMore');

router.post("/readMore", readMoreController?.readMore);

module.exports = router; 
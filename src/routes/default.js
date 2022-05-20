const router = require("express").Router()
const { defaultFallBack }  = require('../controllers/default');

router.post("/defaultFallBack", defaultFallBack);

module.exports = router; 



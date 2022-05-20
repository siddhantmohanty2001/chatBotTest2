const router = require("express").Router()
const { test }  = require('../controllers/test');

router.post("/test", test);

module.exports = router; 

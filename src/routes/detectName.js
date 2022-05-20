const router = require("express").Router()
const { detectName } = require('../controllers/detectName')

router.post("/nameAccepter", detectName);

module.exports = router; 



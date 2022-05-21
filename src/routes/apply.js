const router = require("express").Router();
const applyController = require('../controllers/apply');

router.post("/apply", applyController?.apply);

module.exports = router;
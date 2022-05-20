const router = require("express").Router();
const { conversations, loader, analytics } = require("../controllers/logs");

router.post("/conversations", conversations);
router.post("/loader", loader);
router.get("/analytics", analytics);

module.exports = router;
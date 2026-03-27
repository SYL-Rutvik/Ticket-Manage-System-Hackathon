const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/slaController");

// Admin only — get and update SLA config
router.get("/", auth, requireRole("admin"), ctrl.getConfig);
router.put("/", auth, requireRole("admin"), ctrl.updateConfig);

module.exports = router;

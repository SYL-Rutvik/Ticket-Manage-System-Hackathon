const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/auditController");

router.get("/", auth, requireRole("admin"), ctrl.getAll);
router.get("/ticket/:id", auth, requireRole("admin"), ctrl.getByTicket);

module.exports = router;

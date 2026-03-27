const router = require("express").Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/noteController");

// Agent/Admin only — internal notes
router.get("/", auth, requireRole("agent"), ctrl.getByTicket);
router.post("/", auth, requireRole("agent"), ctrl.create);

module.exports = router;

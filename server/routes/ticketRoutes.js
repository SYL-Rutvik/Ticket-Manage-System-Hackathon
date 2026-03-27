const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/ticketController");

// Stats — admin only
router.get("/stats", auth, requireRole("admin"), ctrl.getStats);

// Customer — own tickets
router.get("/mine", auth, requireRole("employee"), ctrl.getMine);

// Agent/Admin — all tickets
router.get("/", auth, requireRole("agent"), ctrl.getAll);

// All roles — single ticket
router.get("/:id", auth, ctrl.getById);

// Customer — create
router.post("/", auth, requireRole("employee"), ctrl.create);

// Agent/Admin — claim / assign
router.patch("/:id/assign", auth, requireRole("agent"), ctrl.assign);

// Agent — status FSM  |  customer — reopen handled inside controller
router.patch("/:id/status", auth, ctrl.updateStatus);

// Admin — priority change
router.patch("/:id/priority", auth, requireRole("admin"), ctrl.updatePriority);

// Admin — delete
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

module.exports = router;

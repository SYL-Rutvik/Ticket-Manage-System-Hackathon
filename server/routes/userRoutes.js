const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/userController");

router.get("/", auth, requireRole("admin"), ctrl.getAll);
router.post("/", auth, requireRole("admin"), ctrl.createUser);
router.patch("/:id/role", auth, requireRole("admin"), ctrl.updateRole);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);

// Employee features
router.patch("/me/password", auth, ctrl.changePassword);

module.exports = router;

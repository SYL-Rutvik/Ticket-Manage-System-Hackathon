const router = require("express").Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/commentController");

router.get("/", auth, ctrl.getByTicket);
router.post("/", auth, ctrl.create);

module.exports = router;

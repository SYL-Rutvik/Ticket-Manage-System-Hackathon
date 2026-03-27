// Simple in-memory SLA config (can be replaced with database later)
let slaConfig = {
  critical: 4,
  high: 24,
  medium: 48,
  low: 72
};

const getConfig = async (req, res) => {
  try {
    res.json(slaConfig);
  } catch(err) { res.status(500).json({error: err.message}); }
};

const updateConfig = async (req, res) => {
  try {
    const { priority, hours } = req.body;
    if (!priority || !hours) return res.status(400).json({ error: "priority and hours are required" });
    if (isNaN(hours) || hours <= 0) return res.status(400).json({ error: "hours must be a positive number" });
    
    slaConfig[priority] = parseInt(hours);
    res.json(slaConfig);
  } catch(err) { res.status(500).json({error: err.message}); }
};

module.exports = { getConfig, updateConfig };

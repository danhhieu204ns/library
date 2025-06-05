const express = require('express');
const router = express.Router();

// Placeholder routes for admin
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard endpoint - coming soon',
    data: {}
  });
});

module.exports = router;

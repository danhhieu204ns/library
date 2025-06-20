const express = require('express');
const { updateUserRole } = require('../controllers/roleController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rolePermissions');

const router = express.Router();

// Protect all routes
router.use(auth);

// Update user's role
router.put('/:id/role', checkPermission('users:change_role'), updateUserRole);

module.exports = router;

const express = require('express');
const { getAllRoles, createRole, getRoleById, updateRole, deleteRole, updateUserRole } = require('../controllers/roleController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rolePermissions');

const router = express.Router();

// Protect all routes
router.use(auth);

// Role routes
router.route('/')
  .get(checkPermission('roles:view'), getAllRoles)
  .post(checkPermission('roles:create'), createRole);

router.route('/:id')
  .get(checkPermission('roles:view'), getRoleById)
  .put(checkPermission('roles:edit'), updateRole)
  .delete(checkPermission('roles:delete'), deleteRole);

module.exports = router;

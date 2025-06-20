const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { User } = require('../models/User');
const { auth, isAdmin, canAccessUserData } = require('../middleware/auth');
const { requirePermission, addUserPermissions } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');
const { PERMISSIONS, getFrontendRole } = require('../config/permissions');
const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password_hash');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update current user profile
router.put('/me', auth, [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phone_number').optional().isLength({ max: 20 }).withMessage('Phone number too long'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, full_name, phone_number, address } = req.body;
    const updateData = {};
    
    if (email) updateData.email = email;
    if (full_name) updateData.full_name = full_name;
    if (phone_number) updateData.phone_number = phone_number;
    if (address) updateData.address = address;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all users
router.get('/', 
  auth, 
  requirePermission(PERMISSIONS.USERS_VIEW),
  addUserPermissions,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ max: 255 }).withMessage('Search term too long')
  ],
  auditLog('VIEW_USERS'),
  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { role, status, search } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);    const total = await User.countDocuments(filter);

    // Add permission context to response
    const userPermissions = req.userPermissions || [];
    const canCreate = userPermissions.includes(PERMISSIONS.USERS_CREATE);
    const canEdit = userPermissions.includes(PERMISSIONS.USERS_EDIT);
    const canDelete = userPermissions.includes(PERMISSIONS.USERS_DELETE);
    const canBulk = userPermissions.includes(PERMISSIONS.USERS_BULK_ACTIONS);
    const canChangeRole = userPermissions.includes(PERMISSIONS.USERS_CHANGE_ROLE);

    // Transform users to include frontend role
    const transformedUsers = users.map(user => ({
      ...user.toObject(),
      frontendRole: getFrontendRole(user.role),
      backendRole: user.role
    }));

    res.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      meta: {
        permissions: userPermissions.filter(p => p.startsWith('users:')),
        canCreate,
        canEdit,
        canDelete,
        canBulk,
        canChangeRole,
        userRole: req.frontendRole
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user by ID
router.get('/:id', 
  auth, 
  canAccessUserData,
  auditLog('VIEW_USER_DETAIL'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password_hash');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Transform user to include frontend role
      const transformedUser = {
        ...user.toObject(),
        frontendRole: getFrontendRole(user.role),
        backendRole: user.role
      };

      res.json({
        success: true,
        data: { user: transformedUser }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Create new user
router.post('/', 
  auth, 
  requirePermission(PERMISSIONS.USERS_CREATE),
  [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('full_name')
      .notEmpty()
      .withMessage('Full name is required'),
    body('role')
      .optional()
      .isIn(['Admin', 'CTV', 'DocGia'])
      .withMessage('Invalid role')
  ],
  auditLog('CREATE_USER'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { username, password, email, full_name, role, phone_number, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this username or email already exists'
        });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        password_hash,
        email,
        full_name,
        role: role || 'DocGia',
        phone_number,
        address
      };

      const user = new User(userData);
      await user.save();

      // Return user without password
      const userResponse = await User.findById(user._id).select('-password_hash');
      const transformedUser = {
        ...userResponse.toObject(),
        frontendRole: getFrontendRole(userResponse.role),
        backendRole: userResponse.role
      };

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: transformedUser }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Update user
router.put('/:id', 
  auth, 
  requirePermission(PERMISSIONS.USERS_EDIT),
  [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('role').optional().isIn(['Admin', 'CTV', 'DocGia']).withMessage('Invalid role'),
  body('status').optional().isIn(['Active', 'Inactive', 'Banned']).withMessage('Invalid status')
], auditLog('UPDATE_USER'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Check if user is trying to change role without permission
      if (req.body.role && !req.userPermissions.includes(PERMISSIONS.USERS_CHANGE_ROLE)) {
        return res.status(403).json({
          success: false,
          message: 'Permission required to change user role'
        });
      }

      const { email, full_name, phone_number, address, role, status } = req.body;
      const updateData = {};
    
      if (email) updateData.email = email;
      if (full_name) updateData.full_name = full_name;
      if (phone_number) updateData.phone_number = phone_number;
      if (address) updateData.address = address;
      if (role) updateData.role = role;
      if (status) updateData.status = status;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: req.params.id } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken'
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password_hash');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Delete user
router.delete('/:id', 
  auth, 
  requirePermission(PERMISSIONS.USERS_DELETE),
  auditLog('DELETE_USER'),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Prevent self-deletion
      if (req.user._id.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Check if user has active borrowings
      const activeBorrowings = await require('../models/Transaction').findOne({
        user: userId,
        status: { $in: ['Borrowed', 'Reserved'] }
      });

      if (activeBorrowings) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete user with active borrowings or reservations'
        });
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Bulk actions for users
router.post('/bulk-actions', 
  auth, 
  requirePermission(PERMISSIONS.USERS_BULK_ACTIONS),
  [
    body('action').isIn(['activate', 'deactivate', 'suspend', 'delete', 'export']).withMessage('Invalid action'),
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID format')
  ],
  auditLog('BULK_USER_ACTIONS'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { action, userIds } = req.body;

      // Prevent actions on own account
      if (userIds.includes(req.user._id.toString())) {
        return res.status(400).json({
          success: false,
          message: 'Cannot perform bulk actions on your own account'
        });
      }

      switch (action) {
        case 'activate':
          await User.updateMany(
            { _id: { $in: userIds } },
            { status: 'Active' }
          );
          res.json({
            success: true,
            message: `${userIds.length} users activated successfully`
          });
          break;

        case 'deactivate':
          await User.updateMany(
            { _id: { $in: userIds } },
            { status: 'Inactive' }
          );
          res.json({
            success: true,
            message: `${userIds.length} users deactivated successfully`
          });
          break;

        case 'suspend':
          await User.updateMany(
            { _id: { $in: userIds } },
            { status: 'Banned' }
          );
          res.json({
            success: true,
            message: `${userIds.length} users suspended successfully`
          });
          break;

        case 'delete':
          // Check for active borrowings
          const activeBorrowings = await require('../models/Transaction').find({
            user: { $in: userIds },
            status: { $in: ['Borrowed', 'Reserved'] }
          });

          if (activeBorrowings.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete users with active borrowings or reservations'
            });
          }

          await User.deleteMany({ _id: { $in: userIds } });
          res.json({
            success: true,
            message: `${userIds.length} users deleted successfully`
          });
          break;

        case 'export':
          const users = await User.find({ _id: { $in: userIds } })
            .select('-password_hash')
            .lean();

          const transformedUsers = users.map(user => ({
            ...user,
            frontendRole: getFrontendRole(user.role),
            backendRole: user.role
          }));

          res.json({
            success: true,
            message: 'Users exported successfully',
            data: { users: transformedUsers }
          });
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }

    } catch (error) {
      console.error('Bulk action error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

module.exports = router;

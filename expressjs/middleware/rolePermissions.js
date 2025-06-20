const { User } = require('../models/User');
const Role = require('../models/Role');
const mongoose = require('mongoose');
const { PERMISSIONS } = require('../config/permissions');

// Check if user has specific permission based on their role
exports.checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Get user from request (set by auth middleware)
      const user = await User.findById(req.user.id).populate('roleId');
      
      // Check if user has roleId and that role has permissions
      if (user.roleId && user.roleId.permissions && user.roleId.permissions.includes(permissionName)) {
        return next();
      }
      
      // Fallback to check using the traditional role-based permissions
      // This ensures backward compatibility
      const { hasPermission } = require('../config/permissions');
      if (hasPermission(user.role, permissionName)) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này',
        error: 'Forbidden'
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra quyền',
        error: error.message
      });
    }
  };
};

// Initialize default roles if they don't exist
exports.initializeRoles = async () => {
  try {
    // Kiểm tra và xóa collection roles nếu cần
    try {
      // Kiểm tra collection có tồn tại không
      const collections = await mongoose.connection.db.listCollections({ name: 'roles' }).toArray();
      
      if (collections.length > 0) {
        // Collection tồn tại, kiểm tra xem nó có sử dụng schema cũ không
        const oldRoles = await mongoose.connection.db.collection('roles').findOne({ role_name: { $exists: true } });
        
        if (oldRoles) {
          // Nếu có schema cũ (có trường role_name), xóa collection
          console.log('Dropping old roles collection with outdated schema');
          await mongoose.connection.db.dropCollection('roles');
          console.log('Successfully dropped roles collection');
        }
      }
    } catch (collectionError) {
      console.log('Error checking/dropping collection:', collectionError.message);
    }

    const roles = [
      {
        name: 'Admin',
        description: 'Quản trị viên với toàn quyền trên hệ thống',
        permissions: Object.values(PERMISSIONS)
      },
      {
        name: 'CTV',
        description: 'Cộng tác viên thư viện với quyền hạn chế',
        permissions: [
          PERMISSIONS.BOOKS_VIEW,
          PERMISSIONS.BOOKS_CREATE,
          PERMISSIONS.BOOKS_EDIT,
          PERMISSIONS.USERS_VIEW,
          PERMISSIONS.USERS_EDIT,
          PERMISSIONS.BORROWINGS_VIEW,
          PERMISSIONS.BORROWINGS_CREATE,
          PERMISSIONS.BORROWINGS_EDIT,
          PERMISSIONS.BORROWINGS_APPROVE,
          PERMISSIONS.SCHEDULES_VIEW,
          PERMISSIONS.SCHEDULES_CREATE,
          PERMISSIONS.SCHEDULES_EDIT,
          PERMISSIONS.REPORTS_VIEW
        ]
      },
      {
        name: 'DocGia',
        description: 'Độc giả với quyền truy cập cơ bản',
        permissions: [
          PERMISSIONS.BOOKS_VIEW,
          PERMISSIONS.BORROWINGS_VIEW,
          PERMISSIONS.SCHEDULES_VIEW
        ]
      }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created default role: ${roleData.name}`);
      }
    }

    console.log('Default roles initialized successfully');
  } catch (error) {
    console.error('Error initializing default roles:', error);
  }
};

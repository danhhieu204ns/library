const Role = require('../models/Role');
const { User } = require('../models/User');

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    return res.status(200).json({
      success: true,
      data: {
        roles,
        count: roles.length
      }
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách vai trò'
    });
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò này đã tồn tại'
      });
    }
    
    const role = await Role.create({
      name,
      description,
      permissions
    });
    
    return res.status(201).json({
      success: true,
      data: {
        role
      }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo vai trò mới'
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        role
      }
    });
  } catch (error) {
    console.error('Error getting role:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin vai trò'
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permissions,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        role
      }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật vai trò'
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    // Check if any user is using this role
    const usersWithRole = await User.countDocuments({ roleId: req.params.id });
    
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa vai trò này vì đang được sử dụng bởi người dùng'
      });
    }
    
    const role = await Role.findByIdAndDelete(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vai trò'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa vai trò'
    });
  }
};

// Update user's role
exports.updateUserRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    
    // Find the role first to ensure it exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò không tồn tại'
      });
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        roleId: roleId,
        role: role.name // Maintain backward compatibility
      },
      { new: true, runValidators: true }
    ).populate('roleId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật vai trò cho người dùng'
    });
  }
};

// Permission middleware helper for shift requests
const { PERMISSIONS } = require('../config/permissions');

// Permission mapping to API endpoints
const permissionToEndpoint = {
  'can_request_shifts': PERMISSIONS.SHIFT_REQUESTS_CREATE,
  'can_approve_shifts': PERMISSIONS.SHIFT_REQUESTS_APPROVE,
  'can_finalize_schedule': PERMISSIONS.SHIFT_REQUESTS_FINALIZE,
  'can_view_shift_requests': PERMISSIONS.SHIFT_REQUESTS_VIEW
};

module.exports = { permissionToEndpoint };

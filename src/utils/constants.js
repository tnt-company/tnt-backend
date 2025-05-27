/**
 * Global constants for the application
 */

// User roles
const ROLES = {
  ADMIN: 1,
  SALES: 2,
};

// Role names mapping
const ROLE_NAMES = {
  1: 'Admin',
  2: 'Sales',
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
};

// JWT
const JWT = {
  EXPIRES_IN: '365d',
};

module.exports = {
  ROLES,
  ROLE_NAMES,
  HTTP_STATUS,
  PAGINATION,
  JWT,
};

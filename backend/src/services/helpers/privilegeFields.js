import { USER_ROLES, USER_STATUSES } from "#config/constants.js";

/**
 * Privileged account fields that a non-admin must never set on self-update.
 * @param {Object} [updates={}]
 * @returns {Object} shallow copy without role/status
 */
export const stripPrivilegedUserFields = (updates = {}) => {
  const rest = { ...updates };
  delete rest.role;
  delete rest.status;
  return rest;
};

/**
 * Public registration always creates an active regular user.
 * Callers must not spread request body privileges into User.create.
 * @returns {{role: string, status: string}}
 */
export const publicRegistrationPrivileges = () => ({
  role: USER_ROLES.USER,
  status: USER_STATUSES.ACTIVE,
});

/**
 * Whether the given updates would stop this user from being an active admin.
 * Caller must also check that this is the last active admin before rejecting.
 * @param {{role?: string, status?: string}} currentUser
 * @param {Object} [updates={}]
 * @returns {boolean}
 */
export const wouldDropActiveAdmin = (currentUser, updates = {}) => {
  if (currentUser.role !== USER_ROLES.ADMIN) {
    return false;
  }

  const nextRole = updates.role !== undefined ? updates.role : currentUser.role;
  const nextStatus = updates.status !== undefined ? updates.status : currentUser.status;

  return !(nextRole === USER_ROLES.ADMIN && nextStatus === USER_STATUSES.ACTIVE);
};

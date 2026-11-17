import {
  stripPrivilegedUserFields,
  publicRegistrationPrivileges,
  wouldDropActiveAdmin,
} from "../privilegeFields.js";
import { USER_ROLES, USER_STATUSES } from "#config/constants.js";

describe("privilegeFields", () => {
  describe("publicRegistrationPrivileges", () => {
    it("always returns an active regular user", () => {
      expect(publicRegistrationPrivileges()).toEqual({
        role: USER_ROLES.USER,
        status: USER_STATUSES.ACTIVE,
      });
    });
  });

  describe("stripPrivilegedUserFields", () => {
    it("removes role and status and keeps profile fields", () => {
      const result = stripPrivilegedUserFields({
        name: "Ada",
        phone: "123",
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.SUSPENDED,
      });

      expect(result).toEqual({ name: "Ada", phone: "123" });
      expect(result).not.toHaveProperty("role");
      expect(result).not.toHaveProperty("status");
    });

    it("does not mutate the original object", () => {
      const updates = { name: "Ada", role: USER_ROLES.ADMIN };
      stripPrivilegedUserFields(updates);
      expect(updates.role).toBe(USER_ROLES.ADMIN);
    });
  });

  describe("wouldDropActiveAdmin", () => {
    const admin = { role: USER_ROLES.ADMIN, status: USER_STATUSES.ACTIVE };

    it("is false for a regular user", () => {
      expect(
        wouldDropActiveAdmin(
          { role: USER_ROLES.USER, status: USER_STATUSES.ACTIVE },
          { role: USER_ROLES.USER }
        )
      ).toBe(false);
    });

    it("is false when an admin keeps role and status", () => {
      expect(wouldDropActiveAdmin(admin, { name: "Ada" })).toBe(false);
    });

    it("is true when role is changed away from admin", () => {
      expect(wouldDropActiveAdmin(admin, { role: USER_ROLES.USER })).toBe(true);
    });

    it("is true when an admin is set inactive or suspended", () => {
      expect(wouldDropActiveAdmin(admin, { status: USER_STATUSES.INACTIVE })).toBe(true);
      expect(wouldDropActiveAdmin(admin, { status: USER_STATUSES.SUSPENDED })).toBe(true);
    });
  });
});

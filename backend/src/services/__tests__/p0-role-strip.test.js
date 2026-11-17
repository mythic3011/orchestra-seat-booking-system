import { jest } from "@jest/globals";
import { USER_ROLES, USER_STATUSES } from "#config/constants.js";

const mockFindOne = jest.fn();
const mockCount = jest.fn();
const mockCreate = jest.fn();
const mockHashPassword = jest.fn(async (password) => `hashed:${password}`);
const mockFindEntityOrThrow = jest.fn();
const mockCheckUniqueFields = jest.fn();
const mockDeleteProfileImageFile = jest.fn();

await jest.unstable_mockModule("#models/index.js", () => ({
  User: {
    findOne: mockFindOne,
    count: mockCount,
    create: mockCreate,
  },
}));

await jest.unstable_mockModule("#utils/hash.js", () => ({
  hashPassword: mockHashPassword,
  comparePassword: jest.fn(),
}));

await jest.unstable_mockModule("../helpers/entityHelpers.js", () => ({
  findEntityOrThrow: mockFindEntityOrThrow,
  checkUniqueFields: mockCheckUniqueFields,
}));

await jest.unstable_mockModule("#utils/fileCleanup.js", () => ({
  deleteProfileImageFile: mockDeleteProfileImageFile,
}));

const { register } = await import("../authService.js");
const { updateUser } = await import("../userService.js");
const { ForbiddenError } = await import("#utils/errors.js");

const baseRegister = {
  email: "ada@example.com",
  username: "ada",
  password: "secret1",
  name: "Ada",
  phone: "123",
};

describe("P0 role/status strip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockResolvedValue(null);
    mockCount.mockResolvedValue(0);
  });

  describe("T1 register", () => {
    const created = (attrs) => ({
      toSafeObject: () => ({
        role: attrs.role,
        status: attrs.status,
        email: attrs.email,
        username: attrs.username,
      }),
    });

    it("stores role user when no privileged fields are sent", async () => {
      mockCreate.mockImplementation(async (attrs) => created(attrs));

      const result = await register(baseRegister);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const attrs = mockCreate.mock.calls[0][0];
      expect(attrs.role).toBe(USER_ROLES.USER);
      expect(attrs.status).toBe(USER_STATUSES.ACTIVE);
      expect(result.role).toBe(USER_ROLES.USER);
    });

    it("ignores a privileged role in the registration payload", async () => {
      mockCreate.mockImplementation(async (attrs) => created(attrs));

      const result = await register({
        ...baseRegister,
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.SUSPENDED,
      });

      const attrs = mockCreate.mock.calls[0][0];
      expect(attrs.role).toBe(USER_ROLES.USER);
      expect(attrs.status).toBe(USER_STATUSES.ACTIVE);
      expect(result.role).toBe(USER_ROLES.USER);
      expect(result.status).toBe(USER_STATUSES.ACTIVE);
    });
  });

  describe("T2 self-update", () => {
    const makeUser = (overrides = {}) => {
      const user = {
        email: "ada@example.com",
        username: "ada",
        role: USER_ROLES.USER,
        status: USER_STATUSES.ACTIVE,
        profileImage: null,
        update: jest.fn(async function apply(updates) {
          Object.assign(this, updates);
        }),
        toSafeObject() {
          return { role: this.role, status: this.status, name: this.name };
        },
        ...overrides,
      };
      return user;
    };

    it("strips role and status for a non-admin caller and leaves them unchanged", async () => {
      const user = makeUser();
      mockFindEntityOrThrow.mockResolvedValue(user);

      const result = await updateUser(
        "user-1",
        { name: "Ada Lovelace", role: USER_ROLES.ADMIN, status: USER_STATUSES.SUSPENDED },
        { role: USER_ROLES.USER, id: "user-1" }
      );

      expect(user.update).toHaveBeenCalledTimes(1);
      const persisted = user.update.mock.calls[0][0];
      expect(persisted).toEqual({ name: "Ada Lovelace" });
      expect(persisted).not.toHaveProperty("role");
      expect(persisted).not.toHaveProperty("status");
      expect(result.role).toBe(USER_ROLES.USER);
      expect(result.status).toBe(USER_STATUSES.ACTIVE);
    });

    it("allows an admin to change another user's role", async () => {
      const user = makeUser();
      mockFindEntityOrThrow.mockResolvedValue(user);

      await updateUser("user-1", { role: USER_ROLES.ADMIN }, { role: USER_ROLES.ADMIN, id: "admin-1" });

      expect(user.update).toHaveBeenCalledWith(expect.objectContaining({ role: USER_ROLES.ADMIN }));
    });

    it("rejects demoting the last active admin", async () => {
      const admin = makeUser({ role: USER_ROLES.ADMIN, status: USER_STATUSES.ACTIVE });
      mockFindEntityOrThrow.mockResolvedValue(admin);
      mockCount.mockResolvedValue(1);

      await expect(
        updateUser("admin-1", { role: USER_ROLES.USER }, { role: USER_ROLES.ADMIN, id: "admin-1" })
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(admin.update).not.toHaveBeenCalled();
    });
  });
});

const categoryService = require("../../services/categoryService");
const { User } = require("../../models");

describe("CategoryService", () => {
  const baseUser = {
    name: "Category Service User",
    userName: "catserviceuser",
    email: "catservice@example.com",
    password: "TestPass123!",
  };

  const createUser = async () => {
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(baseUser.password, salt);

    return User.create({
      name: baseUser.name,
      userName: baseUser.userName,
      email: baseUser.email,
      password: hashedPassword,
    });
  };

  test("createCategory creates a category for user", async () => {
    const user = await createUser();

    const category = await categoryService.createCategory(
      { name: "Food", color: "#FF5722", icon: "🍔" },
      user.id
    );

    expect(category).toHaveProperty("id");
    expect(category).toHaveProperty("name", "Food");
    expect(category).toHaveProperty("userId", user.id);
  });

  test("getCategories returns user categories", async () => {
    const user = await createUser();

    await categoryService.createCategory({ name: "Food" }, user.id);
    await categoryService.createCategory({ name: "Transport" }, user.id);

    const categories = await categoryService.getCategories(user.id);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBe(2);
  });
});

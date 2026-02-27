const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Categories integration", () => {
  const user = {
    name: "Cat User",
    userName: "catuser",
    email: "cat@example.com",
    password: "TestPass123!",
  };

  const registerAndLogin = async () => {
    await request(app).post("/api/v1/auth/register").send(user);

    const dbUser = await User.findOne({ where: { email: user.email } });
    const token = dbUser?.emailVerificationToken;
    expect(token).toBeTruthy();
    await request(app).post("/api/v1/auth/verify-email").send({ token });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ userName: user.userName, password: user.password });

    return loginRes.body.data.tokens.accessToken;
  };

  test("POST /api/v1/categories creates category", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Food", color: "#FF5722", icon: "🍔" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name", "Food");
  });

  test("GET /api/v1/categories lists categories", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Food", color: "#FF5722" });

    const res = await request(app)
      .get("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/v1/categories/stats returns stats", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/categories/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

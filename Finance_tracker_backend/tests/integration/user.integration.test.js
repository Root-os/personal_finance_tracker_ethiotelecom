const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Users integration", () => {
  const user = {
    name: "User Me",
    userName: "usermetest",
    email: "me@example.com",
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

  test("GET /api/v1/users/me returns profile", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("userName", user.userName);
    expect(res.body.data).not.toHaveProperty("password");
  });

  test("PUT /api/v1/users/me updates profile", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .put("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("name", "Updated Name");
  });
});

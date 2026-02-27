const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Auth integration", () => {
  const user = {
    name: "Integration User",
    userName: "integrationuser",
    email: "integration@example.com",
    password: "TestPass123!",
  };

  test("POST /api/v1/auth/register registers user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // User provides email, so tokens should be null until verified
    expect(res.body.data.tokens).toBeNull();
  });

  const verifyRegisteredUser = async () => {
    const dbUser = await User.findOne({ where: { email: user.email } });
    const token = dbUser?.emailVerificationToken;
    expect(token).toBeTruthy();

    const verifyRes = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
  };

  test("POST /api/v1/auth/login logs user in", async () => {
    await request(app).post("/api/v1/auth/register").send(user);
    await verifyRegisteredUser();

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ userName: user.userName, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens).toHaveProperty("accessToken");
    expect(res.body.data.tokens).toHaveProperty("refreshToken");
  });

  test("POST /api/v1/auth/refresh-token rotates tokens", async () => {
    await request(app).post("/api/v1/auth/register").send(user);
    await verifyRegisteredUser();

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ userName: user.userName, password: user.password });

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken: loginRes.body.data.tokens.refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.tokens).toHaveProperty("accessToken");
    expect(refreshRes.body.data.tokens).toHaveProperty("refreshToken");
  });
});

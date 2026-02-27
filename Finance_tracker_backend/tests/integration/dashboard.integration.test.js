const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Dashboard integration", () => {
  const user = {
    name: "Dash User",
    userName: "dashuser",
    email: "dash@example.com",
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

  test("GET /api/v1/dashboard/stats returns dashboard stats", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/dashboard/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("monthly");
    expect(res.body.data).toHaveProperty("total");
  });

  test("GET /api/v1/dashboard/quick-stats returns quick stats", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/dashboard/quick-stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("weekly");
    expect(res.body.data).toHaveProperty("monthly");
    expect(res.body.data).toHaveProperty("yearly");
  });
});

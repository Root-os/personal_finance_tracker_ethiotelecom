const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Analytics integration", () => {
  const user = {
    name: "Analytics User",
    userName: "analyticsuser",
    email: "analytics@example.com",
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

  test("GET /api/v1/analytics/summary works", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/analytics/summary?period=month")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalIncome");
    expect(res.body.data).toHaveProperty("totalExpense");
    expect(res.body.data).toHaveProperty("balance");
  });

  test("GET /api/v1/analytics/trends works", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/analytics/trends?months=3")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data).toBe("object");
  });
});

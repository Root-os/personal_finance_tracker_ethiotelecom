const request = require("supertest");
const app = require("../../index");
const { User } = require("../../models");

describe("Transactions integration", () => {
  const user = {
    name: "Txn User",
    userName: "txnuser",
    email: "txn@example.com",
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

  const createCategory = async (token) => {
    const res = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Food", color: "#FF5722" });

    return res.body.data.id;
  };

  test("POST /api/v1/transactions creates transaction", async () => {
    const token = await registerAndLogin();
    const categoryId = await createCategory(token);

    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId,
        amount: 25.5,
        type: "expense",
        date: "2026-02-25",
        description: "Lunch",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
  });

  test("GET /api/v1/transactions returns paginated list", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .get("/api/v1/transactions?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("transactions");
    expect(res.body.data).toHaveProperty("pagination");
  });
});

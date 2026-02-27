const transactionService = require("../../services/transactionService");
const categoryService = require("../../services/categoryService");
const { User } = require("../../models");

describe("TransactionService", () => {
  const baseUser = {
    name: "Transaction Service User",
    userName: "txnserviceuser",
    email: "txnservice@example.com",
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

  test("createTransaction creates transaction for user", async () => {
    const user = await createUser();
    const category = await categoryService.createCategory({ name: "Food" }, user.id);

    const txn = await transactionService.createTransaction(
      {
        categoryId: category.id,
        amount: 25.5,
        type: "expense",
        date: "2026-02-25",
        description: "Lunch",
      },
      user.id
    );

    expect(txn).toHaveProperty("id");
    expect(txn).toHaveProperty("amount");
    expect(txn).toHaveProperty("type", "expense");
    expect(txn).toHaveProperty("userId", user.id);
  });

  test("getTransactions returns pagination object", async () => {
    const user = await createUser();

    const result = await transactionService.getTransactions(user.id, {
      page: 1,
      limit: 10,
    });

    expect(result).toHaveProperty("transactions");
    expect(result).toHaveProperty("pagination");
  });
});

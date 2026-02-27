"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
    async up({ context: queryInterface }) {
        const hasTable = async (tableName) => {
            const tables = await queryInterface.showAllTables();
            const normalized = tables.map((t) => (typeof t === "string" ? t : t.tableName || t.name || ""));
            return normalized.includes(tableName);
        };

        const hasIndex = async (tableName, indexName) => {
            try {
                const indexes = await queryInterface.showIndex(tableName);
                return indexes.some((idx) => idx.name === indexName);
            } catch (e) {
                return false;
            }
        };

        // 1. Users Table
        if (!(await hasTable("Users"))) {
            await queryInterface.createTable("Users", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                userName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                emailVerified: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                emailVerificationToken: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                emailVerificationExpires: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                passwordResetToken: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                passwordResetExpires: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // 2. Categories Table
        if (!(await hasTable("Categories"))) {
            await queryInterface.createTable("Categories", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                color: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                icon: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "Users", key: "id" },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // 3. Transactions Table
        if (!(await hasTable("Transactions"))) {
            await queryInterface.createTable("Transactions", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                type: {
                    type: DataTypes.ENUM("income", "expense"),
                    allowNull: false,
                },
                date: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "Users", key: "id" },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                categoryId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "Categories", key: "id" },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // 4. RefreshTokens Table (Full schema with UA, IP, Location)
        if (!(await hasTable("RefreshTokens"))) {
            await queryInterface.createTable("RefreshTokens", {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                token: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                tokenHash: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                    unique: true,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                isRevoked: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                userAgent: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                ipAddress: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                location: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: { model: "Users", key: "id" },
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            });
        }

        // 5. Indexes
        if (await hasTable("RefreshTokens")) {
            if (!(await hasIndex("RefreshTokens", "refresh_tokens_userId"))) {
                await queryInterface.addIndex("RefreshTokens", ["userId"], { name: "refresh_tokens_userId" });
            }
            if (!(await hasIndex("RefreshTokens", "refresh_tokens_expiresAt"))) {
                await queryInterface.addIndex("RefreshTokens", ["expiresAt"], { name: "refresh_tokens_expiresAt" });
            }
            if (!(await hasIndex("RefreshTokens", "refresh_tokens_isRevoked"))) {
                await queryInterface.addIndex("RefreshTokens", ["isRevoked"], { name: "refresh_tokens_isRevoked" });
            }
        }

        if (await hasTable("Categories")) {
            if (!(await hasIndex("Categories", "categories_userId"))) {
                await queryInterface.addIndex("Categories", ["userId"], { name: "categories_userId" });
            }
            if (!(await hasIndex("Categories", "categories_userId_name"))) {
                await queryInterface.addIndex("Categories", ["userId", "name"], { name: "categories_userId_name", unique: true });
            }
        }

        if (await hasTable("Transactions")) {
            if (!(await hasIndex("Transactions", "transactions_userId"))) {
                await queryInterface.addIndex("Transactions", ["userId"], { name: "transactions_userId" });
            }
            if (!(await hasIndex("Transactions", "transactions_categoryId"))) {
                await queryInterface.addIndex("Transactions", ["categoryId"], { name: "transactions_categoryId" });
            }
            if (!(await hasIndex("Transactions", "transactions_date"))) {
                await queryInterface.addIndex("Transactions", ["date"], { name: "transactions_date" });
            }
            if (!(await hasIndex("Transactions", "transactions_userId_date"))) {
                await queryInterface.addIndex("Transactions", ["userId", "date"], { name: "transactions_userId_date" });
            }
        }
    },

    async down({ context: queryInterface }) {
        await queryInterface.dropTable("RefreshTokens");
        await queryInterface.dropTable("Transactions");
        await queryInterface.dropTable("Categories");
        await queryInterface.dropTable("Users");
    },
};

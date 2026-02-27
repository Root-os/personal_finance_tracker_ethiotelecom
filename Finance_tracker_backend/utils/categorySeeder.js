const { Category } = require("../models");
const logger = require("./logger");

const defaultCategories = [
    { name: "Housing & Rent", icon: "🏠", color: "#EF4444" },
    { name: "Food & Injera", icon: "🍲", color: "#F59E0B" },
    { name: "Transport (Taxi/Ride)", icon: "🚗", color: "#10B981" },
    { name: "Utilities (Electric/Water)", icon: "⚡", color: "#3B82F6" },
    { name: "Equb & Savings", icon: "💰", color: "#8B5CF6" },
    { name: "Insurance", icon: "🛡️", color: "#6366F1" },
    { name: "Healthcare", icon: "🏥", color: "#EC4899" },
    { name: "Personal Care", icon: "✨", color: "#06B6D4" },
    { name: "Entertainment & Coffee", icon: "☕", color: "#F43F5E" },
    { name: "Shopping", icon: "🛍️", color: "#F97316" },
    { name: "Miscellaneous", icon: "📦", color: "#64748B" },
];

const seedCategories = async (userId) => {
    if (!userId) {
        logger.error("❌ Cannot seed categories: No userId provided.");
        return;
    }

    try {
        const count = await Category.count({ where: { userId } });
        if (count > 0) {
            logger.info(`ℹ️ Categories already exist for user ${userId}, skipping seeding.`);
            return;
        }

        logger.info(`🌱 Seeding default categories for user ${userId}...`);
        const userCategories = defaultCategories.map(cat => ({
            ...cat,
            userId
        }));

        await Category.bulkCreate(userCategories);
        logger.info(`✅ Categories seeded successfully for user ${userId}.`);
    } catch (error) {
        logger.error(`❌ Error seeding categories for user ${userId}:`, {
            message: error.message,
            stack: error.stack,
            error
        });
    }
};

module.exports = { seedCategories };

const Joi = require("joi");
// Define the schema for environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  LOG_LEVEL: Joi.string().valid("error", "warn", "info", "http", "verbose", "debug", "silly").default("info"),

  // Database
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_DIALECT: Joi.string().valid("mysql", "postgres", "sqlite", "mariadb", "mssql").default("mysql"),

  // Auth
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default("1h"),
  JWT_REFRESH_EXPIRE: Joi.string().default("7d"),

  // Mail
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),

  // URLs
  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().required(),
}).unknown().required();

const userSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  userName: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password is required'
    })
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional()
});

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  icon: Joi.string().max(50).optional()
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  icon: Joi.string().max(50).optional()
});

const transactionSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required()
    .messages({ "any.required": "categoryId is required", "number.base": "categoryId must be a number" }),
  amount: Joi.number().positive().precision(2).required()
    .messages({ "any.required": "amount is required", "number.base": "amount must be a number", "number.positive": "amount must be positive" }),
  type: Joi.string().valid("income", "expense").required()
    .messages({ "any.required": "type is required", "any.only": "type must be either 'income' or 'expense'" }),
  date: Joi.date().required()
    .messages({ "any.required": "date is required", "date.base": "date must be a valid date" }),
  description: Joi.string().max(1000).allow(null, "")
    .messages({ "string.max": "description cannot exceed 1000 characters" }),
});

const updateTransactionSchema = Joi.object({
  categoryId: Joi.number().integer().positive(),
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid("income", "expense"),
  date: Joi.date(),
  description: Joi.string().max(1000).allow(null, "")
});

const transactionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  categoryId: Joi.number().integer().positive(),
  type: Joi.string().valid("income", "expense"),
  startDate: Joi.date(),
  endDate: Joi.date().min(Joi.ref('startDate')),
  search: Joi.string().max(100)
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional().messages({
    "string.empty": "Refresh token cannot be empty"
  })
});

const loginSchema = Joi.object({
  userName: Joi.string().required().messages({
    "any.required": "userName is required",
    "string.empty": "userName cannot be empty"
  }),
  password: Joi.string().required().messages({
    "any.required": "password is required",
    "string.empty": "password cannot be empty"
  })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Verification token required",
    "string.empty": "Verification token required"
  })
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional().messages({
    "string.empty": "Refresh token cannot be empty"
  })
});

const passwordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email"
  })
});

const passwordResetConfirmSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required"
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).+$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      'string.min': 'Password must be at least 8 characters long',
      'string.empty': 'Password is required'
    })
});

module.exports = {
  envSchema,
  userSchema,
  userUpdateSchema,
  categorySchema,
  categoryUpdateSchema,
  transactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  refreshTokenSchema,
  loginSchema,
  verifyEmailSchema,
  logoutSchema,
  passwordResetSchema,
  passwordResetConfirmSchema
};

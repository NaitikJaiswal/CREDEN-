import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creden',
  jwtSecret: process.env.JWT_SECRET || 'creden_super_secret_jwt_key_sih_prototype_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  hmacSecret: process.env.HMAC_SECRET || 'creden_apaar_identifier_salt_key_secure_2026',
  isDemoMode: process.env.IS_DEMO_MODE !== 'false', // Default to true for SIH prototype
};


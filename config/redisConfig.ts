import dotenv from "dotenv";
dotenv.config();

const pool = {
  redisInfo: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
    database: process.env.DB_NUM,
    password: process.env.REDIS_PW,
  }
};

export default pool;
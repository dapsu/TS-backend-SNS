import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const generateAccessToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN!, {
      expiresIn: "15m",   // 15분 간격으로 access 토큰 발급
  });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN!, {
      expiresIn: "60 days",   // 60일 기준으로 refresh 토큰 발급
  });
};

export { generateAccessToken, generateRefreshToken };
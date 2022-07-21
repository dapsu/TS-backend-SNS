import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import RefreshToken from '../models/refreshToken';
import { generateAccessToken } from './generateToken';

dotenv.config();

// 엑세스 토큰 기반으로 사용자 인증 유효성 검사
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];  // request의 헤더의 authorization 옵션에서 토큰 추출
  const token = authHeader && authHeader.split(' ')[1];   // 토큰의 타입인 Bearer 키워드 제외
  if (!token) {
    return res
      .status(400)
      .json({
        message: '토큰 형식이 잘못되었거나, 토큰이 전달되지 않았습니다.'
      });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN!, async (error, user) => {
    if (error) {  // 엑세스 토큰이 만료되었다면 리프레시 토큰을 활용하여 엑세스 토큰 재발급
      const decoded = jwt.decode(token);
      const refreshToken = await RefreshToken.findOne({   // 토큰 디코딩한 값에서 유저id로 리프레시 토큰 검증
        where: {
          UserUserId: decoded!.id
        }
      });
      jwt.verify(refreshToken!.dataValues.refreshToken, process.env.JWT_REFRESH_TOKEN!, async (error: any, user: any) => {
        if (error) {
          await RefreshToken.destroy({
            where: {
              UserUserId: decoded!.id
            }
          });
          return res
            .status(403)
            .json({
              message: '리프레시 토큰이 만료되었습니다. 재로그인이 필요합니다.'
            });
        }
        const accessToken = generateAccessToken(user!.id);
        return res
          .status(200)
          .json({ accessToken })
      });
    } else {
      req.user = user;
      next();
    }
  });
}

export default authenticateToken;
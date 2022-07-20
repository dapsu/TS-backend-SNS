import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import User from '../models/user';
import RefreshToken from '../models/refreshToken';


dotenv.config();

class UserController {
  // 회원가입
  static async join(req: Request, res: Response) {
    try {
      const { userId, name, password } = req.body;

      const exUser = await User.findOne({
        where: {
          userId: userId
        }
      });
      if (exUser) {
        return res
          .status(403)
          .json({
            message: '이미 사용 중인 아이디입니다.'
          });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt); // 패스워드 암호화

      await User.create({
        userId: userId,
        name: name,
        password: hashedPassword
      });

      return res
        .status(201)
        .json({
          message: '회원가입이 완료되었습니다.'
        });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({
          message: '서버 에러입니다. 에러가 지속되면 관리자에게 문의주세요.'
        });
    }
  }

  // 로그인
  static async login(req: Request, res: Response) {
    try {
      const { userId, password } = req.body;
      const exUser = await User.findOne({
        where: {
          userId: userId
        }
      });
      if (!exUser) {
        return res
          .status(400)
          .json({
            message: '유효하지 않은 아이디입니다.'
          });
      }

      const isMatch = await bcrypt.compare(password, exUser.dataValues.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({
            message: '유효하지 않은 비밀번호입니다.'
          });
      }

      const accessToken = generateAccessToken(userId);
      
      const exToken = await RefreshToken.findOne({
        where: {
          UserUserId: userId
        }
      });
      if (!exToken) {
        const refreshToken = generateRefreshToken(userId);
        await RefreshToken.create({   // refrsh token DB에 저장
          refreshToken: refreshToken,
          UserUserId: userId
        });
      }

      return res
        .status(200)
        .json({
          message: '로그인되었습니다',
          accessToken
        });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({
          message: '서버 에러입니다. 에러가 지속되면 관리자에게 문의주세요.'
        });
    }
  }
}

export default UserController;
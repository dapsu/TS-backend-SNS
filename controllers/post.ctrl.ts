import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import Post from '../models/post';
import User from '../models/user';


dotenv.config();

class PostController {
  // 게시글 생성
  static async createPost (req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const {title, content, hashtags} = req.body;
      
      await Post.create({   // posts 테이블에 데이터 추가
        title: title,
        content: content,
        UserUserId: userId
      });

      return res
        .status(200)
        .json({
          message: '포스팅되었습니다.'
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

  // 게시글 수정
  static async setPost (req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const {title, content, hashtags} = req.body;
      
      await Post.create({   // posts 테이블에 데이터 추가
        title: title,
        content: content,
        UserUserId: userId
      });

      return res
        .status(200)
        .json({
          message: '포스팅되었습니다.'
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

export default PostController;
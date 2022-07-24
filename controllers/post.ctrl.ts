import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import Post from '../models/post';
import Like from '../models/like';

dotenv.config();

class PostController {
  // 게시글 생성
  // TODO: 해시태그 기능
  static async createPost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { title, content, hashtags } = req.body;

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
  // TODO: 해시태그 기능
  static async setPost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const { title, content, hashtags } = req.body;

      await Post.findOne({
        where: {
          postId: postId
        }
      })
        .then(post => {
          if (!post) {  // 존재하지 않는 게시글일 때
            return res
              .status(404)
              .json({
                message: '해당 게시글를 찾을 수 없습니다.'
              });
          }
          if (post.UserUserId !== userId) {   // 다른 사용자가 게시글에 접근하려고 할 떄
            return res
              .status(401)
              .json({
                message: '해당 게시글에 접근할 권한이 없습니다.'
              });
          }
          if (title) {
            post.title = title;
          }
          if (content) {
            post.content = content;
          }

          post.save()   // 수정사항 저장
            .then(_ => {
              return res
                .status(200)
                .json({
                  message: '해당 게시글을 수정했습니다.'
                });
            });
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

  // 게시글 삭제(soft-delete)
  static async deletePost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;

      await Post.findOne({
        where: {
          postId: postId
        }
      })
        .then(async (post) => {
          if (!post) {  // 존재하지 않는 게시글일 때
            return res
              .status(404)
              .json({
                message: '해당 게시글를 찾을 수 없습니다.'
              });
          }
          if (post.UserUserId !== userId) {   // 다른 사용자가 게시글에 접근하려고 할 떄
            return res
              .status(401)
              .json({
                message: '해당 게시글에 접근할 권한이 없습니다.'
              });
          }
          await Post.destroy({
            where: {
              postId: postId,
              UserUserId: userId
            }
          })
            .then(_ => {
              return res
                .status(200)
                .json({
                  message: '해당 게시글을 삭제했습니다.'
                });
            });
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

  // 삭제된 게시글 복구
  static async restorePost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;

      await Post.findOne({
        where: {
          postId: postId
        },
        paranoid: false
      })
        .then(async (post) => {
          if (!post!.deletedAt) {  // 존재하지 않는 게시글일 때
            return res
              .status(404)
              .json({
                message: '해당 게시글를 찾을 수 없습니다.'
              });
          }
          if (post!.UserUserId !== userId) {   // 다른 사용자가 게시글에 접근하려고 할 떄
            return res
              .status(401)
              .json({
                message: '해당 게시글에 접근할 권한이 없습니다.'
              });
          }
          await Post.restore({
            where: {
              postId: postId,
              UserUserId: userId
            }
          })
            .then(_ => {
              return res
                .status(200)
                .json({
                  message: '해당 게시글을 복구했습니다.'
                });
            });
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

  // 특정 게시글 조회
  // TODO: 해시태그 기능
  static async getPost(req: Request, res: Response) {
    try {
      const postId = req.params.postId;

      const post = await Post.findOne({
        where: {
          postId: postId
        }
      });

      if (!post) {  // 존재하지 않는 게시글일 때
        return res
          .status(404)
          .json({
            message: '해당 게시글를 찾을 수 없습니다.'
          });
      }

      await Post.increment({  // 게시글 조회 시 조회수 1씩 증가 
        views: 1
      }, {
        where: {
          postId: postId
        }
      });

      const likes = await Like.findAll({
        where: {
          PostPostId: postId
        },
        attributes: ['liker']
      });

      return res
        .status(200)
        .json({
          title: post.title,
          content: post.content,
          views: post.views + 1,
          likes: likes.length
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

  // 좋아요, 좋아요 취소
  static async likePost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;

      await Like.findOne({
        where: {
          liker: userId,
          PostPostId: postId
        }
      })
        .then(async (data) => {
          if (!data) {
            await Like.create({
              liker: userId,
              PostPostId: postId
            });
            return res
              .status(200)
              .json({
                message: '이 글을 좋아합니다!'
              });
          }
          await Like.destroy({
            where: {
              liker: userId,
            PostPostId: postId
            }
          });
          return res
            .status(200)
            .json({
              message: '좋아요를 취소합니다!'
            });
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
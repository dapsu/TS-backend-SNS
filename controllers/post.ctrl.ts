import dotenv from 'dotenv';
import sequelize from 'sequelize';
import { Request, Response } from 'express';
import Post from '../models/post';
import Like from '../models/like';
import Hashtag from '../models/hashtag';

dotenv.config();

class PostController {
  // 게시글 생성
  static async createPost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      let { title, content, hashtags } = req.body;

      const newPost = await Post.create({   // posts 테이블에 데이터 추가
        title: title,
        content: content,
        UserUserId: userId
      });
      await newPost.createHashtag({
        tagName: hashtags
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
  static async setPost(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      let { title, content, hashtags } = req.body;

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
          if (title) {
            post.title = title;
          }
          if (content) {
            post.content = content;
          }
          if (hashtags) {
            await Hashtag.findOne({
              where: {
                PostPostId: postId
              }
            })
              .then(hashtag => {
                hashtag!.tagName = hashtags;
                hashtag!.save();
              });
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

      const likers = await Like.findAll({
        where: {
          PostPostId: postId
        },
        attributes: ['liker']
      });

      const hashtags = await post.getHashtag({
        attributes: ['tagName']
      });

      return res
        .status(200)
        .json({
          title: post.title,
          content: post.content,
          views: post.views + 1,
          likers: likers.map(obj => obj.dataValues.liker),
          hashtags: hashtags
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

  // 게시글 목록 조회
  static async getList(req: Request, res: Response) {
    try {
      let result: Array<any>;   // 조회 최종 결과물
      const orderBy = req.query.orderBy || 'descending';
      const search = req.query.search;
      const filtering = req.query.filtering;
      const pages = parseInt(<string>req.query.pages!, 10) || 10;   // 한 페이지에 보여줄 게시글 개수
      const pageNum = parseInt(<string>req.query.pageNum!, 10) || 1;  // 현재 페이지 번호
      const skipPages = (pageNum - 1) * pages;

      // 예외처리
      if (Number.isNaN(pages) || Number.isNaN(pageNum)) {
        return res
          .status(400)
          .json({
            message: 'pages 쿼리 파라미터가 정수형이 아닙니다.'
          });
      }
      if (pages !== 10 && pages !== 30 && pages !== 50) {   // 페이지네이션은 10, 30, 50만 가능하도록 설정
        return res
          .status(400)
          .json({
            message: 'pages 값은 10, 30, 50으로만 설정합니다.'
          });
      }
      if (orderBy !== 'ascending' && orderBy !== 'descending') {
        return res
          .status(400)
          .json({
            message: 'orderBy 쿼리 파라미터 값이 잘못되었습니다.'
          });
      }

      // 초기 정렬 최신순(내림차순)으로 설정
      if (orderBy === 'ascending') {
        result = await Post.findAll({
          include: [{
            model: Like,
            attributes: ['liker']
          }],
          attributes: ['title', 'UserUserId', 'createdAt', 'views'],
          order: [['createdAt', 'ASC']]
        });
      } else if (orderBy === 'descending') {
        result = await Post.findAll({
          include: [{
            model: Like,
            attributes: ['liker']
          }],
          attributes: ['title', 'UserUserId', 'createdAt', 'views'],
          order: [['createdAt', 'DESC']]
        });
      }

      // 검색 키워드가 존재할 때
      if (search) {
        if (orderBy === 'ascending') {
          result = await Post.findAll({
            where: {
              title: {
                [sequelize.Op.like]: `%${search}%`
              }
            },
            include: [{
              model: Like,
              attributes: ['liker']
            }],
            attributes: ['title', 'UserUserId', 'createdAt', 'views'],
            order: [['createdAt', 'ASC']]
          });
        } else if (orderBy === 'descending') {
          result = await Post.findAll({
            where: {
              title: {
                [sequelize.Op.like]: `%${search}%`
              }
            },
            include: [{
              model: Like,
              attributes: ['liker']
            }],
            attributes: ['title', 'UserUserId', 'createdAt', 'views'],
            order: [['createdAt', 'DESC']]
          });
        }
      }
      
      // 페이징 기능
      let totalPosts = result!.length;
      if (skipPages >= totalPosts) {
        return res
        .status(400)
        .json({
          message: 'pages, pageNum 값을 확인해주세요.'
        });
      } else {
        result!.splice(0, skipPages);
        result!.splice(pages, totalPosts);
      }
      
      // Likes 배열 개수로 바꾸기
      result = result!.map(value => value.dataValues);
      result?.forEach(value => {
        value.Likes = value.Likes.length;
      });

      return res
        .status(200)
        .json({
          result
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
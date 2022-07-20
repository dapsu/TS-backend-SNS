export * from './sequelize';

import User, { associate as associateUser } from './user';
import Post, { associate as associatePost } from './post';
import Hashtag, { associate as associateHashtag } from './hashtag';
import Like, { associate as associateLike } from './like';


const db = {
  User,
  Post,
  Hashtag,
  Like
};
export type dbType = typeof db;

// TODO: DB모델간 관계 형성
associateUser(db);
associatePost(db);
associateHashtag(db);
associateLike(db);
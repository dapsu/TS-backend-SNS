import { BelongsToManyAddAssociationsMixin, DataTypes, HasManyAddAssociationMixin, Model } from "sequelize";
import { dbType } from ".";
import { sequelize } from "./sequelize";
import Hashtag from "./hashtag";
import Like from "./like";

class Post extends Model {
  public readonly postId!: number;
  public content!: string;
  public views!: number;
  public state!: boolean;
  public readonly createAt!: Date;
  public readonly updateAt!: Date;

  public UserUserId!: string;

  public addLike!: HasManyAddAssociationMixin<Like, number>;
  public removeLike!: HasManyAddAssociationMixin<Like, number>;
  public addHashtags!: BelongsToManyAddAssociationsMixin<Hashtag, number>;
}

Post.init({
  postId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  sequelize,
  modelName: 'Post',
  tableName: 'posts',
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

// 모델간 관계 형성
export const associate = (db: dbType) => {
  db.Post.belongsTo(db.User);
  db.Post.hasMany(db.Like);
  db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
};

export default Post;
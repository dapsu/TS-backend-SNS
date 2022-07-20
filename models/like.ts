import { DataTypes, Model } from 'sequelize';
import { dbType } from './index';
import { sequelize } from './sequelize';

class Like extends Model {
  public readonly id!: number;
  public liker!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public PostPostId!: string;
}

Like.init({
  liker: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes',
  charset: 'utf8',
  collate: 'utf8_general_ci',
});

export const associate = (db: dbType) => {
  db.Like.belongsTo(db.Post);
};

export default Like;
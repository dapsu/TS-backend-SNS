import { DataTypes, Model } from 'sequelize';
import { dbType } from './index';
import { sequelize } from './sequelize';

class Hashtag extends Model {
  public readonly id!: number;
  public tagName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public PostHashtag!: string;
}

Hashtag.init({
  tagName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'Hashtag',
  tableName: 'hashtags',
  charset: 'utf8',
  collate: 'utf8_general_ci',
});

export const associate = (db: dbType) => {
  db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
};

export default Hashtag;
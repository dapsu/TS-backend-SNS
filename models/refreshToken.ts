import { DataTypes, Model } from 'sequelize';
import { dbType } from './index';
import { sequelize } from './sequelize';

class RefreshToken extends Model {
  public readonly id!: number;
  public refreshToken!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public UserUserId!: string;
}

RefreshToken.init({
  refreshToken: {
    type: DataTypes.STRING(250),
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'RefreshToken',
  tableName: 'refreshtokens',
  charset: 'utf8',
  collate: 'utf8_general_ci',
});

export const associate = (db: dbType) => {
  db.RefreshToken.belongsTo(db.User);
};

export default RefreshToken;
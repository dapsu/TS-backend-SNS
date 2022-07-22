import { DataTypes, HasManyAddAssociationMixin, Model } from "sequelize";
import { dbType } from ".";
import { sequelize } from "./sequelize";
import Post from "./post";

class User extends Model {
  public userId!: string;
  public name!: string;
  public password!: string;
  public readonly createAt!: Date;
  public readonly updateAt!: Date;

  public dataValues!: {
    userId: string,
    password: string
  }

  public addPost!: HasManyAddAssociationMixin<Post, number>;      // Post와 관계 형성 때 생성되는 메소드
}

// User 모델 init
User.init({
  userId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  charset: 'utf8',
  collate: 'utf8_general_ci'
});

// 관계 형성 
export const associate = (db: dbType) => {
  db.User.hasMany(db.Post);
  db.User.hasOne(db.RefreshToken);
};

export default User;
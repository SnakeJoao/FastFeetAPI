import { Model, Sequelize } from 'sequelize';

class DeliveryProblem extends Model {
  static init(sequelize) {
    super.init(
      {
        problem: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Pack, {
      foreignKey: 'delivery_id',
    });
  }
}

export default DeliveryProblem;

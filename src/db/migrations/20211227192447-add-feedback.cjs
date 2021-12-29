module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction()
        try {
            await queryInterface.addColumn(
                'Homeworks',
                'feedback',
                {
                  type: Sequelize.DataTypes.STRING,
                },
                { transaction }
            )
            await transaction.commit()
        } catch (err) {
            await transaction.rollback()
            throw err
        }
    },
    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction()
        try {
            await queryInterface.removeColumn(
              'Homeworks', 'feedback', { transaction }
            )
            await transaction.commit()
        } catch (err) {
            await transaction.rollback()
            throw err
        }
    },
}

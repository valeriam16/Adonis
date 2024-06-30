import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('street', 50).notNullable()
      table.string('suburb', 50).notNullable() //Colonia
      table.string('city', 50).notNullable()
      table.string('state', 50).notNullable()
      table.string('country', 50).notNullable()
      table.integer('zip_code', 5).notNullable()
      table.double('latitude', 9, 6).nullable();
      table.double('longitude', 9, 6).nullable();
      table.integer('user_id').unsigned().references('id').inTable('users').nullable()
      table.timestamps(true)

      //table.timestamp('created_at', { useTz: true })
      //table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

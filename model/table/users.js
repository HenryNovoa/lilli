const { Table } = require('lilli')

class UsersTable extends Table {
    constructor() {
        super('users')
    }
}

module.exports = UsersTable

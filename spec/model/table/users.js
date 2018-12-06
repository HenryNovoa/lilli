const Table = require('../../../src/table')

class UsersTable extends Table {
    constructor(query) {
        super('users', query)
    }
}

module.exports = UsersTable

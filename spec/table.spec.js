const { expect, assert } = require('chai')
const UsersTable = require('./model/table/users')

describe('table', () => {
    describe('constructor', () => {
        it('should suceed on declaration', () => {
            const usersTable = new UsersTable()
            assert.instanceOf(usersTable, UsersTable)
        })

        it('should suceed on declaration with given records', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            assert.instanceOf(usersTable, UsersTable)
        })
    })

    describe('set primary key', () => {
        it('should suceed on set primary key', () => {
            const usersTable = new UsersTable()
            usersTable.setPrimaryKey('username')
            expect(usersTable._primaryKey).to.equal('username')
        })
    })
})

const { expect, assert } = require('chai')
const UsersTable = require('./model/table/users')
const User = require('./model/entity/user')

describe('table', () => {
    describe('constructor', () => {
        it('should succeed on declaration', () => {
            const usersTable = new UsersTable()
            assert.instanceOf(usersTable, UsersTable)
        })

        it('should succeed on declaration with given records', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            assert.instanceOf(usersTable, UsersTable)
        })
    })

    describe('set primary key', () => {
        it('should succeed on set primary key', () => {
            const usersTable = new UsersTable()
            usersTable.setPrimaryKey('username')
            expect(usersTable._primaryKey).to.equal('username')
        })
    })

    describe('new entity', () => {
        it('should succeed on create new entity', () => {
            const usersTable = new UsersTable()
            const user = usersTable.newEntity({id: 1, username: 'a'})
            assert.instanceOf(user, User)
        })
    })

    describe('select', () => {
        it('should succeed on select primary keys', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const selection = usersTable.select([]).all()
            expect(selection).to.have.deep.members([{id: 1}, {id: 2}])
        })

        it('should succeed on select', () => {
            const users = [{id: 1, username: 'a', email: 'ex@mail.mu'}, {id: 2, username: 'b', email: 'exam@mail.mu'}]
            const usersTable = new UsersTable(users)
            const selection = usersTable.select(['username']).all()
            expect(selection).to.have.deep.members([{id: 1, username: 'a'}, {id: 2, username: 'b'}])
        })
    })

    describe('where', () => {
        it('should succeed on where', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const selection = usersTable.where({username: 'a'}).all()
            expect(selection).to.have.deep.members([{id: 1, username: 'a'}])
        })
    })

    describe('order', () => {
        it('should succeed on ascendent order', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const selection = usersTable.order({username: 'asc'}).all()
            expect(selection).to.have.deep.members([{id: 1, username: 'a'}, {id: 2, username: 'b'}])
        })

        it('should succeed on descentent order', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const selection = usersTable.order({username: 'desc'}).all()
            expect(selection).to.have.deep.members([{id: 2, username: 'b'}, {id: 1, username: 'a'}])
        })
    })

    describe('save', () => {
        it('should succeed on save', () => {
            const user = {id: 1, username: 'a'}
            const usersTable = new UsersTable()
            const saved = usersTable.save(user)
            expect(saved).to.deep.equal(user)
        })

        it('should succeed on update', () => {
            const usersTable = new UsersTable()
            const user = usersTable.get(1)
            user.username = 'c'
            const saved = usersTable.save(user)
            expect(saved).to.deep.equal(user)
        })
    })

    describe('delete', () => {
        it('should succeed on delete', () => {
            const usersTable = new UsersTable()
            const user = usersTable.get(1)
            const confirm = usersTable.delete(user)
            expect(confirm).to.be.true
        })
    })

    describe('group', () => {
        it('should succeed on group', () => {
            const users = [{id: 1, username: 'a', group: 'sds'}, {id: 2, username: 'b', group: 'sds'}]
            const usersTable = new UsersTable(users)
            const groups = usersTable.group(['group'])
            expect(groups).to.have.deep.members([{group: 'sds', users: [{id: 1, username: 'a', group: 'sds'}, {id: 2, username: 'b', group: 'sds'}]}])
        })

        it('should succeed on recursive group', () => {
            const users = [{id: 1, username: 'a', group: 'sds', class: 'daw'}, {id: 2, username: 'b', group: 'sds', class: 'asix'}]
            const usersTable = new UsersTable(users)
            const groups = usersTable.group(['group', 'class'])
            expect(groups).to.have.deep.members([{group: 'sds', classes: [{class: 'daw', users: [{id: 1, username: 'a', group: 'sds', class: 'daw'}]}, {class: 'asix', users: [{id: 2, username: 'b', group: 'sds', class: 'asix'}]}]}])
        })
    })

    describe('count', () => {
        it('should succeed on count', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const count = usersTable.count()
            expect(count).to.equal(2)
        })
    })

    describe('all', () => {
        it('should succeed on all', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const all = usersTable.all()
            expect(all).to.have.deep.members(users)
        })
    })

    describe('first', () => {
        it('should succeed on first', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const first = usersTable.first()
            expect(first).to.deep.equal({id: 1, username: 'a'})
        })
    })

    describe('get', () => {
        it('should succeed on get', () => {
            const users = [{id: 1, username: 'a'}, {id: 2, username: 'b'}]
            const usersTable = new UsersTable(users)
            const user = usersTable.get(2)
            expect(user).to.deep.equal({id: 2, username: 'b'})
        })
    })
})

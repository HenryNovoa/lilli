const Entity = require('../../../src/entity')

class User extends Entity {
    constructor(query) {
        super(query)

        this.id = query.id || Date.now()
        this.username = query.username || Date.now()
    }
}

module.exports = User

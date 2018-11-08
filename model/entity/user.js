const { Entity } = require('lilli')

class User extends Entity {
    constructor(query) {
        super(query)

        this.id = query.id || Date.now()
    }
}

module.exports = User

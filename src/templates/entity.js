const { Entity } = require('lilli')

class Model extends Entity {
    constructor(query) {
        super(query)

        this.id = query.id || Date.now()
    }
}

module.exports = Model

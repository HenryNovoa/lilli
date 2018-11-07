class Entity {
    constructor(query) {
        this.id = Date.now()
        for (var key in query) this[key] = query[key]
    }
}

module.exports = Entity

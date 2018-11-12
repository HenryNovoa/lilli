class Entity {
    constructor(query) {
        this.id = Date.now()
        for (let key in query) {
            this[key] = query[key]
        }
    }
}

module.exports = Entity

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')

class Table {
    constructor(table) {
        this._table = table
        this._database = path.join(process.cwd(), process.env.LILLI_DATA_DIRECTORY || 'data', table + '.json')
        this._charset = process.env.LILLI_CHARSET || 'UTF8'
        this._entity = require(`${path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'entity', pluralize.singular(table))}`)
        this._primaryKey = 'id'
        this._relations = {}
        this._data = this._readData()
        this._query = this._data.slice()
    }

    _readData() {
        const data = JSON.parse(fs.readFileSync(this._database, this._charset)) || []
        return Object.freeze(data)
    }

    _writeData(data) {
        fs.writeFileSync(this._database, JSON.stringify(data), this._charset)
        return this._readData()
    }

    _setRelation(table, props, type) {
        const model = require(`${path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'table', table)}`)
        this._relations[table] = { type, model, ...props }
    }

    _oneToOne(relatedTable, entity, index) {
        this._query[index][pluralize.singular(relatedTable._table)] = relatedTable.where({
            [this._relations[relatedTable._table].foreignKey]: entity[this._primaryKey]
        }).first()
    }

    _oneToMany(relatedTable, entity, index) {
        this._query[index][relatedTable._table] = relatedTable.where({
            [this._relations[relatedTable._table].foreignKey]: entity[this._primaryKey]
        }).all()
    }

    _manyToOne(relatedTable, entity, index) {
        this._query[index][pluralize.singular(relatedTable._table)] = relatedTable.where({
            [relatedTable._primaryKey]: entity[this._relations[relatedTable._table].foreignKey]
        }).first()
    }

    _manyToMany(relatedTable, entity, index) {
        this._oneToMany(relatedTable, entity, index)
    }

    setPrimaryKey(key) {
        this._primaryKey = key
    }

    hasOne(table, props) {
        this._setRelation(table, props, 'oneToOne')
    }

    hasMany(table, props) {
        this._setRelation(table, props, 'oneToMany')
    }

    belongsTo(table, props) {
        this._setRelation(table, props, 'manyToOne')
    }

    belongsToMany(table, props) {
        this._setRelation(table, props, 'manyToMany')
    }

    newEntity(query) {
        return new this._entity(query)
    }

    contains(tables) {
        tables.forEach(table => {
            this._query.forEach((element, index) => {
                const relatedTable = new this._relations[table].model
                this[`_${this._relations[table].type}`](relatedTable, element, index)
            })
        })

        return this
    }

    where(query) {
        for(let key in query) {
            this._query = this._query.filter(element => element[key] == query[key])
        }

        return this
    }

    order(query) {
        const fields = Object.keys(query)
        const direction = Object.values(query)
        this._query.sort((a, b) => {
            let result, index = 0
            do {
                switch (direction[index].toLowerCase()) {
                    case 'asc':
                        result = a[fields[index]] > b[fields[index]] ? 1 : (b[fields[index]] > a[fields[index]] ? -1 : 0)
                        break
                    case 'desc':
                        result = a[fields[index]] < b[fields[index]] ? 1 : (b[fields[index]] < a[fields[index]] ? -1 : 0)
                        break
                }
            } while (!result && ++index < direction.length);
            return result
        });

        return this
    }

    save(entity) {
        let data = this._data.slice()
        const index = data.findIndex(element => element[this._primaryKey] === entity[this._primaryKey])
        index < 0 ? data.push(entity) : data[index] = entity
        this._data = this._writeData(data)
        return entity
    }

    delete(entity) {
        let data = this._data.slice()
        data = data.filter(element => element[this._primaryKey] !== entity[this._primaryKey])
        this._data = this._writeData(data)
        return true
    }

    all() {
        return this._query
    }

    first() {
        return this._query[0]
    }

    get(value) {
        return this.where({ [this._primaryKey]: value }).first()
    }
}

module.exports = Table

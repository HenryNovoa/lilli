require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')

class Table {

    /**
     *
     * @param {string} table
     * @param {Array} query
     */
    constructor(table, query) {
        this._table = table
        this._database = path.join(process.cwd(), process.env.LILLI_DATA_DIRECTORY || 'data', table + '.json')
        this._charset = process.env.LILLI_CHARSET || 'UTF8'
        this._entity = require(`${path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'entity', pluralize.singular(table))}`)
        this._primaryKey = 'id'
        this._relations = {}
        this._data = this._readData()
        this._query = query || this._data.slice()
    }

    /**
     *
     * @returns {Array}
     */
    _readData() {
        const data = JSON.parse(fs.readFileSync(this._database, this._charset)) || []
        return Object.freeze(data)
    }

    /**
     *
     * @param {Array} data
     *
     * @returns {Array}
     */
    _writeData(data) {
        fs.writeFileSync(this._database, JSON.stringify(data), this._charset)
        return this._readData()
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     * @param {string} type
     */
    _setRelation(table, props, type) {
        const model = require(`${path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'table', table)}`)
        this._relations[table] = { type, model, ...props }
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     * @param {string} type
     */
    _oneToOne(relatedTable, entity, index) {
        this._query[index][pluralize.singular(relatedTable._table)] = relatedTable.where({
            [this._relations[relatedTable._table].foreignKey]: entity[this._primaryKey]
        }).first()
    }

    /**
     *
     * @param {Table} relatedTable
     * @param {Entity} entity
     * @param {number} index
     */
    _oneToMany(relatedTable, entity, index) {
        this._query[index][relatedTable._table] = relatedTable.where({
            [this._relations[relatedTable._table].foreignKey]: entity[this._primaryKey]
        }).all()
    }

    /**
     *
     * @param {Table} relatedTable
     * @param {Entity} entity
     * @param {number} index
     */
    _manyToOne(relatedTable, entity, index) {
        this._query[index][pluralize.singular(relatedTable._table)] = relatedTable.where({
            [relatedTable._primaryKey]: entity[this._relations[relatedTable._table].foreignKey]
        }).first()
    }

    /**
     *
     * @param {Table} relatedTable
     * @param {Entity} entity
     * @param {number} index
     */
    _manyToMany(relatedTable, entity, index) {
        this._oneToMany(relatedTable, entity, index)
    }

    /**
     *
     * @param {Array} query
     * @param {string} field
     * @param {Array} index
     *
     * @returns {Array}
     */
    _group(query, field, left) {
        const groups = []
        const next = left.shift()
        const table = next ? pluralize.plural(next) : this._table

        query.forEach(element => {
            let index = groups.findIndex(group => group[field] === element[field])
            if (index < 0) {
                groups.push({
                    [field]: element[field],
                    [table]: []
                })

                index = groups.length - 1
            }

            groups[index][table].push(element)
        })

        if (next) groups.forEach(group => group[table] = this._group(group[table], next, left))
        return groups
    }

    /**
     *
     * @param {string} key
     */
    setPrimaryKey(key) {
        this._primaryKey = key
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     */
    hasOne(table, props) {
        this._setRelation(table, props, 'oneToOne')
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     */
    hasMany(table, props) {
        this._setRelation(table, props, 'oneToMany')
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     */
    belongsTo(table, props) {
        this._setRelation(table, props, 'manyToOne')
    }

    /**
     *
     * @param {string} table
     * @param {Object} props
     */
    belongsToMany(table, props) {
        this._setRelation(table, props, 'manyToMany')
    }

    /**
     *
     * @param {Object} table
     *
     * @returns {Entity}
     */
    newEntity(query) {
        return new this._entity(query)
    }

    /**
     *
     * @param {Array} tables
     *
     * @returns {Table}
     */
    contains(tables) {
        tables.forEach(table => {
            this._query.forEach((element, index) => {
                const relatedTable = new this._relations[table].model
                this[`_${this._relations[table].type}`](relatedTable, element, index)
            })
        })

        return this
    }

    /**
     *
     * @param {Array} fields
     *
     * @returns {Table}
     */
    select(fields) {
        fields.push(this._primaryKey)
        this._query.forEach(element => {
            for (var key in element) {
                if (!fields.includes(key)) delete element[key]
            }
        })

        return this
    }

    /**
     *
     * @param {Object} query
     *
     * @returns {Table}
     */
    where(query) {
        for(let key in query) {
            this._query = this._query.filter(element => element[key] == query[key])
        }

        return this
    }

    /**
     *
     * @param {Object} query
     *
     * @returns {Table}
     */
    order(query) {
        const fields = Object.keys(query)
        const direction = Object.values(query)
        this._query.sort((oa, ob) => {
            let result, index = 0
            do {
                const dir = direction[index].toLowerCase()
                let a = oa[fields[index]], b = ob[fields[index]]
                if (a == null || b == null) {
                    result = dir === 'asc' ? (a === b ? 0 : (!a ? 1 : -1)) : (a === b ? 0 : (!b ? 1 : -1))
                } else if (typeof a === 'string') {
                    a = a.toLowerCase()
                    b = b.toLowerCase()
                    result = dir === 'asc' ? (a > b ? 1 : (b > a ? -1 : 0)) : (a < b ? 1 : (b < a ? -1 : 0))
                } else {
                    result = dir === 'asc' ? (a > b ? 1 : (b > a ? -1 : 0)) : (a < b ? 1 : (b < a ? -1 : 0))
                }
            } while (!result && ++index < direction.length)
            return result
        })

        return this
    }

    /**
     *
     * @param {Entity} entity
     *
     * @returns {Entity}
     */
    save(entity) {
        let data = this._data.slice()
        const index = data.findIndex(element => element[this._primaryKey] === entity[this._primaryKey])
        index < 0 ? data.push(entity) : data[index] = entity
        this._data = this._writeData(data)
        return entity
    }

    /**
     *
     * @param {Entity} entity
     *
     * @returns {boolean}
     */
    delete(entity) {
        let data = this._data.slice()
        data = data.filter(element => element[this._primaryKey] !== entity[this._primaryKey])
        this._data = this._writeData(data)
        return true
    }

    /**
     *
     * @param {Array} fields
     *
     * @returns {Array}
     */
    group(fields) {
        const field = fields.shift()
        const groups = this._group(this._query, field, fields)
        return groups
    }

    /**
     *
     * @returns {number}
     */
    count() {
        return this._query.length
    }

    /**
     *
     * @returns {Array}
     */
    all() {
        return this._query
    }

    /**
     *
     * @returns {Entity}
     */
    first() {
        return this._query[0]
    }

    /**
     *
     * @returns {Entity}
     */
    get(value) {
        return this.where({ [this._primaryKey]: value }).first()
    }
}

module.exports = Table

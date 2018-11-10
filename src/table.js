require('dotenv').config()
const fs = require('fs')
const path = require('path')
const pluralize = require('pluralize')

class Table {
    constructor(table) {
        this.table = table
        this.database = path.join(process.cwd(), process.env.LILLI_DATA_DIRECTORY || 'data', table + '.json')
        this.charset = process.env.LILLI_CHARSET || 'UTF8'
        this.entity = require(path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'entity', pluralize.singular(table)))
        this.primaryKey = 'id'
        this.foreignKeys = {}
        this.foreignTables = {}
        this.data = this.readData()
        this.query = this.data.slice()
    }

    readData() {
        const data = JSON.parse(fs.readFileSync(this.database, this.charset)) || []
        return Object.freeze(data)
    }

    writeData(data) {
        fs.writeFileSync(this.database, JSON.stringify(data), this.charset)
        return this.readData()
    }

    hasMany(table) {
        this.foreignTables[table] = require(path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model', 'table', table))
    }

    belongsTo(table) {
        this.foreignKeys = Object.assign(this.foreignKeys, table)
    }

    newEntity(query) {
        return new this.entity(query)
    }

    contains(table) {
        this.query.forEach((element, index) => {
            const foreignTable = new this.foreignTables[table]
            this.query[index][table] = foreignTable.where({
                [foreignTable.foreignKeys[this.table]]: element[this.primaryKey]
            }).all()
        })

        return this
    }

    where(query) {
        for(let key in query) {
            this.query = this.query.filter(element => element[key] == query[key])
        }

        return this
    }

    order(query) {
        const fields = Object.keys(query)
        const direction = Object.values(query)
        this.query.sort((a, b) => {
            switch (str.toLowerCase(direction[0])) {
                case 'asc':
                    return a[fields[0]] - b[fields[0]]
                case 'desc':
                    return a[fields[0]] + b[fields[0]]

            }
        });

        return this
    }

    save(entity) {
        let data = this.data.slice()
        const index = data.findIndex(element => element[this.primaryKey] === entity[this.primaryKey])
        index < 0 ? data.push(entity) : data[index] = entity
        this.data = this.writeData(data)
        return entity
    }

    delete(entity) {
        let data = this.data.slice()
        data = data.filter(element => element[this.primaryKey] !== entity[this.primaryKey])
        this.data = this.writeData(data)
        return true
    }

    all() {
        return this.query
    }

    first() {
        return this.query[0]
    }

    get(value) {
        return this.where({ [this.primaryKey]: value }).first()
    }
}

module.exports = Table

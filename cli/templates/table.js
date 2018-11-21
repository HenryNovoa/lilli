const { Table } = require('lilli')

class ModelTable extends Table {
    constructor(query) {
        super('model', query)
    }
}

module.exports = ModelTable

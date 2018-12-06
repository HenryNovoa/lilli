const { Table } = require('lilli')

class ModelTable extends Table {

    /**
     *
     * @param {Array} query
     */
    constructor(query) {
        super('model', query)
    }
}

module.exports = ModelTable

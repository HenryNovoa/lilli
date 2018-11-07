#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const pluralize = require('pluralize')

const { argv: [, , action, model] } = process
if (action) {
    switch (action) {
        case 'create':
            const modelDirectory = path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model')
            if (!fs.existsSync(modelDirectory)) fs.mkdirSync(modelDirectory)
            const tableDirectory = path.join(modelDirectory, 'table')
            if (!fs.existsSync(tableDirectory)) fs.mkdirSync(tableDirectory)
            const entityDirectory = path.join(modelDirectory, 'entity')
            if (!fs.existsSync(entityDirectory)) fs.mkdirSync(entityDirectory)

            if (model) {
                fs.writeFileSync(path.join(tableDirectory, `${model}.js`))
                fs.writeFileSync(path.join(entityDirectory, `${pluralize.singular(model)}.js`))
            } else {
                console.log(chalk.red('Model is not specified'))
            }
            break;
        case 'remove':
            break;
        default:
            console.log(chalk.red('Specified action not found'))
    }
} else {
    console.log(chalk.red('Action is not specified'))
}

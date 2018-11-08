#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const pluralize = require('pluralize')
const pkg = require('./package.json');
const dataDirectory = path.join(process.cwd(), process.env.LILLI_DATA_DIRECTORY || 'data')
const modelDirectory = path.join(process.cwd(), process.env.LILLI_MODEL_DIRECTORY || 'model')
const tableDirectory = path.join(modelDirectory, 'table')
const entityDirectory = path.join(modelDirectory, 'entity')

const { argv: [, , action, model] } = process

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

if (action) {
    try {
        if (!model) throw Error('Model is not specified')
        const dataPath = path.join(dataDirectory, `${model}.json`)
        const tablePath = path.join(tableDirectory, `${model}.js`)
        const entityPath = path.join(entityDirectory, `${pluralize.singular(model)}.js`)

        switch (action) {
            case 'create':
                if (!fs.existsSync(dataDirectory)) fs.mkdirSync(dataDirectory)
                if (!fs.existsSync(modelDirectory)) fs.mkdirSync(modelDirectory)
                if (!fs.existsSync(tableDirectory)) fs.mkdirSync(tableDirectory)
                if (!fs.existsSync(entityDirectory)) fs.mkdirSync(entityDirectory)

                if (fs.existsSync(tablePath)) throw Error(`There is already a table skeleton for the model ${chalk.bold.yellow(model.capitalize())} in your project`)
                if (fs.existsSync(entityPath)) throw Error(`There is already a entity skeleton for the model ${chalk.bold.yellow(model.capitalize())} in your project`)

                if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify([]))
                fs.writeFileSync(tablePath)
                fs.writeFileSync(entityPath)

                console.log(chalk.green(`Skeleton for model ${chalk.bold.yellow(model.capitalize())} was created successfully`))
                break;
            case 'remove':
                fs.unlinkSync(tablePath)
                fs.unlinkSync(entityPath)

                console.log(chalk.green(`Skeleton for model ${chalk.bold.yellow(model.capitalize())} was removed successfully`))
                break;
            case '--version':
                console.log(pkg.version)
                break;
            default:
                throw Error('Specified action not found')
        }
    } catch (error) {
        console.log(chalk.red(error.message))
    }
} else {
    console.log(chalk
`Usage: {bold lilli <action>} {underline model}

Available actions:

- {bold create}    creates a new model
- {bold remove}    removes all files from a given model

Models consist of a table and an entity javascript classes inside the model directory of your project
and a JSON file inside the data directory

You can specify these directories in the environment variables of your project`
    )
}

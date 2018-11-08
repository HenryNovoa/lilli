# Lilli

Lilliputian SQL-styled JSON ORM

* **Lilliputian:** Lilli is so tiny and simple you won't even notice is there!
* **Local:** Following its simplicity, you don't need a database provider to store and persist your data.
You just need a directory in your project to store all your JSON data files.
* **SQL-like:** Every JSON in your data directory works as a SQL table and the syntax in your queries will be similar to many other SQL ORMs.

## Installation

#### With npm

```
npm i lilli
```

#### With yarn

```
yarn add lilli
```

## Usage

### Setting up environment variables

Lilli uses environment variables to set custom properties:

* LILLI_DATA_DIRECTORY: Used to set the data directory inside your project, here will be stored all your JSON files. By default is `data`
* LILLI_MODEL_DIRECTORY: Used to set directory of the models inside your project. By default is `model`
* LILLI_CHARSET: Used to set the charset of your JSON files. By default is `UTF8`

### Creation of a new model

Lilli comes with an integrated CLI so you can generate skeletons for your model, just write in the console:

```
lilli create users
```

_Note that you should always use plurals for your model names_

It will create a skeleton consisting of three files, let's see them:

##### model/table/users.js

```javascript
const { Table } = require('lilli')

class UsersTable extends Table {
    constructor() {
        super('users')
    }
}

module.exports = UsersTable
```

The table. Here you will specify the relations to other tables in your project.

This is also the file you will need to require in your project to write queries, save data, and all the other stuff.

##### model/entity/user.js

```javascript
const { Entity } = require('lilli')

class User extends Entity {
    constructor(query) {
        super(query)

        this.id = query.id || Date.now()
    }
}

module.exports = User
```

The entity. Here you can set the values for your object, and their defaults.

By default an entity contains an `id` field, which is the primary key for all tables.

##### data/users.json

```javascript
[]
```

The data JSON, only created if not exists. Is an empty array to represent a table without entities

### Removing a model

The CLI also comes with a remove option:

```
lilli remove users
```

It will remove all files related to the specified model, except for the JSON data. Is up to you to decide whether you want to delete it or not.

## License

[MIT](https://github.com/aleixcam/lilli/blob/master/LICENSE)

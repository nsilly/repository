# NF Repository

NF Repository is a abstract layer of Sequelize Application, that make application more easy to understand and flexible to maintain.

You want to know a little more about the Repository pattern? [Read this great article](http://bit.ly/1IdmRNS).

## Table of Contents

- <a href="#installation">Installation</a>
- <a href="#methods">Methods</a>
- <a href="#usage">Usage</a>

## Installation

### NPM

Execute the following command to get the latest version of the package:

```terminal
npm install @nsilly/repository
```

If Yarn

```terminal
yarn add @nsilly/repository
```

## Methods

### RepositoryInterface

- get()
- first()
- paginate(limit = 20)
- findById(id)
- create(attributes)
- update(attributes, id)
- updateOrCreate(attributes, values)
- firstOrCreate(attributes, values)
- deleteById(id)
- delete()
- orderBy(column, direction = 'asc');
- with(relation);
- has(relation);
- whereHas(relation, callback);
- withScope(scope);

## Usage

### Create a Model

Create your Sequelize Model normally

```javascript
"use strict";

module.exports = (sequelize, DataTypes) => {
  var Demo = sequelize.define(
    "demo",
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING
    },
    {
      underscored: true
    }
  );

  return Demo;
};
```

### Create a Repository

```javascript
import models from "your_sequelize_model_folder";
import { Repository } from "@nsilly/repository";

export default class DemoRepository extends Repository {
  Models() {
    return models.product;
  }
}
```

### Use methods

Find all results in Repository

```javascript
const repository = new DemoRepository();
const items = await repository.get();
```

Find all results in Repository with pagination

```javascript
const repository = new DemoRepository();
const items = await repository.paginate(10);
```

Find item by id

```javascript
const repository = new DemoRepository();
const item = await repository.findById(123);
```

Loading the Model relationships

```javascript
const repository = new DemoRepository();
const items = await repository.with("relation").get();
```

Find by result by field name

```javascript
const repository = new DemoRepository();
const items = await repository.where("name", "your_name").get();
```

Find by result by multiple values in one field

```javascript
const repository = new DemoRepository();
const items = await repository.whereIn("id", [1, 2, 3, 4, 5]).get();
```

Find by result by excluding multiple values in one field

```javascript
const repository = new DemoRepository();
const items = await repository.whereNotIn("id", [6, 7, 8, 9, 10]).get();
```

Find all using custom scope

```javascript
const repository = new DemoRepository();
const items = await repository
  .withScope("scope")
  .withScope("another_scope")
  .get();
```

Create new entry in Repository

```javascript
const repository = new DemoRepository();
const item = await repository.create(attributes);
```

Update entry in Repository

```javascript
const repository = new DemoRepository();
const item = await repository.update(attributes, id);
```

Delete entry in Repository

```javascript
const repository = new DemoRepository();
const item = await repository.deleteById(id);
```

Delete entry in Repository by multiple fields

```javascript
const repository = new DemoRepository();
const item = await repository
  .where("name", "item_should_be_deleted")
  .where("another_field", "another_case_should_be_deleted")
  .delete();
```

import _ from 'lodash';
import { Exception, NotFoundException } from '@nsilly/exceptions';
import { QueryBuilder } from './Utils/QueryBuilder';
import { LengthAwarePaginator } from '@nsilly/response';
import { Request } from '@nsilly/support';

export class Repository {
  constructor() {
    this.builder = new QueryBuilder();
    this.paranoid = true;
  }

  /**
   * Create or update a record matching the attributes, and fill it with values
   *
   * @param Object attributes
   * @param Object values
   *
   * @return Object
   */
  async updateOrCreate(attributes, values) {
    if (_.isNil(attributes)) {
      throw new Exception('attributes should not empty', 1000);
    }

    const item = await this.Models().findOne({
      where: attributes
    });

    let result;

    if (item) {
      result = await item.update(values);
    } else {
      result = await this.Models().create(values);
    }
    return result;
  }

  /**
   * Save a new model and return the instance.
   *
   * @param Object attributes
   *
   * @return Object
   */
  async create(attributes) {
    if (_.isNil(attributes)) {
      throw new Exception('attributes should not empty', 1000);
    }

    const result = await this.Models().sequelize.transaction(
      function(t) {
        return this.Models().create(attributes, { transaction: t });
      }.bind(this)
    );
    // add many to many associations before saving if there is
    const associations = this.Models().associations;
    const manyToManyAssociations = Object.keys(associations).filter(association => {
      return associations[association].associationType === 'BelongsToMany';
    });
    for (let n = 0; n < Object.keys(attributes).length; n++) {
      const attributeKey = Object.keys(attributes)[n];
      const attributeVal = attributes[attributeKey];
      if (manyToManyAssociations.indexOf(attributeKey) > -1) {
        if (attributeVal) {
          for (let i = 0; i < attributeVal.length; i++) {
            await result['add' + _.capitalize(attributeKey)](attributeVal[i]);
          }
        }
      }
    }
    if (_.isNil(result)) {
      throw new Exception('Can not create resource', 1004);
    }

    return result;
  }
  /**
   * Save a new model or create new instance of not exist.
   *
   * @param Object attributes
   *
   * @return Object
   */
  async firstOrCreate(attributes) {
    let result;
    if (_.isNil(attributes)) {
      throw new Exception('attributes should not empty', 1000);
    }

    result = await this.Models().findOne({
      where: attributes
    });
    if (!result) {
      result = await this.Models().sequelize.transaction(
        function(t) {
          return this.Models().create(attributes, { transaction: t });
        }.bind(this)
      );
      const associations = this.Models().associations;
      const manyToManyAssociations = Object.keys(associations).filter(association => {
        return associations[association].associationType === 'BelongsToMany';
      });
      for (let n = 0; n < Object.keys(attributes).length; n++) {
        const attributeKey = Object.keys(attributes)[n];
        const attributeVal = attributes[attributeKey];
        if (manyToManyAssociations.indexOf(attributeKey) > -1) {
          if (attributeVal) {
            for (let i = 0; i < attributeVal.length; i++) {
              await result['add' + _.capitalize(attributeKey)](attributeVal[i]);
            }
          }
        }
      }
      if (_.isNil(result)) {
        throw new Exception('Can not create resource', 1004);
      }
    }
    return result;
  }
  /**
   * Update multiple instances that match the where options
   *
   * @param Object attributes
   * @param ID optinal
   *
   * @return Object
   */
  async update(attributes, id = undefined) {
    let result;
    if (_.isNil(attributes)) {
      throw new Exception('attributes should not empty', 1000);
    }
    if (_.isUndefined(id)) {
      result = await this.Models().update(attributes, {
        where: this.getWheres()
      });
    } else {
      const item = await this.findById(id);
      result = await item.update(attributes);
    }
    return result;
  }

  async bulkCreate(attributesArr, individual = false) {
    const result = await this.Models().bulkCreate(attributesArr, {
      individualHooks: individual
    });
    return result;
  }

  bulkUpsert(attributes) {
    if (Array.isArray(attributes)) {
      return Promise.all(
        attributes.map(attribute => {
          return this.singleUpsert(attribute);
        })
      );
    } else {
      return this.singleUpsert(attributes);
    }
  }

  async replaceRelations(result, attributes, extraInfo = {}) {
    const associations = Object.keys(this.Models().associations);
    for (let n = 0; n < Object.keys(attributes).length; n++) {
      const attributeKey = Object.keys(attributes)[n];
      const attributeVal = attributes[attributeKey];

      if (associations.indexOf(attributeKey) > -1) {
        if (attributeVal) {
          const data = await result['get' + _.capitalize(attributeKey)]();
          // to make sure only many to any relationship records will be deleted before adding the new one
          // when attribute value is not an array we dont want to do any deletion since it is going to be one to one relation
          // for one to one it is safe to replace straight away as it just an update inside the current table
          if (Array.isArray(data) && Array.isArray(attributeVal)) {
            for (let i = 0; i < data.length; i++) {
              // if value given is already related then dont do anything
              if (attributeVal.indexOf(data[i].id) === -1) {
                await data[i].destroy();
              }
            }
          }
          if (typeof extraInfo[attributeKey] !== 'undefined') {
            // if extra info is an array then we delete all the relations and re add one by one
            // since sequelize through doesnt support array for "through" options
            if (Array.isArray(extraInfo[attributeKey])) {
              await result['set' + _.capitalize(attributeKey)](null);
              for (let x = 0; x < extraInfo[attributeKey].length; x++) {
                await result['add' + _.capitalize(attributeKey)]([attributeVal[x]], {
                  through: extraInfo[attributeKey][x]
                });
              }
            } else {
              await result['set' + _.capitalize(attributeKey)](attributeVal, {
                through: extraInfo[attributeKey]
              });
            }
          } else {
            await result['set' + _.capitalize(attributeKey)](attributeVal);
          }
        }
      }
    }
    return result;
  }
  getNonRelationAttribute(attributes) {
    const associations = Object.keys(this.Models().associations);
    const newAttribute = {};
    for (let n = 0; n < Object.keys(attributes).length; n++) {
      const attributeKey = Object.keys(attributes)[n];
      const attributeVal = attributes[attributeKey];
      if (associations.indexOf(attributeKey) === -1) {
        newAttribute[attributeKey] = attributeVal;
      }
    }
    return newAttribute;
  }
  async singleUpsert(attribute) {
    const identifier = {};
    const attributeParsed = {};
    const additionalRelationInfo = {};
    let result;
    Object.keys(attribute).forEach(key => {
      if (key.indexOf('__relation_info__') === -1) {
        if (key.indexOf('__unique__') > -1) {
          if (attribute[key]) {
            identifier[key.replace('__unique__', '')] = attribute[key];
          }
        } else {
          attributeParsed[key] = attribute[key];
        }
      } else {
        additionalRelationInfo[key.replace('__relation_info__', '')] = attribute[key];
      }
    });
    if (Object.keys(identifier).length > 0) {
      const item = await this.Models().findOne({
        where: identifier
      });
      if (item) {
        // just update the non relation fields
        result = await item.update(this.getNonRelationAttribute(attributeParsed));

        await this.replaceRelations(result, attributeParsed, additionalRelationInfo);
      } else {
        result = await this.Models().create({
          ...this.getNonRelationAttribute(attributeParsed),
          ...identifier
        });
        await this.replaceRelations(result, attributeParsed, additionalRelationInfo);
      }
    } else {
      result = await this.Models().create(this.getNonRelationAttribute(attributeParsed));
      await this.replaceRelations(result, attributeParsed, additionalRelationInfo);
    }
    return result;
  }

  bulkDelete(attributes) {
    if (Array.isArray(attributes)) {
      return Promise.all(
        attributes.map(attribute => {
          return this.Models().destroy({
            where: attribute
          });
        })
      );
    } else {
      return this.Models().destroy({
        where: attributes
      });
    }
  }

  /**
   * Get the first record
   *
   * @return Object
   */
  async first() {
    let params = {
      where: this.getWheres(),
      include: this.getIncludes(),
      order: this.getOrders()
    };

    if (!_.isArray(this.getAttributes()) && this.getAttributes().length > 0) {
      params = _.assign(params, { attributes: this.getAttributes() });
    }
    let model = this.Models();
    if (this.getScopes().length > 0) {
      model = model.scope(this.getScopes());
    }
    const result = await model.findOne(params);
    return result;
  }

  /**
   * Execute the query and get the first result or throw an exception
   *
   * @return Object
   */
  async firstOrFail() {
    const result = this.first();
    if (!result) {
      throw new NotFoundException('Resource');
    }
    return result;
  }

  /**
   * Find a model by its primary key.
   *
   * @param int id
   *
   * @return Boolean
   * @throws Exception
   */
  async findById(id) {
    let params = {
      where: {
        id: id
      },
      include: this.getIncludes(),
      paranoid: this.paranoid
    };
    if (!_.isArray(this.getAttributes()) && this.getAttributes().length > 0) {
      params = _.assign(params, { attributes: this.getAttributes() });
    }
    let model = this.Models();
    if (this.getScopes().length > 0) {
      model = model.scope(this.getScopes());
    }
    const result = await model.findOne(params);
    if (!result) {
      throw new NotFoundException('Resource');
    }
    return result;
  }

  /**
   * Delete a model by its primary key.
   *
   * @param int id
   *
   * @return Boolean
   * @throws Exception
   */
  async deleteById(id, options = {}) {
    const item = await this.findById(id);
    let result;
    if (!_.isUndefined(options.force) && options.force === true) {
      result = await item.destroy({ force: true });
    }
    result = await item.destroy();
    if (result === false) {
      throw new Exception('can not delete resource', 1002);
    }
    return result;
  }

  /**
   * Delete resources by given condition
   *
   * @return Boolean
   * @throws Exception
   */
  async delete(options = {}) {
    let result;

    if (!_.isUndefined(options.force) && options.force === true) {
      result = await this.Models().destroy({
        where: this.getWheres(),
        force: true
      });
    } else {
      result = await this.Models().destroy({
        where: this.getWheres()
      });
    }
    return result;
  }

  /**
   * Execute the query as a "select" statement.
   *
   * @return Array
   */
  async get() {
    let params = {
      where: this.getWheres(),
      include: this.getIncludes(),
      order: this.getOrders(),
      group: this.getGroup(),
      paranoid: this.paranoid
    };

    if (!_.isArray(this.getAttributes()) && this.getAttributes().length > 0) {
      params = _.assign(params, { attributes: this.getAttributes() });
    }
    let model = this.Models();
    if (this.getScopes().length > 0) {
      model = model.scope(this.getScopes());
    }
    const result = await model.findAll(params);

    return result;
  }

  /**
   * Retrieve the "count" result of the query.
   *
   * @return int
   */
  async count() {
    const params = {
      where: this.getWheres(),
      include: this.getIncludes(),
      order: this.getOrders(),
      distinct: true
    };
    let model = this.Models();
    if (this.getScopes().length > 0) {
      model = model.scope(this.getScopes());
    }
    const result = await model.count(params);
    return result;
  }
  /**
   * Paginate the given query.
   *
   * @param  int  per_page
   * @param  int|null  page
   *
   * @return LengthAwarePaginator
   */
  async paginate(per_page = null, page = null) {
    if (!_.isNil(per_page)) {
      per_page = parseInt(per_page);
    } else {
      if (Request.has('per_page')) {
        per_page = parseInt(Request.get('per_page'));
      } else {
        per_page = 20;
      }
    }
    if (!_.isNil(page)) {
      page = parseInt(page);
    } else {
      if (Request.has('page')) {
        page = parseInt(Request.get('page'));
      } else {
        page = 1;
      }
    }
    let params = {
      offset: (page - 1) * per_page,
      limit: per_page,
      where: this.getWheres(),
      include: this.getIncludes(),
      order: this.getOrders(),
      distinct: true,
      paranoid: this.paranoid
    };

    if (!_.isArray(this.getAttributes()) && this.getAttributes().length > 0) {
      params = _.assign(params, { attributes: this.getAttributes() });
    }
    let model = this.Models();
    if (this.getScopes().length > 0) {
      model = model.scope(this.getScopes());
    }
    const result = await model.findAndCountAll(params);

    const paginator = new LengthAwarePaginator(result.rows, result.count, per_page, page);
    return paginator;
  }

  async fromPagination(pagination) {
    const paginationObj = pagination.getData();
    paginationObj.operation.forEach(
      function(op) {
        this[op.type](...op.content);
      }.bind(this)
    );

    return pagination.result(this.paginate.bind(this));
  }

  /**
   * Add a basic "WHERE" clause to the query.
   *
   * @param  string  column
   * @param  mixed   operator
   * @param  mixed   value
   *
   * @return this
   */
  where(...args) {
    if (args.length === 1) {
      let raw = false;
      if (args[0].constructor) {
        if (args[0].constructor.name === 'Where') {
          raw = true;
        } else if (args[0].constructor.name === 'Literal') {
          raw = true;
        }
      }
      if (raw) {
        this.builder.where.apply(this.builder, [...args]);
      } else {
        const callable = args[0];
        const builder = new QueryBuilder();
        const query = callable(builder);
        this.builder.scopeQuery.apply(this.builder, [query]);
      }
    } else {
      this.builder.where.apply(this.builder, [...args]);
    }
    return this;
  }

  /**
   * Add an "OR WHERE" clause to the query.
   *
   * @param  string  column
   * @param  string|null  operator
   * @param  mixed   value
   *
   * @return this
   */
  orWhere(...args) {
    this.builder.orWhere.apply(this.builder, [...args]);
    return this;
  }

  /**
   * Add an "WHERE IN" clause to the query.
   *
   * @param  string  column
   * @param  array   value
   *
   * @return this
   */
  whereIn(column, value) {
    this.builder.whereIn(column, value);
    return this;
  }

  /**
   * Add an "WHERE NOT IN" clause to the query.
   *
   * @param  string  column
   * @param  array   value
   *
   * @return this
   */
  whereNotIn(column, value) {
    this.builder.whereNotIn(column, value);
    return this;
  }

  /**
   * Add a basic where clause with relation to the query.
   *
   * @param  string  relation
   * @param  callable callable
   *
   * @return this
   */
  whereHas(relation, callable, options) {
    let builder = new QueryBuilder();
    builder = callable(builder);
    this.builder.whereHas.apply(this.builder, [relation, builder, options]);
    return this;
  }

  /**
   * include another table that has many to many relationship with it
   *
   * @param  string  relation
   * @param  callable callable
   *
   * @return this
   */
  includeThroughWhere(relation, callable) {
    let builder = new QueryBuilder();
    builder = callable(builder);
    this.builder.whereHas.apply(this.builder, [relation, builder]);
    return this;
  }

  /**
   * Alias to set the "offset" value of the query.
   *
   * @param  int  value
   *
   * @return this
   */
  skip(offset) {
    this.builder.skip(offset);
    return this;
  }

  /**
   * Alias to set the "limit" value of the query.
   *
   * @param  int  value
   *
   * @return this
   */
  take(limit) {
    this.builder.take(limit);
    return this;
  }

  /**
   * Add an "order by" clause to the query.
   *
   * @param  string  column
   * @param  string  direction
   *
   * @return this
   */
  orderBy(...args) {
    let model;
    let field;
    let direction = 'ASC';
    if (args.length === 2) {
      [field, direction] = args;
      this.builder.orderBy(field, direction);
    }
    if (args.length === 3) {
      [model, field, direction] = args;
      this.builder.orderBy(model, field, direction);
    }
    return this;
  }

  /**
   * Add an "GROUP BY" clause to the query.
   *
   * @param  string  column
   *
   * @return this
   */
  groupBy(column) {
    this.builder.groupBy(column);
    return this;
  }

  /**
   * Extract order param from request and apply the rule
   *
   * @param Array Supported fields to order
   *
   * @return Repository
   */
  applyOrderFromRequest(fields = [], functions = {}) {
    if (Request.has('sort') && Request.get('sort') !== '') {
      const orderBy = Request.get('sort').split(',');
      orderBy.forEach(field => {
        let direction = 'ASC';
        if (field.charAt(0) === '-') {
          direction = 'DESC';
          field = field.slice(1);
        }
        if (field.charAt(0) === '+') {
          field = field.slice(1);
        }
        if (fields.length === 0 || (fields.length > 0 && _.includes(fields, field))) {
          // custom functions to be given aligned with field name
          if (typeof functions[field] !== 'undefined') {
            functions[field](direction);
          } else {
            this.orderBy(field, direction);
          }
        }
      });
    }
    return this;
  }

  /**
   * Extract search param from request and apply the rule
   *
   * @param Array Supported fields to order
   *
   * @return Repository
   */
  applySearchFromRequest(fields, match = null) {
    if (Request.has('search') && Request.get('search') !== '') {
      if (_.isNull(match)) {
        match = `%${Request.get('search')}%`;
      }
      this.where(function(q) {
        _.forEach(fields, field => {
          q.orWhere(field, 'like', match);
        });
        return q;
      });
    }
    return this;
  }

  /**
   * Extract constraints param from request and apply the rule
   * @param custom => object consisting key of entity type with custom implementation as the value
   * when supplied custom, it will check from the custom object for its implementation function instead of default where
   * @return Repository
   */
  applyConstraintsFromRequest(custom = {}) {
    if (Request.has('constraints') || Request.get('constraints') !== '') {
      const data = Request.get('constraints', {});
      let constraints = {};
      if (typeof data === 'object') {
        constraints = Request.get('constraints');
      } else {
        constraints = JSON.parse(Request.get('constraints'));
      }
      for (const key in constraints) {
        if (typeof custom[key] !== 'undefined') {
          custom[key](constraints[key]);
        } else {
          this.where(key, constraints[key]);
        }
      }
      return this;
    }
  }

  /**
   * Begin querying a model with eager loading.
   *
   * @param  array|string  $relations
   *
   * @return this
   */
  with(...args) {
    this.builder.with.apply(this.builder, args);
    return this;
  }

  /**
   * Include deleted records
   *
   * @return this
   */
  withTrashed() {
    this.paranoid = false;
    return this;
  }
  /**
   * Add scope to the query
   *
   * @param  string scope
   *
   * @return this
   */
  withScope(scope) {
    this.builder.withScope(scope);
    return this;
  }
  /**
   * Set the columns to be selected.
   *
   * @param  array|mixed  $columns
   *
   * @return this
   */
  select(columns) {
    this.builder.select.apply(this.builder, [columns]);
    return this;
  }
  /**
   * Get the sequilize where condition
   *
   * @return Object
   */
  getWheres() {
    return this.builder.buildWhereQuery();
  }
  /**
   * Get the limit value of the builder
   *
   * @return int
   */
  getLimit() {
    return this.builder.limit;
  }
  /**
   * Get the offset value of the builder
   *
   * @return int
   */
  getOffset() {
    return this.builder.offset;
  }
  /**
   * Get the orders value of the builder
   *
   * @return array
   */
  getOrders() {
    return this.builder.orders;
  }
  /**
   * Get the group value of the builder
   *
   * @return array
   */
  getGroup() {
    return this.builder.group;
  }
  /**
   * Get the includes value of the builder
   *
   * @return array
   */
  getIncludes() {
    return this.builder.includes;
  }
  /**
   * Get the scopes value of the builder
   *
   * @return array
   */
  getScopes() {
    return this.builder.scopes;
  }
  /**
   * Get the attributes value of the builder
   *
   * @return array
   */
  getAttributes() {
    return this.builder.attributes;
  }
}

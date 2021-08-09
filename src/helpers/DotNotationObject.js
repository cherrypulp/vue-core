/**
 * DotNotationObject.
 * @note Deeply inspired by https://github.com/ecrmnn/collect.js
 *
 * @example
 * const dot = new DotNotationObject({
 *     foo: {
 *         bar: 'baz',
 *     },
 * });
 * dot.get('foo.bar');
 * dot.set('foo.bar', 'fooz');
 */
export default class DotNotationObject
{
  /**
   * @param items
   */
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Return all items.
   * @return {Array}
   */
  all() {
    return this.items;
  }

  /**
   * Clone an array or object.
   * @return {*}
   */
  clone() {
    if (Array.isArray(this.items)) {
      return [].push(...this.items);
    }

    return Object.assign({}, this.items);
  }

  /**
   * Get value of a nested property.
   * @param key
   * @param defaultValue
   * @return {*}
   */
  get(key, defaultValue = null) {
    try {
      return key.split('.').reduce((acc, prop) => acc[prop], this.items);
    } catch (err) {
      return defaultValue;
    }
  }

  /**
   * Check if a key exist in items.
   * @param key
   * @return {boolean}
   */
  has(key) {
    return this.items[key] !== undefined;
  }

  /**
   * Set the given key and value.
   * @param key
   * @param value
   * @return {Array}
   */
  set(key, value) {
    const keys = key.split('.');
    let source = this.items;

    for (let i = 0, len = keys.length; i < len; i++) {
      let k = keys[i];

      if (i === keys.length - 1) {
        source[k] = value;
      }

      source = source[k];
    }

    return this.items;
  }

  /**
   * Converts the collection into a plain array. If the collection is an object, an array containing the values will be returned.
   * @return {*}
   */
  toArray() {
    function iterate(list, collection) {
      const childCollection = [];

      if (Array.isArray(list)) {
        list.forEach(i => iterate(i, childCollection));
        collection.push(childCollection);
      } else {
        collection.push(list);
      }

      return collection;
    }

    if (Array.isArray(this.items)) {
      return this.items.reduce((acc, items) => iterate(items, acc), []);
    }

    return this.values();
  }

  /**
   * Converts the collection into JSON string.
   * @return {string}
   */
  toJSON() {
    if (Array.isArray(this.items)) {
      return JSON.stringify(this.toArray());
    }

    return JSON.stringify(this.all());
  }

  /**
   * Retrieve values from [this.items] when it is an array or object.
   */
  values() {
    return Object.keys(this.items).map((key) => this.items[key]);
  }

  /**
   * Filters the collection by a given key / value pair.
   * @param key
   * @param operator
   * @param value
   * @return {*}
   * @example
   * const filtered = collection.where('price', 100);
   * @example
   * const filtered = collection.where('price', '===', 100);
   */
  where(key, operator, value) {
    let comparisonOperator = operator;
    let comparisonValue = value;

    if (value === undefined) {
      comparisonValue = operator;
      comparisonOperator = '===';
    }

    const items = this.values();

    return items.filter((item) => {
      let val = this.constructor(item).get(key);
      switch (comparisonOperator) {
        case '==':
          return val === Number(comparisonValue) ||
            val === comparisonValue.toString();

        default:
        case '===':
          return val === comparisonValue;

        case '!=':
        case '<>':
          return val !== Number(comparisonValue) &&
            val !== comparisonValue.toString();

        case '!==':
          return val !== comparisonValue;

        case '<':
          return val < comparisonValue;

        case '<=':
          return val <= comparisonValue;

        case '>':
          return val > comparisonValue;

        case '>=':
          return val >= comparisonValue;
      }
    });
  }

  /**
   * Filters the collection by a given key / value contained within the given array.
   * @param key
   * @param values
   * @return {*[]}
   * @example
   * const filtered = collection.whereIn('price', [100, 150]);
   */
  whereIn(key, values) {
    const items = this.constructor(values).values();
    return this.items.filter((item) => items.indexOf(new this.constructor(item).get(key)) !== -1);
  }

  /**
   * Filters the collection by a given key / value not contained within the given array.
   * @param key
   * @param values
   * @return {*[]}
   * @example
   * const filtered = collection.whereNotIn('price', [100, 150]);
   */
  whereNotIn(key, values) {
    const items = this.constructor(values).values();
    return this.items.filter((item) => items.indexOf(new this.constructor(item).get(key)) === -1);
  }
}
import axios from 'axios';
import _ from 'lodash';
import Antd, { message, notification } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

/**
 * Simple I18n wrapper around a global object.
 * @example
 * import I18n from '@cherrypulp/i18n';
 *
 * const i18n = new I18n({
 *     foo: 'bar',
 * }, 'en');
 *
 * i18n.add({'baz': 'Hello :word!'});
 *
 * alert(i18n.get('foo')); // return 'bar'
 * alert(i18n.get('foo', {word: 'wold'}); // return 'Hello world!'
 */
class I18n {
    /**
     * Add labels to a given language
     * @example
     * i18n.add({
     *     'foo': 'bar',
     * }, 'en');
     * @param {Object} translations
     * @param {String} locale (default: this.locale)
     */
    add(translations, locale = null) {
        if (!locale) {
            locale = this.locale;
        }

        this.translations.set(locale, Object.assign({}, this.translations.get(locale), translations));
    }

    /**
     * Apply a condition on count of key
     *
     * @param {String} key
     * @param {Number} count (default: 1)
     * @param {Object} data (default: null)
     * @param {String} locale (default: this.locale)
     * @returns {String}
     */
    choice(key, count = 1, data = null, locale = null) {
        if (!locale) {
            locale = this.locale;
        }

        let translation = null;
        const translations = this.fetch(`${locale}.${key}`);

        if (!translations) {
            if (this.forceDisplayKeys) {
                if (this.options.storeNotFounds) {
                    window[this.options.globalName]._notFounds.push(key);
                }

                if (data) {
                    return this.constructor.replaceString(key, data);
                }

                return key;
            }

            return '';
        }

        const parts = translations.split('|');

        parts.some((p) => {
            translation = this.constructor.matchChoiceCount(p, count);
            return translation;
        });

        // not a choice translation, check between singular/plural
        if (translation === false) {
            translation = count > 1 ? parts[1] : parts[0];
        }

        return this._returnString(key, translation, data);
    }

    /**
     * @example
     * const i18n = new I18n({
     *     'foo': 'bar',
     * });
     *
     * @param {Object} translations
     * @param {String} defaultLocale (default: 'en')
     * @param {Object} options (default: {globalName: 'translations', forceDisplayKeys: false})
     */
    constructor(translations = {}, defaultLocale = 'en', options = {}) {
        options = Object.assign({
            globalName:       'translations',
            forceDisplayKeys: true,
            storeNotFounds:   true,
        }, options);

        this.forceDisplayKeys = options.forceDisplayKeys;
        this.locale = defaultLocale;
        this.translations = new Map();

        if (options.globalName) {
            if (typeof window[options.globalName] === 'undefined') {
                window[options.globalName] = {};
            }

            translations = Object.assign({}, window[options.globalName], translations);

            if (options.storeNotFounds) {
                window[options.globalName]._notFounds = [];
            }
        }

        this.set(translations, this.locale);

        this.options = options;
    }

    // @TODO - see http://i18njs.com/#contexts
    // context(key, context = null, data = null, locale = null) {
    //     if (!locale) {
    //         locale = this.locale;
    //     }
    //
    //     // "[{gender: female}]
    // }

    /**
     * Decode HTML Entities
     * @param {String} source
     * @return {String}
     */
    static decodeHtml(source) {
        const txt = document.createElement('textarea');
        txt.innerHTML = source;
        return txt.value;
    }

    /**
     * Retrieve a translation.
     * @example
     * i18n.fetch('en.foo'); // return "bar"
     * @param {String} key
     * @return {String}
     */
    fetch(key) {
        const keys = key.split('.');
        const locale = keys.shift();

        let source = this.translations.get(locale);

        keys.forEach((k) => {
            if (source) {
                source = source[k];
            }
        });

        return source;
    }

    /**
     * Get a specific label
     * @example
     * // @example {foo: 'bar'}
     * i18n.get('foo', 'en'); // return "bar"
     * @example
     * // @example {hello: 'Hello :name'}
     * i18n.get('hello', {name: 'world'}, 'en'); // return "Hello world"
     * @example
     * // @example {hello: 'Hello :Name'}
     * i18n.get('hello', {name: 'world'}, 'en'); // return "Hello World"
     * @example
     * // @example {hello: 'Hello :NAME'}
     * i18n.get('hello', {name: 'world'}, 'en'); // return "Hello WORLD"
     * @param {String} key
     * @param {Object} data (default: null)
     * @param {String} locale (default: this.locale)
     * @return {String}
     */
    get(key, data = null, locale = null) {
        if (typeof data === 'string') {
            locale = data;
            data = null;
        }

        if (!locale) {
            locale = this.locale;
        }

        const content = this.fetch(`${locale}.${key}`);
        return this._returnString(key, content, data);
    }

    /**
     * Checking if a translation key exists.
     * @param key
     * @param {String} locale (default: this.locale)
     * @return {boolean}
     */
    has(key, locale = null) {
        if (!locale) {
            locale = this.locale;
        }

        return typeof this.fetch(`${locale}.${key}`) !== 'undefined';
    }

    /**
     * Match the translation limit with the count.
     * @param {String} translation
     * @param {Number} count
     * @return {null|*}
     */
    static matchChoiceCount(translation, count) {
        const match = translation.match(/^[{[]([^[\]{}]*)[}\]](.*)/);

        if (!match) {
            return false;
        }

        if (match[1].includes(',')) {
            const [from, to] = match[1].split(',', 2);

            if (
                (to === '*' && count >= from)
                || (from === '*' && count <= to)
                || (count >= from && count <= to)
            ) {
                // eslint-disable-next-line consistent-return
                return match[2];
            }
        }

        // eslint-disable-next-line consistent-return
        return parseInt(match[1], 10) === count ? match[2] : null;
    }

    /**
     * Apply data object values to given template.
     * @example
     * I18n.replaceString('Hello :name', {name: 'world'}); // return "Hello world"
     * @example
     * I18n.replaceString('Hello :Name', {name: 'world'}); // return "Hello World"
     * @example
     * I18n.replaceString('Hello :NAME', {name: 'world'}); // return "Hello WORLD"
     * @param {String} translation
     * @param {Object} data
     * @return {String}
     */
    static replaceString(translation, data) {
        if (!data) {
            return translation;
        }

        return Object.entries(data)
            .reduce((acc, [key, value]) => {
                value = String(value);
                const placeholder = key.toLowerCase();
                return acc
                    .replace(`:${placeholder}`, value)
                    .replace(`:${placeholder.toUpperCase()}`, value.toUpperCase())
                    .replace(`:${placeholder.charAt(0).toUpperCase()}${placeholder.slice(1)}`, `${value.charAt(0).toUpperCase()}${value.slice(1)}`);
            }, translation);
    }

    /**
     * Return formatted content or key based on setup.
     * @param key
     * @param content
     * @param data
     * @return {String|string|*}
     * @private
     */
    _returnString(key, content, data) {
        if (typeof content !== 'string' && this.forceDisplayKeys) {
            content = key;

            if (this.options.storeNotFounds) {
                window[this.options.globalName]._notFounds.push(key);
            }
        }

        if (data) {
            content = this.constructor.replaceString(content, data);
        }

        return this.constructor.decodeHtml(content);
    }

    /**
     * Set current language.
     * @param {String} locale
     */
    setLocale(locale) {
        this.locale = locale;
    }

    /**
     * Set translations in current language
     * @example
     * i18n.set({
     *     foo: 'bar',
     * });
     * @param {Object} translations
     * @param {String} locale (default: this.locale)
     */
    set(translations, locale = null) {
        if (!locale) {
            locale = this.locale;
        }

        this.translations.set(locale, translations);
    }
}

/**
 * Vue I18n Plugin
 * @example
 * const options = {
 *     labels: {
 *         foo: 'bar',
 *     },
 * };
 *
 * Vue.use(VueI18n, options);
 *
 * // then
 *
 * // - in JS
 * this.__('foo'); // return 'bar';
 *
 * // - in Template
 * {{ __('foo') }}
 */
var VueI18n = {
    name: 'vue-i18n',
    production: process.env.NODE_ENV === 'production',
    install(Vue, options = {}) {
        options = Object.assign({
            instance: null,
            translations: {},
            language: 'en',
        }, options);

        let instance = options.instance;

        if (!instance) {
            instance = new I18n({}, options.language);
        }

        instance.add(options.translations, options.language);

        if (typeof Vue.config !== 'undefined' && typeof Vue.config.globalProperties !== 'undefined') {
            Vue.config.globalProperties.$i18n = instance;
        } else {
            Vue.prototype.$i18n = instance;
            Vue.$i18n = instance;
        }

        Vue.mixin({
            methods: {
                /**
                 * Retrieve a label.
                 * @param key
                 * @param data
                 * @param language
                 * @return {String}
                 */
                __(key, data = {}, language = null) {
                    return this.$i18n.get(key, data, language);
                },

                /**
                 * @param key
                 * @param count
                 * @param data
                 * @param language
                 * @return {String}
                 */
                choice(key, count = 1, data = {}, language = null) {
                    return this.$i18n.choice(key, count, data, language);
                },
            },
        });
    },
};

/**
 * Base mixin.
 */
var BaseMixin = {
  methods: {
    $urlRoute(endpoint, params) {
      if (typeof params !== 'undefined') {
        for (let placeholder in params) {
          endpoint = endpoint.replace(`:${placeholder}`, params[placeholder]);
        }
      }

      return endpoint;
    },

    $apiRoute(endpoint, params) {
      return this.$urlRoute(
        this.$config.get('api_base_url') + endpoint,
        params
      );
    },

    $apiPut(endpoint, params, query, config) {
      return this.$api.put(this.$apiRoute(endpoint, params), query, config);
    },

    $apiDelete(endpoint, params, config) {
      return this.$api.delete(this.$apiRoute(endpoint, params), config);
    },

    $apiPost(endpoint, params, query, config) {
      return this.$api.post(this.$apiRoute(endpoint, params), query, config);
    },

    $apiGet(endpoint, params, query) {
      return this.$api.get(this.$apiRoute(endpoint, params), query);
    },

    /**
     * Log helper.
     */
    $trace() {
      if (this.config.get('debug', false)) {
        console.log('[Debug]', ...Array.prototype.slice.apply(arguments));
      }
    },

    $windowReload() {
      // eslint-disable-next-line no-undef
      window.location.reload();
    },
  },
};

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
class DotNotationObject
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

var VueCore = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    install: (app, options) => {
        if (typeof window.axios === 'undefined') {
            window.axios = axios;
        }
        app.config.globalProperties.$config = new DotNotationObject(options);
        console.log(app.config.globalProperties.$config);
        app.config.globalProperties.$http = window.axios;
        app.config.globalProperties.$api = window.axios.create({
            baseURL: options.api.url,
        });
        app.config.globalProperties.$message = message;
        app.config.globalProperties.$notification = notification;
        if (typeof options._ === 'undefined') {
            app.config.globalProperties._ = _;
        }
        else {
            app.config.globalProperties._ = options._;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof window.translations === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.translations = options.translations;
        }
        app.use(VueI18n, options.i18n);
        app.use(Antd);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        app.mixin(BaseMixin);
        app.provide('Blok', options);
    },
};

export { VueCore };

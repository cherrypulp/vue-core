'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var axios = require('axios');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

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
            return this.forceDisplayKeys ? key : undefined;
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

        if (!translation && this.forceDisplayKeys) {
            translation = key;
        }

        return this.constructor.replaceString(translation, data);
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

        let content = this.fetch(`${locale}.${key}`);

        if (typeof content === 'undefined' && this.forceDisplayKeys) {
            if (this.options.storeNotFounds) {
                window[this.options.globalName]._notFounds.push(key);
            }

            return key;
        }

        if (typeof content === 'string') {
            if (data) {
                content = this.constructor.replaceString(content, data);
            }

            return this.constructor.decodeHtml(content);
        }

        return content;
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

var VueCore = {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    install: (app, options) => {
        console.log('Init Blok', app, options);
        if (typeof window.axios === 'undefined') {
            window.axios = axios__default['default'];
        }
        app.config.globalProperties.$http = window.axios;
        app.config.globalProperties.$api = window.axios.create({
            baseURL: options.api.url,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof window.translations === 'undefined') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.translations = options.translations;
        }
        app.use(VueI18n, options.i18n);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        app.mixin({
            methods: {},
        });
        app.provide('Blok', options);
    },
};

exports.VueCore = VueCore;

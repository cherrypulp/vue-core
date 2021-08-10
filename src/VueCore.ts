import axios from 'axios';
import _ from 'lodash';
import Antd from 'ant-design-vue';
import {message, notification} from 'ant-design-vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueI18n from '@cherrypulp/i18n/src/vue-i18n';
import BaseMixin from './mixins/BaseMixin';
import DotNotationObject from './helpers/DotNotationObject';

interface options {
  // eslint-disable-next-line @typescript-eslint/ban-types
  i18n: object;
  api: {
    url: string;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  translations: object;
  _: undefined;
}

declare global {
  interface Window {
    axios: any;
    translations: any;
  }
}

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  install: (app: any, options: options) => {
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
    } else {
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

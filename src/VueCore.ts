import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VueI18n from '@cherrypulp/i18n/src/vue-i18n';

interface options {
  // eslint-disable-next-line @typescript-eslint/ban-types
  i18n: object;
  api: {
    url: string;
  };
  // eslint-disable-next-line @typescript-eslint/ban-types
  translations: object;
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
      methods: {

      },
    });

    app.provide('Blok', options);
  },
};

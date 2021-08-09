/**
 * Base mixin.
 */
export default {
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

import { AxiosInstance } from 'axios';

declare module 'vue/types/vue' {
  // 3. Déclarez l'augmentation pour Vue
  interface Vue {
    $api: typeof AxiosInstance;
    $http: typeof AxiosInstance;
  }
}

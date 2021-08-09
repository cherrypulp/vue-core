import 'ant-design-vue/dist/antd.css';
interface options {
    i18n: object;
    api: {
        url: string;
    };
    translations: object;
    _: undefined;
}
declare global {
    interface Window {
        axios: any;
        translations: any;
    }
}
declare const _default: {
    install: (app: any, options: options) => void;
};
export default _default;

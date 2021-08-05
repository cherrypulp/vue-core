interface options {
    i18n: object;
    api: {
        url: string;
    };
    translations: object;
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

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'id.vn.vkien.kimolife',
    appName: 'Kimo Life',
    webDir: 'public/build',
    server: {
        url: 'https://vkienweb.id.vn',
        cleartext: false,
    },
};

export default config;

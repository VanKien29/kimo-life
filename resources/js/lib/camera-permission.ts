import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Ask for the native camera permission before getUserMedia is called.
 * Browsers will continue to use their own permission prompt.
 */
export async function ensureCameraPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
        return true;
    }

    try {
        const current = await Camera.checkPermissions();

        if (current.camera === 'granted') {
            return true;
        }

        const requested = await Camera.requestPermissions({ permissions: ['camera'] });

        return requested.camera === 'granted';
    } catch {
        // Let getUserMedia handle the permission if the native bridge is unavailable.
        return true;
    }
}

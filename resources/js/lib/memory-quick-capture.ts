let pendingPhotos: File[] = [];

export function queueMemoryPhotos(files: File[]): void {
    pendingPhotos = files;
}

export function takeQueuedMemoryPhotos(): File[] {
    const files = pendingPhotos;
    pendingPhotos = [];

    return files;
}

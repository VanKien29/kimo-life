import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface QuickCameraCaptureProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (file: File) => void;
}

export function QuickCameraCapture({ open, onOpenChange, onCapture }: QuickCameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [starting, setStarting] = useState(false);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) videoRef.current.srcObject = null;
        setReady(false);
    }, []);

    useEffect(() => {
        if (!open) {
            stopCamera();

            return;
        }

        let cancelled = false;

        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('Trình duyệt này không hỗ trợ camera. Bạn có thể chọn ảnh từ thiết bị.');
                return;
            }

            setStarting(true);
            setError(null);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: { ideal: 'environment' },
                        height: { ideal: 1280 },
                        width: { ideal: 1280 },
                    },
                });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setReady(true);
            } catch {
                setError('Không thể mở camera. Hãy cấp quyền camera hoặc chọn ảnh từ thiết bị.');
            } finally {
                if (!cancelled) setStarting(false);
            }
        };

        void startCamera();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [open, retryKey, stopCamera]);

    const capturePhoto = () => {
        const video = videoRef.current;

        if (!video || !ready || video.videoWidth === 0 || video.videoHeight === 0) return;

        const canvas = document.createElement('canvas');
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                onOpenChange(false);
                onCapture(new File([blob], `kimo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.92,
        );
    };

    const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';

        if (!file) return;

        onOpenChange(false);
        onCapture(file);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-brand-border bg-brand-background w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl p-0">
                <DialogHeader className="px-5 pt-5 pr-12 text-left">
                    <DialogTitle>Chụp khoảnh khắc</DialogTitle>
                    <DialogDescription>Chụp xong, bạn sẽ nhập chú thích ngay ở bước tiếp theo.</DialogDescription>
                </DialogHeader>

                <div className="bg-brand-text relative mx-5 aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-video">
                    {error ? (
                        <div className="text-brand-primary-foreground flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                            <Camera className="size-9 opacity-80" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" aria-label="Khung xem trước camera" />
                    )}

                    {starting && (
                        <div className="bg-brand-text/55 text-brand-primary-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm">
                            <LoaderCircle className="size-6 animate-spin" />
                            Đang mở camera…
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 px-5 pb-5 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus />
                        Chọn ảnh
                    </Button>
                    <Button type="button" onClick={capturePhoto} disabled={!ready || starting}>
                        {starting ? <LoaderCircle className="animate-spin" /> : <Camera />}
                        Chụp ảnh
                    </Button>
                </DialogFooter>

                {error && (
                    <button
                        type="button"
                        onClick={() => setRetryKey((value) => value + 1)}
                        className="text-brand-primary-dark mx-auto -mt-2 mb-4 inline-flex items-center gap-1 text-xs"
                    >
                        <RefreshCw className="size-3.5" />
                        Thử lại camera
                    </button>
                )}

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileSelected} />
            </DialogContent>
        </Dialog>
    );
}

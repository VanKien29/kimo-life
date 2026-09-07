import { cn } from '@/lib/utils';
import { type MemoryItem, type MemoryOption } from '@/types/memory';
import type { FormDataConvertible } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    ArrowLeft,
    Camera,
    Image as ImageIcon,
    LoaderCircle,
    RefreshCw,
    Send,
    Sparkles,
    X,
} from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

interface MemoryComposerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activities?: MemoryOption[];
    tags?: string[];
    memory?: MemoryItem | null;
    initialPhotos?: File[];
    advanced?: boolean;
}

interface MemoryFormData {
    [key: string]: FormDataConvertible;
    title: string;
    content: string;
    mood: string;
    visibility: 'private' | 'friends' | 'public';
    location: string;
    photos: File[];
    activities: string[];
    tags: string[];
    remove_photo_ids: number[];
}

const quickMoods = [
    { label: 'Tuyệt vời', emoji: '✨', value: 'tuyet-voi' },
    { label: 'Vui vẻ', emoji: '😊', value: 'vui-ve' },
    { label: 'Bình yên', emoji: '☕', value: 'binh-yen' },
    { label: 'Thư giãn', emoji: '🌿', value: 'thu-gian' },
    { label: 'Năng động', emoji: '🏃', value: 'nang-dong' },
];

const EMPTY_PHOTOS: File[] = [];

export function MemoryComposer({
    open,
    onOpenChange,
    memory = null,
    initialPhotos = EMPTY_PHOTOS,
}: MemoryComposerProps) {
    const editing = memory !== null;
    const [step, setStep] = useState<'camera' | 'preview'>(() => {
        if (editing || initialPhotos.length > 0) return 'preview';
        return 'camera';
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
        if (editing && memory?.photos?.[0]?.src) return memory.photos[0].src;
        return null;
    });

    // Camera states
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cameraStarting, setCameraStarting] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isFlashing, setIsFlashing] = useState(false);

    const form = useForm<MemoryFormData>({
        title: memory?.title ?? '',
        content: memory?.content ?? '',
        mood: memory?.mood ?? '',
        visibility: memory?.visibility ?? 'private',
        location: memory?.location ?? '',
        photos: initialPhotos,
        activities: memory?.activities.map((a) => a.name) ?? [],
        tags: memory?.tags ?? [],
        remove_photo_ids: [],
    });
    const formRef = useRef(form);
    formRef.current = form;

    // Clean up camera stream
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    }, []);

    // Start camera stream
    const startCamera = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError('Trình duyệt không hỗ trợ mở camera trực tiếp. Bạn có thể chọn ảnh từ thư viện.');
            return;
        }

        setCameraStarting(true);
        setCameraError(null);

        let stream: MediaStream | null = null;

        try {
            stopCamera();
            stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 1280 },
                },
            });

            streamRef.current = stream;
            const video = videoRef.current;

            if (!video) {
                throw new Error('Không tìm thấy khung xem trước camera.');
            }

            video.srcObject = stream;

            if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
                await new Promise<void>((resolve, reject) => {
                    const handleLoadedMetadata = () => {
                        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        video.removeEventListener('error', handleVideoError);
                        resolve();
                    };
                    const handleVideoError = () => {
                        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        video.removeEventListener('error', handleVideoError);
                        reject(new Error('Không thể nhận dữ liệu từ camera.'));
                    };

                    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
                    video.addEventListener('error', handleVideoError, { once: true });
                });
            }

            await video.play();
            setCameraReady(true);
        } catch (error) {
            stream?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;

            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                setCameraError('Camera đang bị chặn. Hãy cấp quyền camera cho trang web rồi bấm Thử lại.');
            } else {
                setCameraError('Không thể mở camera. Bạn có thể cấp quyền hoặc bấm nút Thư viện để chọn ảnh.');
            }
        } finally {
            setCameraStarting(false);
        }
    }, [facingMode, stopCamera]);

    // Handle open/close and step changes
    useEffect(() => {
        if (!open) {
            stopCamera();
            return;
        }

        if (initialPhotos.length > 0 && formRef.current.data.photos.length === 0) {
            formRef.current.setData('photos', initialPhotos);
            setPreviewUrl(URL.createObjectURL(initialPhotos[0]));
            setStep('preview');
            return;
        }

        if (step === 'camera') {
            void startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open, step, facingMode, initialPhotos, startCamera, stopCamera]);

    // Handle initial preview if photos provided
    useEffect(() => {
        if (form.data.photos.length > 0 && !previewUrl) {
            const url = URL.createObjectURL(form.data.photos[0]);
            setPreviewUrl(url);
            setStep('preview');
        }
    }, [form.data.photos, previewUrl]);

    // Capture photo from video stream
    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video || !cameraReady || video.videoWidth === 0 || video.videoHeight === 0) return;

        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 180);

        const canvas = document.createElement('canvas');
        const maxDim = 1440;
        const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If front camera, mirror horizontally
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], `kimo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                form.setData('photos', [file]);
                stopCamera();
                setStep('preview');
            },
            'image/jpeg',
            0.92,
        );
    };

    // Pick file from device gallery
    const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        form.setData('photos', [file]);
        stopCamera();
        setStep('preview');
    };

    // Retake photo
    const handleRetake = () => {
        if (previewUrl && !editing) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        form.setData('photos', []);
        form.setData('content', '');
        form.setData('mood', '');
        setStep('camera');
    };

    // Toggle camera front/back
    const toggleCameraFacing = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    };

    // Close and reset
    const handleClose = () => {
        stopCamera();
        if (previewUrl && !editing) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setStep(editing ? 'preview' : 'camera');
        onOpenChange(false);
    };

    // Submit memory
    const handleSubmit = () => {
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        } as const;

        if (editing && memory) {
            form.patch(route('memory.update', memory.id), options);
        } else {
            form.post(route('memory.store'), options);
        }
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={handleClose}>
            <DialogPrimitive.Portal>
                {/* Dark Backdrop */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Main Locket Modal Container */}
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[420px] rounded-[32px] bg-[#111614] border border-white/10 p-3.5 sm:p-4.5 text-white shadow-[0_16px_50px_rgba(0,0,0,0.8)] focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        ref={fileInputRef}
                        className="sr-only"
                        onChange={handleFileSelected}
                    />

                    {/* MODE 1: Camera Viewfinder (Chưa chụp) */}
                    {step === 'camera' && (
                        <div className="flex flex-col items-center">
                            {/* Top Bar */}
                            <div className="flex items-center justify-between w-full mb-3 px-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="size-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="size-5" />
                                </button>

                                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 shadow-xs">
                                    <Sparkles className="size-3.5 text-emerald-400" />
                                    <span>Khoảnh khắc mới</span>
                                </div>

                                <div className="size-9" />
                            </div>

                            {/* Viewfinder Frame (Locket Rounded Card) */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[26px] bg-black border border-white/15 shadow-2xl flex items-center justify-center">
                                {cameraError ? (
                                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
                                        <div className="size-14 rounded-full bg-white/10 flex items-center justify-center text-white">
                                            <Camera className="size-7 opacity-90" />
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed px-2">
                                            {cameraError}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
                                        >
                                            <ImageIcon className="size-4" />
                                            Chọn ảnh từ máy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void startCamera()}
                                            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white/90 transition-all hover:bg-white/10 active:scale-95"
                                        >
                                            <RefreshCw className="size-3.5" />
                                            Thử lại camera
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className={cn(
                                                'size-full object-cover transition-opacity duration-300',
                                                cameraReady ? 'opacity-100' : 'opacity-0',
                                                facingMode === 'user' && 'scale-x-[-1]',
                                            )}
                                        />

                                        {cameraStarting && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-xs text-white/80">
                                                <LoaderCircle className="size-6 animate-spin text-emerald-400" />
                                                <span>Đang mở camera…</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Flash animation effect */}
                                {isFlashing && (
                                    <div className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-150" />
                                )}
                            </div>

                            {/* Bottom Shutter & Controls (Locket Style) */}
                            <div className="flex items-center justify-between w-full mt-5 px-6">
                                {/* Gallery Picker Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="size-12 sm:size-13 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all shadow-md cursor-pointer"
                                    title="Chọn ảnh từ thư viện"
                                >
                                    <ImageIcon className="size-5.5" />
                                </button>

                                {/* Iconic Locket Shutter Button */}
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    disabled={!cameraReady || cameraStarting}
                                    className={cn(
                                        'group relative size-18 sm:size-20 rounded-full border-[5px] border-amber-400 bg-white p-1 shadow-[0_0_24px_rgba(251,191,36,0.6)] active:scale-90 transition-all flex items-center justify-center cursor-pointer',
                                        (!cameraReady || cameraStarting) && 'opacity-60 pointer-events-none',
                                    )}
                                    title="Chụp ảnh"
                                >
                                    <span className="size-full rounded-full bg-white ring-2 ring-black/15 group-active:scale-92 transition-transform" />
                                </button>

                                {/* Switch Camera Button */}
                                <button
                                    type="button"
                                    onClick={toggleCameraFacing}
                                    className="size-12 sm:size-13 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all shadow-md cursor-pointer"
                                    title="Đổi camera trước/sau"
                                >
                                    <RefreshCw className="size-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MODE 2: Photo Captured / Selected (Locket Caption & Send) */}
                    {step === 'preview' && (
                        <div className="flex flex-col items-center">
                            {/* Top Bar */}
                            <div className="flex items-center justify-between w-full mb-3 px-1">
                                {!editing ? (
                                    <button
                                        type="button"
                                        onClick={handleRetake}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-semibold hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                                    >
                                        <ArrowLeft className="size-3.5" />
                                        Chụp lại
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-white/70">Chỉnh sửa</span>
                                )}

                                <div className="inline-flex items-center gap-1">
                                    {quickMoods.map((m) => (
                                        <button
                                            key={m.value}
                                            type="button"
                                            onClick={() =>
                                                form.setData('mood', form.data.mood === m.label ? '' : m.label)
                                            }
                                            className={cn(
                                                'size-7 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer',
                                                form.data.mood === m.label
                                                    ? 'bg-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                                                    : 'bg-white/10 hover:bg-white/20 text-white/80',
                                            )}
                                            title={m.label}
                                        >
                                            {m.emoji}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="size-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {/* Viewfinder Frame with Overlaid Locket Caption Input */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[26px] bg-black border border-white/15 shadow-2xl">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Ảnh khoảnh khắc"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="size-full flex items-center justify-center text-white/50 text-xs">
                                        Không có ảnh
                                    </div>
                                )}

                                {/* Subtle dark gradient overlay at bottom for maximum caption readability */}
                                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

                                {/* OVERLAID LOCKET CAPTION INPUT */}
                                <div className="absolute inset-x-3 bottom-3 z-20">
                                    <div className="relative flex items-center rounded-full bg-black/65 backdrop-blur-md border border-white/25 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                                        <input
                                            type="text"
                                            maxLength={80}
                                            value={form.data.content}
                                            onChange={(e) => form.setData('content', e.target.value)}
                                            placeholder="Gửi một lời nhắn..."
                                            autoFocus
                                            className="w-full bg-transparent text-white placeholder-white/60 text-xs sm:text-sm font-medium focus:outline-hidden"
                                        />
                                        <span className="text-[10px] sm:text-[11px] text-white/60 font-semibold shrink-0 ml-2">
                                            {form.data.content.length}/80
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Big Send / Save Button */}
                            <div className="w-full mt-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={form.processing || (!editing && form.data.photos.length === 0 && !previewUrl)}
                                    className="w-full h-12.5 rounded-full bg-gradient-to-r from-emerald-600 to-[#1c553d] hover:from-emerald-500 hover:to-[#164732] text-white font-bold text-sm sm:text-base shadow-[0_6px_22px_rgba(28,85,61,0.5)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none border border-emerald-400/30"
                                >
                                    {form.processing ? (
                                        <LoaderCircle className="size-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="size-4.5" />
                                            <span>{editing ? 'Lưu thay đổi' : 'Gửi khoảnh khắc'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

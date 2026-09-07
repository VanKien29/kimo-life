import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Camera, ImagePlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PhotoUploaderProps {
    value: File[];
    onChange: (files: File[]) => void;
    progress?: number;
    error?: string;
    maxPhotos?: number;
    quick?: boolean;
}

export function PhotoUploader({ value, onChange, progress, error, maxPhotos = 10, quick = false }: PhotoUploaderProps) {
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const nextPreviews = value.map((file) => URL.createObjectURL(file));
        setPreviews(nextPreviews);

        return () => nextPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    }, [value]);

    const addFiles = (files: FileList | null, single = false) => {
        if (!files) return;

        const nextFiles = Array.from(files)
            .filter((file) => file.type.startsWith('image/'))
            .slice(0, single ? 1 : maxPhotos - value.length);

        if (nextFiles.length > 0) onChange([...value, ...nextFiles]);
    };

    return (
        <div className="space-y-3">
            {quick ? (
                <div className="grid grid-cols-2 gap-3">
                    <label
                        className={cn(
                            'border-brand-border bg-brand-surface hover:border-brand-primary hover:bg-brand-pale/50 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 text-center transition-colors',
                            value.length >= maxPhotos && 'pointer-events-none opacity-60',
                        )}
                    >
                        <Camera className="text-brand-primary-dark size-7" />
                        <span className="mt-2 text-sm font-semibold">Chụp ảnh</span>
                        <span className="text-brand-secondary mt-1 text-xs">Mở camera</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            className="sr-only"
                            onChange={(event) => addFiles(event.target.files, true)}
                        />
                    </label>
                    <label
                        className={cn(
                            'border-brand-border bg-brand-surface hover:border-brand-primary hover:bg-brand-pale/50 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border px-3 text-center transition-colors',
                            value.length >= maxPhotos && 'pointer-events-none opacity-60',
                        )}
                    >
                        <ImagePlus className="text-brand-primary-dark size-7" />
                        <span className="mt-2 text-sm font-semibold">Chọn ảnh</span>
                        <span className="text-brand-secondary mt-1 text-xs">Từ thiết bị</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="sr-only"
                            onChange={(event) => addFiles(event.target.files)}
                        />
                    </label>
                </div>
            ) : (
                <label
                    className={cn(
                        'border-brand-border bg-brand-background hover:border-brand-primary hover:bg-brand-pale/50 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center transition-colors',
                        value.length >= maxPhotos && 'pointer-events-none opacity-60',
                    )}
                >
                    <ImagePlus className="text-brand-primary-dark size-7" />
                    <span className="mt-2 text-sm font-medium">Thêm ảnh vào khoảnh khắc</span>
                    <span className="text-brand-secondary mt-1 text-xs">JPG, PNG hoặc WebP · tối đa {maxPhotos} ảnh</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        onChange={(event) => addFiles(event.target.files)}
                    />
                </label>
            )}

            {quick && <p className="text-brand-secondary text-xs">Chọn một ảnh là đủ. Bạn có thể thêm tối đa {maxPhotos} ảnh.</p>}

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2" aria-label={`${previews.length} ảnh đã chọn`}>
                    {previews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="group bg-brand-pale relative aspect-square overflow-hidden rounded-xl">
                            <img src={preview} alt={`Ảnh xem trước ${index + 1}`} className="size-full object-cover" />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label={`Xóa ảnh ${index + 1}`}
                                onClick={() => onChange(value.filter((_, fileIndex) => fileIndex !== index))}
                                className="bg-brand-surface/90 shadow-soft absolute top-1.5 right-1.5 size-8 rounded-full border-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {typeof progress === 'number' && (
                <div className="space-y-1.5" aria-label={`Đang tải ảnh ${progress}%`}>
                    <div className="text-brand-secondary flex justify-between text-xs">
                        <span>Đang lưu ảnh…</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                </div>
            )}

            <InputError message={error} />
        </div>
    );
}

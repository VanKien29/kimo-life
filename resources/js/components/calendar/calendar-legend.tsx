import { Circle, Image as ImageIcon } from 'lucide-react';

export function CalendarLegend() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <ImageIcon className="size-3.5 text-emerald-600" />
                    Có ảnh khoảnh khắc
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Circle className="fill-amber-400 text-amber-400 size-2.5" />
                    Đã ghi tâm trạng
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="ring-emerald-600 inline-block size-2.5 rounded-full ring-2 ring-offset-1" />
                    Hôm nay
                </span>
            </div>

            <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline-block">
                ✦ Chạm vào ô ngày để xem nhanh ảnh kỷ niệm
            </span>
        </div>
    );
}

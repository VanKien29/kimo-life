import { cn } from '@/lib/utils';
import { type SVGProps, useId } from 'react';

type NatureIllustrationProps = SVGProps<SVGSVGElement> & {
    variant?: 'hero' | 'welcome' | 'empty' | 'onboarding';
};

/** Minh họa SVG nhẹ, tự dựng để giữ visual Kimo Life không phụ thuộc ảnh ngoài. */
export function NatureIllustration({ variant = 'hero', className, ...props }: NatureIllustrationProps) {
    const isEmpty = variant === 'empty';
    const id = useId().replace(/:/g, '');

    return (
        <svg viewBox="0 0 640 420" role="img" aria-label="Minh họa Kimo Life giữa thiên nhiên" className={cn('h-auto w-full', className)} {...props}>
            <defs>
                <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={isEmpty ? '#f5fbf5' : '#e9f6ee'} />
                    <stop offset="1" stopColor="#fdfcf7" />
                </linearGradient>
                <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#9ed0a8" />
                    <stop offset="1" stopColor="#4c9672" />
                </linearGradient>
                <linearGradient id={`${id}-water`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#d8efe5" />
                    <stop offset="1" stopColor="#b8dfce" />
                </linearGradient>
                <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#315c48" floodOpacity=".16" />
                </filter>
            </defs>

            <rect width="640" height="420" rx="34" fill={`url(#${id}-sky)`} />
            <circle cx="505" cy="100" r="36" fill="#ffdca2" opacity=".9" />
            <path d="M0 237C72 202 105 211 161 232c62 23 103 10 166-25 70-39 134-23 190 5 48 24 85 31 123 19v189H0V237Z" fill="#e3f1e5" />
            <path d="m40 303 129-151 75 81 111-139 161 209H40Z" fill={`url(#${id}-hill)`} opacity=".94" />
            <path d="m170 152 31 59-39-18-25 27 33-68Zm112 55 38-78 30 42-31-9-18 28-19 17Z" fill="#f3fbf3" opacity=".9" />
            <path d="M0 310c91-36 172-27 243 9 68 35 132 36 202 4 72-33 130-30 195 4v93H0v-110Z" fill="#a9d5ae" />
            <path d="M0 356c101-29 180-3 260 23 70 23 139 16 205-10 62-24 116-24 175-4v55H0v-64Z" fill="url(#kimo-water)" />

            <g opacity=".75" fill="#4d9a71">
                <path d="M53 83c-17-25-13-47 17-62 12 27 4 48-17 62Z" />
                <path d="M66 76c26-26 49-26 69-3-24 22-47 23-69 3Z" />
                <path d="M54 95c23-2 38 7 43 27-23 4-37-5-43-27Z" />
                <path d="M578 57c-12-22-7-39 16-51 9 22 3 38-16 51Z" />
                <path d="M590 59c21-17 39-15 51 2-19 16-35 15-51-2Z" />
            </g>

            {!isEmpty && (
                <g filter={`url(#${id}-shadow)`}>
                    <path d="M335 305c-14-35-14-62 2-80 13-15 28-16 42-4 18 15 23 48 13 84l-3 14h-48l-6-14Z" fill="#293d35" />
                    <path d="M348 233c-3-27 6-45 28-48 24-3 39 13 38 38-1 20-16 34-37 36-16 2-27-8-29-26Z" fill="#d89970" />
                    <path d="M347 218c4-31 28-43 53-27 12 8 17 20 15 36-11-8-21-15-32-16-11 12-22 17-36 17Z" fill="#2a3532" />
                    <path d="m319 292 52-24 42 21 21 76H310l9-73Z" fill="#467f68" />
                    <path d="m370 277 26 10-9 28-26-10Z" fill="#e7bb78" />
                    <path d="m318 294-26 31 19 9 29-28m82-13 34 24-9 10-40-19" fill="none" stroke="#293d35" strokeWidth="13" strokeLinecap="round" />
                    <path d="M301 363c-19 1-40 8-55 21h96c-1-14-17-22-41-21Zm101 0c-8 4-14 11-15 21h100c-13-14-41-23-85-21Z" fill="#293d35" />
                    <path d="M229 374c-16-26-38-31-57-18-16 11-19 30-5 40h92c-4-8-14-16-30-22Z" fill="#f3e9da" />
                    <path d="M185 362c-4-20 11-36 31-32 13 3 20 14 17 26-4 17-27 23-48 6Z" fill="#d99b75" />
                    <path d="M181 357c-4-18 10-32 31-29 12 2 20 10 21 23-15-6-29-7-42 6Z" fill="#7d4f3e" />
                    <path d="M188 376c-18 1-28 9-31 20h75c-5-14-18-21-44-20Z" fill="#e2c16f" />
                </g>
            )}

            <g fill="#4d9a71" opacity=".92">
                <path d="M90 360c-20-23-18-44 8-62 14 25 11 47-8 62Z" />
                <path d="M99 351c28-17 49-12 62 12-27 14-47 10-62-12Z" />
                <path d="M546 350c-17-21-14-40 10-55 11 23 7 41-10 55Z" />
                <path d="M554 345c25-16 43-12 53 10-23 13-41 10-53-10Z" />
            </g>
            <path d="M475 343c-20-16-39-14-55 4 19 19 38 18 55-4Z" fill="#fff8eb" filter={`url(#${id}-shadow)`} />
            <path d="M434 347c2-18 14-27 30-24 9 2 15 10 14 20-11-5-25-4-44 4Z" fill="#d99b75" />
            <circle cx="449" cy="345" r="2.5" fill="#293d35" />
            <circle cx="465" cy="345" r="2.5" fill="#293d35" />
            <path d="M97 390c41-11 71-8 94 8M467 390c38-12 70-8 95 8" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
            {variant === 'welcome' && <path d="M497 178c-6-33 9-55 42-63 6 32-9 54-42 63Z" fill="#4d9a71" opacity=".65" />}
            {variant === 'onboarding' && <path d="M123 186c24-15 42-10 54 13-23 14-41 10-54-13Z" fill="#4d9a71" opacity=".6" />}
        </svg>
    );
}

export default NatureIllustration;

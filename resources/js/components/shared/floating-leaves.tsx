import { cn } from '@/lib/utils';

interface FloatingLeavesProps {
    count?: number;
    className?: string;
}

/** Purely decorative floating leaf SVGs that drift across the viewport. */
export function FloatingLeaves({ count = 6, className }: FloatingLeavesProps) {
    const leaves = Array.from({ length: count }, (_, i) => ({
        id: i,
        style: {
            '--leaf-duration': `${7 + Math.random() * 6}s`,
            '--leaf-delay': `${Math.random() * 5}s`,
            '--leaf-x': `${-40 + Math.random() * 80}px`,
            '--leaf-y': `${100 + Math.random() * 200}px`,
            '--leaf-x2': `${-80 + Math.random() * 160}px`,
            '--leaf-y2': `${200 + Math.random() * 300}px`,
            top: `${Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
        } as React.CSSProperties,
        size: 12 + Math.random() * 14,
        rotation: Math.random() * 360,
    }));

    return (
        <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
            {leaves.map((leaf) => (
                <svg
                    key={leaf.id}
                    className="kimo-leaf"
                    style={leaf.style}
                    width={leaf.size}
                    height={leaf.size}
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12.21 20 15.36 17.03 16.64 14.16C18 11.14 18.4 7.7 17 8Z"
                        fill="#74C69D"
                        opacity="0.7"
                    />
                    <path
                        d="M17 8C8 10 5.9 16.17 3.82 21.34"
                        stroke="#4d9a71"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.4"
                    />
                </svg>
            ))}
        </div>
    );
}

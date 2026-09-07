import { cn } from '@/lib/utils';
import { CalendarDays, Flame, House, Plus, UsersRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export type MobileNavTab = 'home' | 'calendar' | 'add' | 'streak' | 'together';

export interface MobileBottomNavProps {
    activeTab?: MobileNavTab;
    onTabChange?: (tab: MobileNavTab) => void;
    onAddPress?: () => void;
    className?: string;
}

const navItems = [
    { id: 'home', label: 'Trang chủ', icon: House },
    { id: 'calendar', label: 'Lịch', icon: CalendarDays },
    { id: 'streak', label: 'Thói quen', icon: Flame },
    { id: 'together', label: 'Cùng nhau', icon: UsersRound },
] as const;

export function MobileBottomNav({ activeTab = 'home', onTabChange, onAddPress, className }: MobileBottomNavProps) {
    const reduceMotion = useReducedMotion();

    return (
        <nav
            role="navigation"
            aria-label="Thanh điều hướng chính"
            className={cn(
                'fixed inset-x-2 bottom-0 z-40 mx-auto w-[calc(100%-1rem)] max-w-[866px] select-none sm:inset-x-4 sm:w-[min(calc(100%-2rem),866px)]',
                'pb-[max(0.25rem,env(safe-area-inset-bottom))]',
                className,
            )}
        >
            <div className="relative mx-auto aspect-[866/288] w-full">
                <img
                    src="/images/kimo-bottom-nav.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />

                {/* Các nút nằm trực tiếp trên phần thân của ảnh nền. */}
                <div className="absolute inset-x-[3.25%] top-[40%] bottom-[25%] grid grid-cols-5 items-center">
                    {navItems.slice(0, 2).map((item) => (
                        <NavButton
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            reduceMotion={reduceMotion}
                            onClick={() => onTabChange?.(item.id)}
                        />
                    ))}

                    <div className="relative flex h-full items-center justify-center">
                        <motion.button
                            type="button"
                            aria-label="Thêm khoảnh khắc"
                            onClick={onAddPress}
                            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                            className="relative z-10 flex size-[clamp(2.85rem,7vw,3.9rem)] -translate-y-[20%] items-center justify-center rounded-full border-[3px] border-white bg-[#287b5a] text-white shadow-[0_5px_14px_rgb(36_90_67_/_0.35)] transition-colors hover:bg-[#1e6247] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#287b5a] focus-visible:ring-offset-2"
                        >
                            <Plus className="size-[clamp(1.5rem,4vw,2.1rem)] stroke-[2.2]" />
                        </motion.button>
                    </div>

                    {navItems.slice(2).map((item) => (
                        <NavButton
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            reduceMotion={reduceMotion}
                            onClick={() => onTabChange?.(item.id)}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}

interface NavButtonProps {
    item: (typeof navItems)[number];
    isActive: boolean;
    reduceMotion: boolean | null;
    onClick: () => void;
}

function NavButton({ item, isActive, reduceMotion, onClick }: NavButtonProps) {
    const Icon = item.icon;

    return (
        <motion.button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            onClick={onClick}
            animate={
                reduceMotion
                    ? undefined
                    : {
                          y: isActive ? 2 : 4,
                          scale: isActive ? 1.08 : 1,
                      }
            }
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.75 }}
            className="group relative flex h-full min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 text-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#287b5a] focus-visible:ring-offset-1"
        >
            {isActive && (
                <motion.span
                    layoutId="image-nav-active-pill"
                    className="pointer-events-none absolute inset-x-[20%] top-[4%] bottom-[14%] -z-0 rounded-[18px] bg-[#e2f4e8]/90 shadow-[0_3px_9px_rgb(63_143_107_/_0.14)]"
                    transition={
                        reduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
                    }
                />
            )}
            <Icon
                className={cn(
                    'relative z-10 size-[clamp(1.05rem,3vw,1.5rem)] transition-colors duration-200',
                    isActive
                        ? 'text-[#237b58] stroke-[2.5]'
                        : 'text-[#7893a3] stroke-[1.9] group-hover:text-[#237b58]',
                )}
            />
            <span
                className={cn(
                    'relative z-10 max-w-full truncate text-[clamp(0.58rem,1.8vw,0.78rem)] leading-tight transition-colors duration-200',
                    isActive ? 'font-bold text-[#237b58]' : 'font-medium text-[#7893a3] group-hover:text-[#385a66]',
                )}
            >
                {item.label}
            </span>
        </motion.button>
    );
}

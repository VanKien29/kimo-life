import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type AchievementItem, type DailyQuestItem, type QuestProgress } from '@/types/today';
import { motion } from 'motion/react';
import { Camera, Check, Code2, Flame, Heart, PenLine, Sparkles, Trophy, Users } from 'lucide-react';

const iconMap = {
    camera: Camera,
    check: Check,
    code: Code2,
    flame: Flame,
    heart: Heart,
    pen: PenLine,
    sparkles: Sparkles,
    trophy: Trophy,
    users: Users,
} as const;

const spring = { type: 'spring' as const, stiffness: 420, damping: 24 };

export function DailyQuests({ quests, progress, achievements }: { quests: DailyQuestItem[]; progress: QuestProgress; achievements: AchievementItem[] }) {
    return (
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" aria-label="Nhiệm vụ nhỏ và huy hiệu">
            <Card className="border-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-brand-primary-dark text-sm font-medium">Nhịp nhỏ hôm nay</p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight">Mỗi ngày một chút là đủ</h2>
                    </div>
                    <Badge variant="secondary">
                        {progress.completed} / {progress.total}
                    </Badge>
                </div>

                <div className="bg-brand-pale mt-5 h-2 overflow-hidden rounded-full" aria-label={`${progress.percent}% hoàn thành`}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percent}%` }}
                        transition={spring}
                        className="bg-brand-primary h-full rounded-full"
                    />
                </div>
                <p className="text-brand-secondary mt-2 text-xs">{progress.completed === progress.total ? 'Bạn đã hoàn thành nhịp hôm nay ✨' : 'Chọn một điều vừa sức để tiếp tục.'}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {quests.map((quest) => (
                        <QuestRow key={quest.key} quest={quest} />
                    ))}
                </div>
            </Card>

            <Card className="border-0 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-brand-primary-dark text-sm font-medium">Huy hiệu</p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight">Những cột mốc của bạn</h2>
                    </div>
                    <span className="bg-brand-pale text-brand-primary-dark rounded-full p-2.5" aria-hidden="true">
                        <Trophy className="size-5" />
                    </span>
                </div>

                {achievements.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2.5">
                        {achievements.map((achievement) => (
                            <AchievementBadge key={achievement.key} achievement={achievement} />
                        ))}
                    </div>
                ) : (
                    <div className="border-brand-border bg-brand-background mt-5 rounded-2xl border border-dashed p-4">
                        <p className="text-brand-text text-sm font-semibold">Cột mốc đầu tiên đang chờ bạn.</p>
                        <p className="text-brand-secondary mt-1 text-sm leading-6">Lưu một khoảnh khắc để mở huy hiệu đầu tiên.</p>
                    </div>
                )}
            </Card>
        </section>
    );
}

function QuestRow({ quest }: { quest: DailyQuestItem }) {
    const Icon = iconMap[quest.icon as keyof typeof iconMap] ?? Sparkles;

    return (
        <motion.div
            animate={quest.completed ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 0.35 }}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${quest.completed ? 'border-brand-primary/30 bg-brand-pale/60' : 'border-brand-border bg-brand-background'}`}
        >
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${quest.completed ? 'bg-brand-primary text-white' : 'bg-brand-pale text-brand-primary-dark'}`}>
                {quest.completed ? <Check className="size-4" /> : <Icon className="size-4" />}
            </span>
            <span className="min-w-0">
                <span className="text-brand-text block truncate text-sm font-semibold">{quest.label}</span>
                <span className="text-brand-secondary block truncate text-xs">{quest.description}</span>
            </span>
        </motion.div>
    );
}

function AchievementBadge({ achievement }: { achievement: AchievementItem }) {
    const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? Sparkles;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            title={achievement.description}
            className="border-brand-primary/20 bg-brand-pale/60 text-brand-primary-dark inline-flex items-center gap-2 rounded-2xl border px-3 py-2"
        >
            <Icon className="size-4" />
            <span className="text-xs font-semibold">{achievement.label}</span>
            {achievement.is_new && <span className="text-[10px]" aria-label="Mới mở khóa">✨</span>}
        </motion.div>
    );
}

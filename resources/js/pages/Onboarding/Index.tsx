import InputError from '@/components/input-error';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, BarChart3, Camera, Check, Flame, Sparkles } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface OnboardingProfile {
    name: string;
    username: string | null;
    bio: string | null;
    timezone: string;
    locale: string;
}

interface OnboardingProps {
    profile: OnboardingProfile;
}

const steps = [
    { label: 'Chào mừng', title: 'Những khoảnh khắc nhỏ tạo nên một ngày lớn.' },
    { label: 'Hồ sơ', title: 'Cho Kimo biết thêm một chút về bạn.' },
    { label: 'Nhịp sống', title: 'Thiết lập không gian theo nhịp sống của bạn.' },
] as const;

const timezones = [
    { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
];

const featureHighlights = [
    { icon: Camera, label: 'Lưu khoảnh khắc', desc: 'Ảnh, ghi chú, địa điểm...' },
    { icon: Flame, label: 'Theo dõi thói quen', desc: 'Tạo mục tiêu, giữ chuỗi' },
    { icon: BarChart3, label: 'Nhìn lại hành trình', desc: 'Lịch trực quan, dễ xem' },
    { icon: Sparkles, label: 'Thống kê tiến bộ', desc: 'Hiểu rõ bản thân hơn' },
] as const;

function suggestUsername(name: string) {
    const withoutDiacritics = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return withoutDiacritics.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'kimo-user';
}

export default function Onboarding({ profile }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const reduceMotion = useReducedMotion();
    const { data, setData, patch, processing, errors } = useForm({
        name: profile.name,
        username: profile.username?.trim() || suggestUsername(profile.name),
        bio: profile.bio ?? '',
        timezone: profile.timezone,
        locale: profile.locale || 'vi',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('onboarding.update'), {
            preserveScroll: true,
            onError: (validationErrors) => {
                if (validationErrors.name || validationErrors.username || validationErrors.bio) {
                    setStep(1);
                }
            },
        });
    };

    const next = () => setStep((current) => Math.min(current + 1, steps.length - 1));
    const previous = () => setStep((current) => Math.max(current - 1, 0));

    return (
        <AuthLayout title={steps[step].title} description="Mất chưa đến một phút để bắt đầu lưu lại hành trình của bạn.">
            <Head title="Bắt đầu với Kimo Life" />

            <form onSubmit={submit} className="space-y-6">
                <div className="flex items-center gap-2" aria-label={`Bước ${step + 1} trên ${steps.length}`}>
                    {steps.map((item, index) => (
                        <div key={item.label} className="flex flex-1 items-center gap-2">
                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index <= step ? 'bg-brand-primary text-white' : 'bg-brand-pale text-brand-secondary'}`}>
                                {index < step ? <Check className="size-4" /> : index + 1}
                            </span>
                            <span className={`hidden text-xs font-medium sm:inline ${index === step ? 'text-brand-primary-dark' : 'text-brand-muted'}`}>{item.label}</span>
                            {index < steps.length - 1 && <span className="h-px flex-1 bg-brand-border" />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={step}
                        initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="min-h-56"
                    >
                        {step === 0 && <WelcomeStep />}
                        {step === 1 && <ProfileStep data={data} setData={setData} errors={errors} />}
                        {step === 2 && <RhythmStep data={data} setData={setData} errors={errors} />}
                    </motion.div>
                </AnimatePresence>

                <div className="flex items-center justify-between gap-3">
                    {step > 0 ? (
                        <Button type="button" variant="ghost" onClick={previous} disabled={processing}>
                            <ArrowLeft />
                            Quay lại
                        </Button>
                    ) : <span />}

                    {step < steps.length - 1 ? (
                        <Button type="button" onClick={next}>
                            Tiếp tục
                            <ArrowRight />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={processing}>
                            Hoàn tất
                            <Sparkles />
                        </Button>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
}

function WelcomeStep() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-pale/65">
            {/* Chibi illustration — full view with boy and cat */}
            <div className="relative overflow-hidden rounded-t-3xl">
                <img
                    src="/images/onboarding-illustration.jpg"
                    alt="Minh họa Kimo Life"
                    className="mx-auto h-64 w-full object-cover object-[center_30%] sm:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-pale via-transparent to-transparent" />
            </div>

            <div className="relative z-10 -mt-8 px-5 pb-5">
                <div className="rounded-2xl bg-white/85 px-5 py-5 shadow-soft backdrop-blur">
                    <div className="flex justify-center">
                        <Logo variant="full" tagline />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {featureHighlights.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex flex-col items-center gap-2 text-center">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-pale text-brand-primary-dark">
                                    <Icon className="size-4" />
                                </span>
                                <span className="text-xs font-semibold text-brand-text">{label}</span>
                                <span className="text-[10px] leading-4 text-brand-secondary">{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileStep({ data, setData, errors }: { data: { name: string; username: string; bio: string }; setData: (key: 'name' | 'username' | 'bio', value: string) => void; errors: Record<string, string | undefined> }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="onboarding-name">Họ và tên</Label>
                <Input id="onboarding-name" value={data.name} onChange={(event) => setData('name', event.target.value)} autoComplete="name" />
                <InputError message={errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="onboarding-username">Tên người dùng</Label>
                <Input id="onboarding-username" value={data.username} onChange={(event) => setData('username', event.target.value)} placeholder="ten-cua-ban" autoComplete="username" />
                <p className="text-xs text-brand-secondary">Dùng chữ cái, số, gạch ngang hoặc gạch dưới.</p>
                <InputError message={errors.username} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="onboarding-bio">Giới thiệu ngắn <span className="font-normal text-brand-muted">(không bắt buộc)</span></Label>
                <Textarea id="onboarding-bio" value={data.bio} onChange={(event) => setData('bio', event.target.value)} placeholder="Một điều nhỏ nói về bạn..." className="min-h-20" />
                <InputError message={errors.bio} />
            </div>
        </div>
    );
}

function RhythmStep({ data, setData, errors }: { data: { timezone: string; locale: string }; setData: (key: 'timezone' | 'locale', value: string) => void; errors: Record<string, string | undefined> }) {
    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-brand-pale/65 p-4 text-sm leading-6 text-brand-secondary">
                Múi giờ giúp Kimo tính "hôm nay", chuỗi và lời nhắc đúng với cuộc sống của bạn.
            </div>
            <div className="grid gap-2">
                <Label htmlFor="onboarding-timezone">Múi giờ</Label>
                <select id="onboarding-timezone" value={data.timezone} onChange={(event) => setData('timezone', event.target.value)} className="flex h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-sm text-brand-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark focus-visible:ring-offset-2">
                    {timezones.map((timezone) => <option key={timezone.value} value={timezone.value}>{timezone.label}</option>)}
                </select>
                <InputError message={errors.timezone} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="onboarding-locale">Ngôn ngữ web</Label>
                <select id="onboarding-locale" value={data.locale} onChange={(event) => setData('locale', event.target.value)} className="flex h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-sm text-brand-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary-dark focus-visible:ring-offset-2">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                </select>
                <InputError message={errors.locale} />
            </div>
        </div>
    );
}

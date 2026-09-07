import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { Tag } from '@/components/ui/tag';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import { PhotoCarousel } from '@/components/shared/photo-carousel';
import { PhotoGrid } from '@/components/shared/photo-grid';
import { PhotoStack } from '@/components/shared/photo-stack';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Bell, Check, ChevronDown, Heart, Leaf, MoreHorizontal, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

const showcasePhotos = [
    { id: 'one', src: '/images/kimo-placeholder-one.svg', alt: 'Minh họa lá cây xanh trên nền kem' },
    { id: 'two', src: '/images/kimo-placeholder-two.svg', alt: 'Minh họa khoảnh khắc bình yên' },
    { id: 'three', src: '/images/kimo-placeholder-three.svg', alt: 'Minh họa một ngày nhẹ nhàng' },
] as const;

const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'memory', label: 'Khoảnh khắc' },
    { id: 'habit', label: 'Thói quen' },
];

export default function Foundation() {
    const [selectedTab, setSelectedTab] = useState('all');

    return (
        <AppLayout>
            <Head title="Nền tảng giao diện" />

            <div className="space-y-8 py-4 sm:space-y-10 sm:py-8">
                <header className="max-w-2xl">
                    <Tag tone="green" className="mb-4">
                        <Leaf className="mr-1.5 size-3.5" />
                        Phase 1 · Nền tảng giao diện
                    </Tag>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bộ thành phần Kimo Life</h1>
                    <p className="mt-3 text-base leading-7 text-brand-secondary">
                        Trang trưng bày nội bộ để kiểm tra token, component, trạng thái tương tác và ngôn ngữ tiếng Việt trước khi bước vào các phase sản phẩm.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-3" aria-label="Token màu thương hiệu">
                    <TokenSwatch name="Primary" className="bg-brand-primary text-brand-primary-foreground" detail="#74C69D" />
                    <TokenSwatch name="Pale" className="bg-brand-pale text-brand-primary-dark" detail="#E8F5E9" />
                    <TokenSwatch name="Surface" className="border border-brand-border bg-brand-surface text-brand-text" detail="#FFFFFF" />
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nút và trạng thái</CardTitle>
                            <CardDescription>Touch target rõ ràng, màu xanh tiết chế và phản hồi nhẹ.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap gap-2">
                                <Button>
                                    <Plus />
                                    Thêm khoảnh khắc
                                </Button>
                                <Button variant="outline">Xem chi tiết</Button>
                                <Button variant="secondary">Lưu nháp</Button>
                                <Button variant="ghost">Bỏ qua</Button>
                                <Button variant="destructive">Xóa</Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge>Đang hoạt động</Badge>
                                <Badge variant="secondary">Riêng tư</Badge>
                                <Badge variant="outline">Bản nháp</Badge>
                                <Tag tone="orange">Nhẹ nhàng</Tag>
                                <Tag tone="blue">Bạn bè</Tag>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Biểu mẫu</CardTitle>
                            <CardDescription>Label tiếng Việt, focus rõ và khoảng cách thoáng.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="showcase-title">Tiêu đề khoảnh khắc</Label>
                                <Input id="showcase-title" placeholder="Ví dụ: Một tách cà phê sáng nay" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="showcase-note">Ghi chú</Label>
                                <Textarea id="showcase-note" placeholder="Bạn muốn nhớ điều gì về hôm nay?" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>Điều hướng và menu</CardTitle>
                                <CardDescription className="mt-1">Tabs, icon button và dropdown dùng chung.</CardDescription>
                            </div>
                            <IconButton variant="ghost" aria-label="Mở tùy chọn">
                                <MoreHorizontal />
                            </IconButton>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <Tabs items={tabs} value={selectedTab} onValueChange={setSelectedTab} />
                            <div className="flex flex-wrap items-center gap-3">
                                <Dropdown label={<Button variant="outline" size="sm">Tùy chọn <ChevronDown /></Button>}>
                                    <DropdownItem onClick={() => undefined}>Đánh dấu đã xem</DropdownItem>
                                    <DropdownItem onClick={() => undefined}>Chia sẻ với bạn bè</DropdownItem>
                                </Dropdown>
                                <Modal>
                                    <ModalTrigger asChild>
                                        <Button variant="outline" size="sm">Mở modal</Button>
                                    </ModalTrigger>
                                    <ModalContent>
                                        <ModalHeader>
                                            <ModalTitle>Một lời nhắc nhỏ</ModalTitle>
                                            <ModalDescription>Modal giữ nhịp trò chuyện ngắn, ấm áp và dễ đóng.</ModalDescription>
                                        </ModalHeader>
                                    </ModalContent>
                                </Modal>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Avatar và tiến độ</CardTitle>
                            <CardDescription>Hiển thị người dùng và tiến trình theo cách nhẹ nhàng.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12 border-2 border-brand-pale">
                                    <AvatarImage src="/images/kimo-placeholder-one.svg" alt="" />
                                    <AvatarFallback>VK</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Van Kien</p>
                                    <p className="text-sm text-brand-secondary">Đang lưu một ngày thật nhẹ</p>
                                </div>
                            </div>
                            <AvatarGroup items={[{ id: 1, name: 'Kien' }, { id: 2, name: 'Mai' }, { id: 3, name: 'An' }, { id: 4, name: 'Linh' }, { id: 5, name: 'Minh' }]} />
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span>Tiến bộ hôm nay</span><span className="font-semibold">68%</span></div>
                                <Progress value={68} aria-label="Tiến bộ hôm nay 68 phần trăm" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái nội dung</CardTitle>
                            <CardDescription>Empty, loading và feedback cần có ngay từ foundation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Toast title="Đã lưu khoảnh khắc" description="Bạn có thể quay lại xem bất cứ lúc nào." />
                            <EmptyState title="Chưa có dữ liệu" description="Khi bạn thêm khoảnh khắc đầu tiên, nội dung sẽ xuất hiện ở đây." action={<Button size="sm">Bắt đầu</Button>} />
                            <div className="space-y-2" aria-label="Đang tải nội dung">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Nền tảng ảnh</CardTitle>
                            <CardDescription>PhotoStack là điểm nhận diện; lưới và băng chuyền dùng chung một primitive ảnh.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 sm:grid-cols-2">
                            <PhotoStack photos={showcasePhotos} label="Ba ảnh minh họa xếp chồng" />
                            <div className="space-y-4">
                                <PhotoGrid photos={[...showcasePhotos]} />
                                <PhotoCarousel photos={[...showcasePhotos]} />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="rounded-2xl border border-brand-border bg-brand-pale/70 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="rounded-xl bg-brand-surface p-2.5 text-brand-primary-dark shadow-soft"><Sparkles className="size-5" /></span>
                        <div>
                            <h2 className="font-semibold">Nguyên tắc kiểm tra nhanh</h2>
                            <p className="mt-1 text-sm leading-6 text-brand-secondary">Mọi màn hình mới cần giữ được cảm giác xanh, kem, mềm, rõ ràng và thân thiện với tiếng Việt.</p>
                        </div>
                    </div>
                    <Divider className="my-5" />
                    <div className="grid gap-3 text-sm text-brand-secondary sm:grid-cols-3">
                        <p className="flex items-center gap-2"><Check className="size-4 text-brand-primary-dark" /> Không overflow mobile</p>
                        <p className="flex items-center gap-2"><Heart className="size-4 text-brand-primary-dark" /> Copy ngắn, ấm áp</p>
                        <p className="flex items-center gap-2"><Bell className="size-4 text-brand-primary-dark" /> Có trạng thái phản hồi</p>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function TokenSwatch({ name, detail, className }: { name: string; detail: string; className: string }) {
    return (
        <div className={`rounded-2xl p-5 shadow-soft ${className}`}>
            <p className="text-sm font-semibold">{name}</p>
            <p className="mt-8 text-xs opacity-80">{detail}</p>
        </div>
    );
}

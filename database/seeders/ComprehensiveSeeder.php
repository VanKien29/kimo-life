<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\AppNotification;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\DailyQuestCompletion;
use App\Models\DuoStreak;
use App\Models\DuoStreakLog;
use App\Models\DuoStreakMember;
use App\Models\Favorite;
use App\Models\Friendship;
use App\Models\GroupChallenge;
use App\Models\GroupChallengeLog;
use App\Models\GroupChallengeMember;
use App\Models\Memory;
use App\Models\MemoryComment;
use App\Models\MemoryPhoto;
use App\Models\MemoryReaction;
use App\Models\Message;
use App\Models\Reminder;
use App\Models\SharedMemory;
use App\Models\SharedMemoryNote;
use App\Models\SharedMemoryParticipant;
use App\Models\SharedMemoryPhoto;
use App\Models\SharedMemoryReaction;
use App\Models\Streak;
use App\Models\StreakLog;
use App\Models\Tag;
use App\Models\User;
use App\Models\UserAchievement;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ComprehensiveSeeder extends Seeder
{
    public function run(): void
    {
        $now = CarbonImmutable::now('Asia/Ho_Chi_Minh');
        $today = $now->startOfDay();

        // 1. CLEAN UP PREVIOUS SEEDED DATA (preserving user credentials)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        MemoryPhoto::truncate();
        MemoryComment::truncate();
        MemoryReaction::truncate();
        Favorite::truncate();
        DB::table('memory_activity')->truncate();
        DB::table('memory_tag')->truncate();
        Memory::truncate();
        StreakLog::truncate();
        Streak::truncate();
        DuoStreakLog::truncate();
        DuoStreakMember::truncate();
        DuoStreak::truncate();
        GroupChallengeLog::truncate();
        GroupChallengeMember::truncate();
        GroupChallenge::truncate();
        SharedMemoryPhoto::truncate();
        SharedMemoryNote::truncate();
        SharedMemoryReaction::truncate();
        SharedMemoryParticipant::truncate();
        SharedMemory::truncate();
        Message::truncate();
        ConversationMember::truncate();
        Conversation::truncate();
        AppNotification::truncate();
        Reminder::truncate();
        DailyQuestCompletion::truncate();
        UserAchievement::truncate();
        Friendship::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. USERS
        $user1 = User::find(1);
        if ($user1) {
            $user1->update([
                'name' => 'Văn Kiên',
                'username' => 'van-kien',
                'bio' => 'Sống chậm, yêu những điều nhỏ bé và không ngừng tiến bộ mỗi ngày 🌱',
                'avatar' => '/images/character-hero.jpg',
                'timezone' => 'Asia/Ho_Chi_Minh',
                'locale' => 'vi',
                'onboarding_completed_at' => $now->subDays(30),
            ]);
        } else {
            $user1 = User::create([
                'name' => 'Văn Kiên',
                'email' => 'vkien29062006@gmail.com',
                'username' => 'van-kien',
                'password' => Hash::make('password'),
                'bio' => 'Sống chậm, yêu những điều nhỏ bé và không ngừng tiến bộ mỗi ngày 🌱',
                'avatar' => '/images/character-hero.jpg',
                'timezone' => 'Asia/Ho_Chi_Minh',
                'locale' => 'vi',
                'email_verified_at' => $now,
                'onboarding_completed_at' => $now->subDays(30),
            ]);
        }

        $user5 = User::find(5);
        if ($user5) {
            $user5->update([
                'name' => 'Văn Kiên (Phụ)',
                'username' => 'van-kien-1',
                'bio' => 'Tài khoản phụ thử nghiệm kết nối và chuỗi đôi 🚀',
                'avatar' => '/images/character-onboarding.jpg',
                'timezone' => 'Asia/Ho_Chi_Minh',
                'locale' => 'vi',
                'onboarding_completed_at' => $now->subDays(20),
            ]);
        }

        $friendsData = [
            [
                'name' => 'Mai Linh',
                'email' => 'mailinh@kimo.life',
                'username' => 'mailinh',
                'bio' => 'Thích nhiếp ảnh, trà hoa cúc và những góc quán yên tĩnh ☕',
                'avatar' => '/images/photo-cafe.jpg',
            ],
            [
                'name' => 'Minh Triết',
                'email' => 'minhtriet@kimo.life',
                'username' => 'minhtriet',
                'bio' => 'Lập trình viên, chạy bộ mỗi chiều và nuôi mèo 🐱',
                'avatar' => '/images/photo-running.jpg',
            ],
            [
                'name' => 'Thu Hà',
                'email' => 'thuha@kimo.life',
                'username' => 'thuha',
                'bio' => 'Yêu hoa, đọc sách và lưu giữ từng khoảnh khắc nhỏ ✨',
                'avatar' => '/images/photo-tea.jpg',
            ],
            [
                'name' => 'Hoàng Nam',
                'email' => 'hoangnam@kimo.life',
                'username' => 'hoangnam',
                'bio' => 'Hành trình xây dựng phiên bản tốt hơn mỗi ngày 🌿',
                'avatar' => '/images/photo-workspace.jpg',
            ],
            [
                'name' => 'Bảo Long',
                'email' => 'baolong@kimo.life',
                'username' => 'baolong',
                'bio' => 'Cà phê, âm nhạc và những chuyến đi cuối tuần 🚲',
                'avatar' => '/images/photo-dinner.jpg',
            ],
            [
                'name' => 'Phương Thảo',
                'email' => 'phuongthao@kimo.life',
                'username' => 'phuongthao',
                'bio' => 'Viết lách, thiền định và sống chậm lại 🌻',
                'avatar' => '/images/photo-forest.jpg',
            ],
        ];

        $friends = [];
        foreach ($friendsData as $fdata) {
            $user = User::updateOrCreate(
                ['email' => $fdata['email']],
                [
                    'name' => $fdata['name'],
                    'username' => $fdata['username'],
                    'password' => Hash::make('password'),
                    'bio' => $fdata['bio'],
                    'avatar' => $fdata['avatar'],
                    'timezone' => 'Asia/Ho_Chi_Minh',
                    'locale' => 'vi',
                    'email_verified_at' => $now,
                    'onboarding_completed_at' => $now->subDays(25),
                ]
            );
            $friends[$fdata['username']] = $user;
        }

        $allUsers = collect([$user1, $user5, ...array_values($friends)])->filter();

        // 3. ACTIVITIES & TAGS
        $activityTemplates = [
            ['name' => 'Đọc sách', 'icon' => 'book-open', 'color' => 'emerald'],
            ['name' => 'Chạy bộ 5km', 'icon' => 'flame', 'color' => 'amber'],
            ['name' => 'Uống đủ 2L nước', 'icon' => 'droplets', 'color' => 'sky'],
            ['name' => 'Lập trình / Code', 'icon' => 'code', 'color' => 'violet'],
            ['name' => 'Thiền tĩnh tâm', 'icon' => 'heart', 'color' => 'rose'],
            ['name' => 'Đi dạo cùng mèo', 'icon' => 'sparkles', 'color' => 'teal'],
            ['name' => 'Cà phê sớm', 'icon' => 'coffee', 'color' => 'orange'],
        ];

        $tagsList = ['Bình yên', 'Công việc', 'Cà phê', 'Gia đình', 'Thiên nhiên', 'Cuối tuần', 'Đọc sách', 'Sức khỏe', 'Chill'];

        $userActivities = [];
        $userTags = [];

        foreach ($allUsers as $u) {
            foreach ($activityTemplates as $act) {
                $userActivities[$u->id][$act['name']] = Activity::firstOrCreate(
                    ['user_id' => $u->id, 'name' => $act['name']],
                    ['icon' => $act['icon'], 'color' => $act['color']]
                );
            }

            foreach ($tagsList as $tName) {
                $userTags[$u->id][$tName] = Tag::firstOrCreate(
                    ['user_id' => $u->id, 'name' => $tName]
                );
            }
        }

        // 4. SEED MEMORIES WITH 100% REAL VALID PHOTOS
        $memoryStories = [
            [
                'offset' => 0, // Today
                'title' => 'Buổi sáng tinh mơ bên ban công với ly trà xanh',
                'content' => 'Gió thu se lạnh thoang thoảng mùi hoa sữa. Nhấp một ngụm trà ấm, ngắm nhìn phố xá bắt đầu ngày mới, lòng thấy bình yên đến lạ thường.',
                'mood' => 'binh-yen',
                'visibility' => 'public',
                'location' => 'Hà Nội',
                'photos' => ['/images/photo-tea.jpg'],
                'activity' => 'Cà phê sớm',
                'tags' => ['Bình yên', 'Chill'],
            ],
            [
                'offset' => 0, // Today
                'title' => 'Hoàn thành bản thiết kế mới cho Kimo Life',
                'content' => 'Cảm giác nhìn những ý tưởng biến thành giao diện hoàn chỉnh thật sự tuyệt vời. Một ngày làm việc tràn đầy năng lượng tích cực!',
                'mood' => 'hao-hung',
                'visibility' => 'friends',
                'location' => 'Bàn làm việc',
                'photos' => ['/images/photo-workspace.jpg'],
                'activity' => 'Lập trình / Code',
                'tags' => ['Công việc'],
            ],
            [
                'offset' => 1, // Yesterday - 3 PHOTOS (triggers 3D PhotoStack!)
                'title' => 'Chiều hoàng hôn đỏ rực trên hồ Tây',
                'content' => 'Mặt trời lặn nhuộm hồng cả bầu trời mặt nước. Cùng bạn bè ngồi hóng gió, nhâm nhi cốc trà đào và trò chuyện về những dự định tương lai.',
                'mood' => 'biet-on',
                'visibility' => 'public',
                'location' => 'Hồ Tây, Hà Nội',
                'photos' => ['/images/photo-sunset.jpg', '/images/character-hero.jpg', '/images/photo-cafe.jpg'],
                'activity' => 'Đi dạo cùng mèo',
                'tags' => ['Thiên nhiên', 'Chill'],
            ],
            [
                'offset' => 2,
                'title' => 'Ghé quán cafe sách quen thuộc, đọc xong cuốn Nhà giả kim',
                'content' => 'Khi bạn thực sự khao khát một điều gì đó, cả vũ trụ sẽ hợp sức giúp bạn đạt được nó. Góc quán yên tĩnh, tiếng nhạc lofi nhẹ nhàng du dương.',
                'mood' => 'binh-yen',
                'visibility' => 'public',
                'location' => 'The Note Coffee',
                'photos' => ['/images/photo-cafe.jpg'],
                'activity' => 'Đọc sách',
                'tags' => ['Đọc sách', 'Cà phê', 'Bình yên'],
            ],
            [
                'offset' => 3,
                'title' => 'Chạy bộ sáng sớm 5km quanh công viên',
                'content' => 'Khởi đầu ngày mới bằng việc đổ mồ hôi. Cơ thể tỉnh táo, tinh thần sảng khoái và tràn đầy năng lượng cho cả ngày dài.',
                'mood' => 'vui',
                'visibility' => 'friends',
                'location' => 'Công viên Nghĩa Đô',
                'photos' => ['/images/photo-running.jpg'],
                'activity' => 'Chạy bộ 5km',
                'tags' => ['Sức khỏe'],
            ],
            [
                'offset' => 4, // 2 PHOTOS (triggers PhotoCarousel!)
                'title' => 'Dạo bước giữa rừng thông Ba Vì',
                'content' => 'Không khí vùng cao mát lạnh và thơm ngát hương thông. Tiếng chim hót ríu rít giữa sương mù mờ ảo, cảm giác như lạc vào một thế giới cổ tích.',
                'mood' => 'binh-yen',
                'visibility' => 'public',
                'location' => 'Vườn Quốc Gia Ba Vì',
                'photos' => ['/images/photo-forest.jpg', '/images/photo-sunset.jpg'],
                'activity' => 'Đi dạo cùng mèo',
                'tags' => ['Thiên nhiên', 'Cuối tuần'],
            ],
            [
                'offset' => 5,
                'title' => 'Tự tay nấu bữa tối ấm cúng cùng bạn bè',
                'content' => 'Một nồi lẩu nấm nóng hổi giữa tiết trời se lạnh. Tiếng cười nói rôm rả xua tan mọi mệt mỏi của tuần làm việc bận rộn.',
                'mood' => 'vui',
                'visibility' => 'friends',
                'location' => 'Tại nhà',
                'photos' => ['/images/photo-dinner.jpg'],
                'activity' => 'Cà phê sớm',
                'tags' => ['Gia đình', 'Cuối tuần'],
            ],
            [
                'offset' => 6,
                'title' => 'Buổi tối yên tĩnh đọc sách dưới ánh đèn vàng',
                'content' => 'Chú mèo nhỏ cuộn tròn ngủ say bên chân. Lật từng trang sách, ghi chép lại vài dòng suy nghĩ tâm đắc vào sổ tay.',
                'mood' => 'binh-yen',
                'visibility' => 'public',
                'location' => 'Phòng đọc sách',
                'photos' => ['/images/character-reading.jpg'],
                'activity' => 'Đọc sách',
                'tags' => ['Đọc sách', 'Bình yên'],
            ],
            [
                'offset' => 7,
                'title' => 'Một tuần năng suất vượt bậc với dự án',
                'content' => 'Đã hoàn thành xuất sắc toàn bộ mục tiêu đề ra cho tuần này. Tự thưởng cho bản thân một buổi tối nghỉ ngơi trọn vẹn.',
                'mood' => 'hao-hung',
                'visibility' => 'private',
                'location' => 'Hà Nội',
                'photos' => ['/images/photo-workspace.jpg'],
                'activity' => 'Lập trình / Code',
                'tags' => ['Công việc'],
            ],
            [
                'offset' => 8,
                'title' => 'Tập thiền 20 phút sau một ngày dài mệt mỏi',
                'content' => 'Thả lỏng từng bó cơ, hướng sự chú ý về hơi thở. Những suy nghĩ hỗn loạn dần lắng dịu lại, trả về sự tĩnh lặng nguyên sơ.',
                'mood' => 'met',
                'visibility' => 'private',
                'location' => 'Phòng ngủ',
                'photos' => ['/images/character-onboarding.jpg'],
                'activity' => 'Thiền tĩnh tâm',
                'tags' => ['Sức khỏe', 'Bình yên'],
            ],
            [
                'offset' => 10,
                'title' => 'Uống đủ 2.5 lít nước và cảm thấy cơ thể nhẹ nhõm',
                'content' => 'Đã duy trì thói quen uống nước đều đặn suốt cả tuần. Da dẻ sáng hơn và không còn cảm giác đau đầu uể oải.',
                'mood' => 'vui',
                'visibility' => 'friends',
                'location' => 'Công ty',
                'photos' => ['/images/photo-tea.jpg'],
                'activity' => 'Uống đủ 2L nước',
                'tags' => ['Sức khỏe'],
            ],
            [
                'offset' => 12,
                'title' => 'Gặp lại người bạn cũ sau 2 năm xa cách',
                'content' => 'Bao nhiêu kỷ niệm thời sinh viên ùa về. Dù mỗi đứa đều có ngã rẽ riêng nhưng cảm giác thân thuộc vẫn vẹn nguyên như ngày nào.',
                'mood' => 'biet-on',
                'visibility' => 'friends',
                'location' => 'Quán Xưa',
                'photos' => ['/images/photo-cafe.jpg'],
                'activity' => 'Cà phê sớm',
                'tags' => ['Chill', 'Gia đình'],
            ],
            [
                'offset' => 14,
                'title' => 'Thử nghiệm công thức làm bánh mì yến mạch',
                'content' => 'Mùi thơm bánh mới nướng ngập tràn cả căn bếp nhỏ. Vỏ ngoài giòn rụm, bên trong mềm xốp, ăn kèm bơ đậu phộng cực ngon.',
                'mood' => 'vui',
                'visibility' => 'public',
                'location' => 'Bếp nhỏ',
                'photos' => ['/images/photo-dinner.jpg'],
                'activity' => 'Cà phê sớm',
                'tags' => ['Sức khỏe', 'Cuối tuần'],
            ],
            [
                'offset' => 16,
                'title' => 'Một ngày mưa rơi rả rích',
                'content' => 'Ngồi bên cửa sổ nghe tiếng mưa rơi đều đặn trên mái hiên. Nhìn những giọt nước đọng trên tán lá xanh ngoài vườn.',
                'mood' => 'binh-yen',
                'visibility' => 'public',
                'location' => 'Hà Nội',
                'photos' => ['/images/character-onboarding.jpg'],
                'activity' => 'Đọc sách',
                'tags' => ['Bình yên'],
            ],
            [
                'offset' => 20,
                'title' => 'Khởi động thói quen dậy sớm 6h sáng',
                'content' => 'Những ngày đầu dậy sớm thật không dễ dàng, nhưng cảm giác có thêm 2 tiếng thảnh thơi trước giờ đi làm thật xứng đáng.',
                'mood' => 'hao-hung',
                'visibility' => 'friends',
                'location' => 'Hà Nội',
                'photos' => ['/images/photo-running.jpg'],
                'activity' => 'Chạy bộ 5km',
                'tags' => ['Sức khỏe'],
            ],
        ];

        $createdMemories = [];
        foreach ($memoryStories as $story) {
            $mDate = $today->subDays($story['offset'])->toDateString();
            $mem = Memory::create([
                'user_id' => $user1->id,
                'title' => $story['title'],
                'content' => $story['content'],
                'memory_date' => $mDate,
                'mood' => $story['mood'],
                'visibility' => $story['visibility'],
                'location' => $story['location'],
                'created_at' => $today->subDays($story['offset'])->setTime(8, 30),
                'updated_at' => $today->subDays($story['offset'])->setTime(8, 30),
            ]);

            foreach ($story['photos'] as $pos => $pUrl) {
                MemoryPhoto::create([
                    'memory_id' => $mem->id,
                    'path' => $pUrl,
                    'thumbnail_path' => $pUrl,
                    'width' => 1200,
                    'height' => 800,
                    'position' => $pos,
                ]);
            }

            if (isset($userActivities[$user1->id][$story['activity']])) {
                $mem->activities()->attach($userActivities[$user1->id][$story['activity']]->id);
            }

            foreach ($story['tags'] as $tagName) {
                if (isset($userTags[$user1->id][$tagName])) {
                    $mem->tags()->attach($userTags[$user1->id][$tagName]->id);
                }
            }

            $createdMemories[] = $mem;
        }

        // Friend memories with real photos
        $friendStories = [
            ['author' => 'mailinh', 'title' => 'Buổi sáng chụp hình sương sớm', 'content' => 'Những giọt sương đọng trên cánh hoa rực rỡ dưới ánh nắng ban mai.', 'mood' => 'binh-yen', 'photo' => '/images/photo-forest.jpg'],
            ['author' => 'minhtriet', 'title' => 'Vừa hoàn thành giải chạy 10km!', 'content' => 'Thành tích cá nhân mới: 54 phút. Cảm giác vượt qua giới hạn của chính mình thật sướng.', 'mood' => 'hao-hung', 'photo' => '/images/photo-running.jpg'],
            ['author' => 'thuha', 'title' => 'Một tách trà thơm đón gió mùa', 'content' => 'Mùa gió heo may đã về trên từng con phố Hà Nội. Phòng khách bỗng ấm cúng lạ thường.', 'mood' => 'biet-on', 'photo' => '/images/photo-tea.jpg'],
            ['author' => 'hoangnam', 'title' => 'Góc làm việc năng suất ngày cuối tuần', 'content' => 'Tập trung giải quyết các bài toán hóc búa, nhâm nhi cốc cà phê đen đậm vị.', 'mood' => 'vui', 'photo' => '/images/photo-workspace.jpg'],
            ['author' => 'baolong', 'title' => 'Chuyến đạp xe chiều hoàng hôn qua cầu Long Biên', 'content' => 'Cây cầu cổ kính nhuốm màu thời gian dưới ánh chiều tà lấp lánh trên sông Hồng.', 'mood' => 'binh-yen', 'photo' => '/images/photo-sunset.jpg'],
        ];

        foreach ($friendStories as $idx => $fStory) {
            $fUser = $friends[$fStory['author']] ?? null;
            if (! $fUser) {
                continue;
            }

            $fMem = Memory::create([
                'user_id' => $fUser->id,
                'title' => $fStory['title'],
                'content' => $fStory['content'],
                'memory_date' => $today->subDays($idx)->toDateString(),
                'mood' => $fStory['mood'],
                'visibility' => 'public',
                'location' => 'Hà Nội',
                'created_at' => $today->subDays($idx)->setTime(10, 0),
                'updated_at' => $today->subDays($idx)->setTime(10, 0),
            ]);

            MemoryPhoto::create([
                'memory_id' => $fMem->id,
                'path' => $fStory['photo'],
                'thumbnail_path' => $fStory['photo'],
                'position' => 0,
            ]);
        }

        // Favorites
        foreach (array_slice($createdMemories, 0, 4) as $favMem) {
            Favorite::create([
                'user_id' => $user1->id,
                'memory_id' => $favMem->id,
            ]);
        }

        // Reactions & Comments
        $reactionsPool = ['heart', 'like', 'sparkles', 'smile'];
        foreach (array_slice($createdMemories, 0, 6) as $idx => $reactMem) {
            $randomFriend = array_values($friends)[$idx % count($friends)];
            MemoryReaction::create([
                'memory_id' => $reactMem->id,
                'user_id' => $randomFriend->id,
                'reaction' => $reactionsPool[$idx % count($reactionsPool)],
            ]);

            MemoryComment::create([
                'memory_id' => $reactMem->id,
                'user_id' => $randomFriend->id,
                'content' => match ($idx % 4) {
                    0 => 'Bình yên và ấm áp quá Kiên ơi! 🌱',
                    1 => 'Góc ảnh đẹp và thơ mộng thật sự ✨',
                    2 => 'Chúc mừng cậu nhé, tiếp tục phát huy nha! 👏',
                    default => 'Hôm nào cho tớ đi cafe cùng với nhé ☕',
                },
                'created_at' => $reactMem->created_at->addHours(2),
            ]);
        }

        // 5. STREAKS & LOGS
        $streakDefs = [
            [
                'name' => 'Đọc sách 20 phút mỗi ngày',
                'icon' => 'book-open',
                'color' => 'emerald',
                'goal_type' => 'every_day',
                'current_streak' => 18,
                'best_streak' => 25,
                'activity_name' => 'Đọc sách',
                'logged_days' => 18,
            ],
            [
                'name' => 'Chạy bộ sáng sớm',
                'icon' => 'flame',
                'color' => 'amber',
                'goal_type' => 'weekdays',
                'frequency' => ['type' => 'weekdays', 'days' => [1, 2, 3, 4, 5]],
                'current_streak' => 12,
                'best_streak' => 15,
                'activity_name' => 'Chạy bộ 5km',
                'logged_days' => 12,
            ],
            [
                'name' => 'Uống đủ 2L nước',
                'icon' => 'droplets',
                'color' => 'sky',
                'goal_type' => 'every_day',
                'current_streak' => 24,
                'best_streak' => 30,
                'activity_name' => 'Uống đủ 2L nước',
                'logged_days' => 24,
            ],
            [
                'name' => 'Lập trình / Học code',
                'icon' => 'code',
                'color' => 'violet',
                'goal_type' => 'every_day',
                'current_streak' => 35,
                'best_streak' => 35,
                'activity_name' => 'Lập trình / Code',
                'logged_days' => 35,
            ],
            [
                'name' => 'Thiền tĩnh tâm 10 phút',
                'icon' => 'heart',
                'color' => 'rose',
                'goal_type' => 'every_day',
                'current_streak' => 9,
                'best_streak' => 14,
                'activity_name' => 'Thiền tĩnh tâm',
                'logged_days' => 9,
            ],
        ];

        foreach ($streakDefs as $sDef) {
            $act = $userActivities[$user1->id][$sDef['activity_name']] ?? null;
            $st = Streak::create([
                'user_id' => $user1->id,
                'activity_id' => $act?->id,
                'name' => $sDef['name'],
                'icon' => $sDef['icon'],
                'color' => $sDef['color'],
                'goal_type' => $sDef['goal_type'],
                'frequency' => $sDef['frequency'] ?? null,
                'start_date' => $today->subDays($sDef['logged_days'] + 5)->toDateString(),
                'active' => true,
                'current_streak' => $sDef['current_streak'],
                'best_streak' => $sDef['best_streak'],
            ]);

            for ($d = 0; $d < $sDef['logged_days']; $d++) {
                StreakLog::create([
                    'streak_id' => $st->id,
                    'date' => $today->subDays($d)->toDateString(),
                    'completed' => true,
                ]);
            }
        }

        // 6. FRIENDSHIPS
        $acceptedFriends = ['mailinh', 'minhtriet', 'thuha'];
        foreach ($acceptedFriends as $uname) {
            if (isset($friends[$uname])) {
                Friendship::create([
                    'user_id' => $user1->id,
                    'friend_id' => $friends[$uname]->id,
                    'status' => 'accepted',
                ]);
            }
        }

        if ($user5) {
            Friendship::create([
                'user_id' => $user5->id,
                'friend_id' => $user1->id,
                'status' => 'accepted',
            ]);
        }

        if (isset($friends['hoangnam'])) {
            Friendship::create([
                'user_id' => $friends['hoangnam']->id,
                'friend_id' => $user1->id,
                'status' => 'pending',
            ]);
        }

        if (isset($friends['baolong'])) {
            Friendship::create([
                'user_id' => $user1->id,
                'friend_id' => $friends['baolong']->id,
                'status' => 'pending',
            ]);
        }

        // 7. DUO STREAKS
        if (isset($friends['mailinh'])) {
            $duo1 = DuoStreak::create([
                'name' => 'Cùng nhau đọc sách mỗi ngày',
                'created_by' => $user1->id,
                'frequency' => 'daily',
                'start_date' => $today->subDays(15)->toDateString(),
                'current_streak' => 14,
                'best_streak' => 20,
                'status' => 'active',
            ]);

            DuoStreakMember::create(['duo_streak_id' => $duo1->id, 'user_id' => $user1->id, 'role' => 'owner', 'status' => 'accepted']);
            DuoStreakMember::create(['duo_streak_id' => $duo1->id, 'user_id' => $friends['mailinh']->id, 'role' => 'member', 'status' => 'accepted']);

            for ($d = 0; $d < 14; $d++) {
                $lDate = $today->subDays($d)->toDateString();
                DuoStreakLog::create(['duo_streak_id' => $duo1->id, 'user_id' => $user1->id, 'date' => $lDate, 'completed' => true]);
                DuoStreakLog::create(['duo_streak_id' => $duo1->id, 'user_id' => $friends['mailinh']->id, 'date' => $lDate, 'completed' => true]);
            }
        }

        if (isset($friends['minhtriet'])) {
            $duo2 = DuoStreak::create([
                'name' => 'Chạy bộ rèn luyện sức khỏe',
                'created_by' => $friends['minhtriet']->id,
                'frequency' => 'daily',
                'start_date' => $today->subDays(10)->toDateString(),
                'current_streak' => 8,
                'best_streak' => 12,
                'status' => 'active',
            ]);

            DuoStreakMember::create(['duo_streak_id' => $duo2->id, 'user_id' => $friends['minhtriet']->id, 'role' => 'owner', 'status' => 'accepted']);
            DuoStreakMember::create(['duo_streak_id' => $duo2->id, 'user_id' => $user1->id, 'role' => 'member', 'status' => 'accepted']);

            for ($d = 0; $d < 8; $d++) {
                $lDate = $today->subDays($d)->toDateString();
                DuoStreakLog::create(['duo_streak_id' => $duo2->id, 'user_id' => $user1->id, 'date' => $lDate, 'completed' => true]);
                DuoStreakLog::create(['duo_streak_id' => $duo2->id, 'user_id' => $friends['minhtriet']->id, 'date' => $lDate, 'completed' => true]);
            }
        }

        // 8. GROUP CHALLENGES
        $challenge1 = GroupChallenge::create([
            'name' => '21 Ngày Dậy Sớm Lúc 6h Sáng',
            'goal' => 21,
            'duration' => 21,
            'start_date' => $today->subDays(10)->toDateString(),
            'end_date' => $today->addDays(11)->toDateString(),
            'created_by' => $user1->id,
            'status' => 'active',
        ]);

        $challengeMembers = [$user1, $friends['mailinh'] ?? null, $friends['minhtriet'] ?? null, $friends['thuha'] ?? null];
        foreach (array_filter($challengeMembers) as $cm) {
            GroupChallengeMember::create(['group_challenge_id' => $challenge1->id, 'user_id' => $cm->id, 'role' => $cm->id === $user1->id ? 'owner' : 'member', 'status' => 'accepted']);
            for ($d = 0; $d < 8; $d++) {
                GroupChallengeLog::create(['group_challenge_id' => $challenge1->id, 'user_id' => $cm->id, 'date' => $today->subDays($d)->toDateString(), 'completed' => true]);
            }
        }

        if (isset($friends['mailinh'])) {
            $challenge2 = GroupChallenge::create([
                'name' => 'Đọc 5 Cuốn Sách Trong Tháng',
                'goal' => 30,
                'duration' => 30,
                'start_date' => $today->subDays(6)->toDateString(),
                'end_date' => $today->addDays(24)->toDateString(),
                'created_by' => $friends['mailinh']->id,
                'status' => 'active',
            ]);

            foreach (array_filter([$friends['mailinh'], $user1, $friends['thuha'] ?? null]) as $cm) {
                GroupChallengeMember::create(['group_challenge_id' => $challenge2->id, 'user_id' => $cm->id, 'role' => $cm->id === $friends['mailinh']->id ? 'owner' : 'member', 'status' => 'accepted']);
            }
        }

        // 9. SHARED MEMORIES
        $shared1 = SharedMemory::create([
            'title' => 'Chuyến dã ngoại Ba Vì cuối tuần qua',
            'description' => 'Một ngày hòa mình cùng thiên nhiên hùng vĩ, tiếng cười và những bức ảnh kỷ niệm tuyệt đẹp.',
            'memory_date' => $today->subDays(4)->toDateString(),
            'owner_id' => $user1->id,
        ]);

        SharedMemoryParticipant::create(['shared_memory_id' => $shared1->id, 'user_id' => $user1->id, 'role' => 'owner', 'status' => 'accepted', 'joined_at' => $now->subDays(4)]);
        if (isset($friends['mailinh'])) {
            SharedMemoryParticipant::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['mailinh']->id, 'role' => 'participant', 'status' => 'accepted', 'joined_at' => $now->subDays(4)]);
        }
        if (isset($friends['minhtriet'])) {
            SharedMemoryParticipant::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['minhtriet']->id, 'role' => 'participant', 'status' => 'accepted', 'joined_at' => $now->subDays(4)]);
        }

        SharedMemoryPhoto::create([
            'shared_memory_id' => $shared1->id,
            'uploaded_by' => $user1->id,
            'path' => '/images/photo-forest.jpg',
            'thumbnail_path' => '/images/photo-forest.jpg',
            'position' => 0,
        ]);

        SharedMemoryPhoto::create([
            'shared_memory_id' => $shared1->id,
            'uploaded_by' => $friends['mailinh']?->id ?? $user1->id,
            'path' => '/images/photo-sunset.jpg',
            'thumbnail_path' => '/images/photo-sunset.jpg',
            'position' => 1,
        ]);

        SharedMemoryNote::create(['shared_memory_id' => $shared1->id, 'user_id' => $user1->id, 'content' => 'Một chuyến đi không thể nào quên, không khí mát rượi và đồ ăn tự nấu siêu ngon! 🌲']);
        if (isset($friends['mailinh'])) {
            SharedMemoryNote::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['mailinh']->id, 'content' => 'Lần sau nhất định phải đem theo máy ảnh cơ nhé cả nhà 📸']);
            SharedMemoryReaction::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['mailinh']->id, 'reaction' => 'heart']);
        }
        if (isset($friends['minhtriet'])) {
            SharedMemoryNote::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['minhtriet']->id, 'content' => 'Đoạn leo đồi hơi mệt nhưng lên đỉnh ngắm hoàng hôn thì xứng đáng 100%!']);
            SharedMemoryReaction::create(['shared_memory_id' => $shared1->id, 'user_id' => $friends['minhtriet']->id, 'reaction' => 'sparkles']);
        }

        // 10. CHAT CONVERSATIONS & MESSAGES
        if (isset($friends['mailinh'])) {
            $conv1 = Conversation::create(['type' => 'direct']);
            ConversationMember::create(['conversation_id' => $conv1->id, 'user_id' => $user1->id, 'last_read_at' => $now]);
            ConversationMember::create(['conversation_id' => $conv1->id, 'user_id' => $friends['mailinh']->id, 'last_read_at' => $now->subMinutes(5)]);

            $messagesData = [
                ['sender' => $friends['mailinh']->id, 'body' => 'Chào Kiên! Sáng nay cậu đã hoàn thành thói quen đọc sách chưa? 😊', 'minutes' => 60],
                ['sender' => $user1->id, 'body' => 'Chào Linh, tớ vừa đọc xong 2 chương Nhà giả kim rồi nhé!', 'minutes' => 45],
                ['sender' => $friends['mailinh']->id, 'body' => 'Tuyệt quá! Tớ cũng vừa check-in chuỗi đôi của chúng mình rồi đấy.', 'minutes' => 30],
                ['sender' => $user1->id, 'body' => 'Yeah, chuỗi đôi của chúng mình đã lên 14 ngày rồi! Cố gắng giữ nhịp nhé 🌱', 'minutes' => 15],
                ['sender' => $friends['mailinh']->id, 'body' => 'Hôm nay thời tiết đẹp lắm, chiều cậu có rảnh ghé quán cafe sách quen không?', 'minutes' => 5],
            ];

            foreach ($messagesData as $m) {
                Message::create([
                    'conversation_id' => $conv1->id,
                    'sender_id' => $m['sender'],
                    'body' => $m['body'],
                    'created_at' => $now->subMinutes($m['minutes']),
                    'updated_at' => $now->subMinutes($m['minutes']),
                ]);
            }
        }

        if (isset($friends['minhtriet'])) {
            $conv2 = Conversation::create(['type' => 'direct']);
            ConversationMember::create(['conversation_id' => $conv2->id, 'user_id' => $user1->id, 'last_read_at' => $now]);
            ConversationMember::create(['conversation_id' => $conv2->id, 'user_id' => $friends['minhtriet']->id, 'last_read_at' => $now]);

            Message::create(['conversation_id' => $conv2->id, 'sender_id' => $friends['minhtriet']->id, 'body' => 'Kiên ơi, chiều nay 5h chạy bộ công viên Nghĩa Đô nhé? 🏃‍♂️', 'created_at' => $now->subHours(3)]);
            Message::create(['conversation_id' => $conv2->id, 'sender_id' => $user1->id, 'body' => 'Ok luôn Triết ơi, chiều nay chạy tầm 5km nhé!', 'created_at' => $now->subHours(2)]);
            Message::create(['conversation_id' => $conv2->id, 'sender_id' => $friends['minhtriet']->id, 'body' => 'Nhất trí, hẹn cậu ở cổng chính nhé! 👍', 'created_at' => $now->subHours(1)]);
        }

        // 11. NOTIFICATIONS
        $notifs = [
            ['type' => 'reaction', 'actor_id' => $friends['mailinh']->id ?? null, 'data' => ['message' => 'đã thả tim cho khoảnh khắc "Chiều hoàng hôn đỏ rực trên hồ Tây"', 'url' => '/memory'], 'read_at' => null, 'created_at' => $now->subMinutes(25)],
            ['type' => 'comment', 'actor_id' => $friends['minhtriet']->id ?? null, 'data' => ['message' => 'đã bình luận: "Bình yên và ấm áp quá Kiên ơi! 🌱"', 'url' => '/memory'], 'read_at' => null, 'created_at' => $now->subHours(1)],
            ['type' => 'duo_streak', 'actor_id' => $friends['mailinh']->id ?? null, 'data' => ['message' => 'đã hoàn thành check-in chuỗi đôi "Cùng nhau đọc sách"', 'url' => '/together'], 'read_at' => null, 'created_at' => $now->subHours(2)],
            ['type' => 'friend_request', 'actor_id' => $friends['hoangnam']->id ?? null, 'data' => ['message' => 'đã gửi lời mời kết bạn cho bạn.', 'url' => '/together'], 'read_at' => null, 'created_at' => $now->subHours(4)],
            ['type' => 'challenge', 'actor_id' => $friends['mailinh']->id ?? null, 'data' => ['message' => 'đã mời bạn tham gia thử thách "Đọc 5 Cuốn Sách Trong Tháng"', 'url' => '/together'], 'read_at' => $now->subHours(5), 'created_at' => $now->subHours(6)],
            ['type' => 'reminder', 'actor_id' => null, 'data' => ['message' => 'Đừng quên dành 5 phút lưu lại khoảnh khắc của hôm nay nhé 🌱', 'url' => '/today'], 'read_at' => $now->subHours(8), 'created_at' => $now->subHours(9)],
            ['type' => 'friend_accepted', 'actor_id' => $friends['thuha']->id ?? null, 'data' => ['message' => 'đã chấp nhận lời mời kết bạn.', 'url' => '/together'], 'read_at' => $now->subDays(1), 'created_at' => $now->subDays(1)],
            ['type' => 'streak', 'actor_id' => null, 'data' => ['message' => 'Chúc mừng! Bạn đã duy trì chuỗi 18 ngày "Đọc sách" 🔥', 'url' => '/streak'], 'read_at' => $now->subDays(1), 'created_at' => $now->subDays(1)],
        ];

        foreach ($notifs as $n) {
            AppNotification::create([
                'user_id' => $user1->id,
                'type' => $n['type'],
                'actor_id' => $n['actor_id'],
                'data' => $n['data'],
                'read_at' => $n['read_at'],
                'created_at' => $n['created_at'],
            ]);
        }

        // 12. REMINDERS
        $remindersList = [
            ['type' => 'daily_memory', 'title' => 'Nhắc lưu khoảnh khắc trong ngày', 'time' => '20:30:00', 'days_of_week' => [1, 2, 3, 4, 5, 6, 7], 'enabled' => true, 'timezone' => 'Asia/Ho_Chi_Minh'],
            ['type' => 'habit', 'title' => 'Nhắc đọc sách buổi tối', 'time' => '21:30:00', 'days_of_week' => [1, 2, 3, 4, 5, 6, 7], 'enabled' => true, 'timezone' => 'Asia/Ho_Chi_Minh'],
            ['type' => 'weekly_recap', 'title' => 'Nhìn lại tuần qua cùng Kimo', 'time' => '09:00:00', 'days_of_week' => [7], 'enabled' => true, 'timezone' => 'Asia/Ho_Chi_Minh'],
        ];

        foreach ($remindersList as $rem) {
            Reminder::create([
                'user_id' => $user1->id,
                'type' => $rem['type'],
                'title' => $rem['title'],
                'time' => $rem['time'],
                'days_of_week' => $rem['days_of_week'],
                'enabled' => $rem['enabled'],
                'timezone' => $rem['timezone'],
            ]);
        }

        // 13. DAILY QUESTS & ACHIEVEMENTS
        $questsToday = ['save_memory', 'complete_habit', 'check_in_friend'];
        foreach ($questsToday as $qk) {
            DailyQuestCompletion::create([
                'user_id' => $user1->id,
                'quest_key' => $qk,
                'quest_date' => $today->toDateString(),
                'completed_at' => $now,
            ]);
        }

        foreach (['save_memory', 'complete_habit', 'write_note', 'check_in_friend'] as $qk) {
            DailyQuestCompletion::create([
                'user_id' => $user1->id,
                'quest_key' => $qk,
                'quest_date' => $today->subDays(1)->toDateString(),
                'completed_at' => $now->subDays(1),
            ]);
        }

        $achievementsToUnlock = ['first_memory', 'memories_10', 'streak_7', 'first_shared_memory', 'first_duo_streak'];
        foreach ($achievementsToUnlock as $ak) {
            UserAchievement::create([
                'user_id' => $user1->id,
                'achievement_key' => $ak,
                'unlocked_at' => $now->subDays(7),
            ]);
        }

        echo "Comprehensive data with real valid photos seeded successfully!" . PHP_EOL;
    }
}

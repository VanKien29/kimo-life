import { MemoryComposer } from '@/components/memory/memory-composer';
import { MobileBottomNav, type MobileNavTab } from '@/components/navigation/MobileBottomNav';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function BottomNavigation() {
    const page = usePage();
    const [composerOpen, setComposerOpen] = useState(false);
    const currentPath = page.url.split('?')[0];
    const isMemoryPage = currentPath === '/memory' || currentPath.startsWith('/memory/');

    const getActiveTab = (): MobileNavTab => {
        if (currentPath === '/today' || currentPath.startsWith('/today/')) return 'home';
        if (currentPath === '/calendar' || currentPath.startsWith('/calendar/')) return 'calendar';
        if (currentPath === '/streak' || currentPath.startsWith('/streak/')) return 'streak';
        if (currentPath === '/together' || currentPath.startsWith('/together/')) return 'together';
        return 'home';
    };

    const handleTabChange = (tab: MobileNavTab) => {
        switch (tab) {
            case 'home':
                router.visit('/today');
                break;
            case 'calendar':
                router.visit('/calendar');
                break;
            case 'streak':
                router.visit('/streak');
                break;
            case 'together':
                router.visit('/together');
                break;
        }
    };

    const handlePlusClick = () => {
        if (isMemoryPage) {
            router.visit('/memory?compose=1');
        } else {
            setComposerOpen(true);
        }
    };

    return (
        <>
            <MobileBottomNav
                activeTab={getActiveTab()}
                onTabChange={handleTabChange}
                onAddPress={handlePlusClick}
            />

            {!isMemoryPage && (
                <MemoryComposer open={composerOpen} onOpenChange={setComposerOpen} />
            )}
        </>
    );
}

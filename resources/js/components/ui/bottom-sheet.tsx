import {
    Sheet as BottomSheet,
    SheetClose as BottomSheetClose,
    SheetContent,
    SheetDescription as BottomSheetDescription,
    SheetFooter as BottomSheetFooter,
    SheetHeader as BottomSheetHeader,
    SheetTitle as BottomSheetTitle,
    SheetTrigger as BottomSheetTrigger,
} from '@/components/ui/sheet';
import * as React from 'react';

export { BottomSheet, BottomSheetClose, BottomSheetDescription, BottomSheetFooter, BottomSheetHeader, BottomSheetTitle, BottomSheetTrigger };

export function BottomSheetContent({ className, ...props }: React.ComponentProps<typeof SheetContent>) {
    return <SheetContent side="bottom" className={className} {...props} />;
}

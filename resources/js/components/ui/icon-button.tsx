import { Button, type ButtonProps } from '@/components/ui/button';

interface IconButtonProps extends Omit<ButtonProps, 'size' | 'aria-label'> {
    'aria-label': string;
}

export function IconButton({ children, ...props }: IconButtonProps) {
    return (
        <Button size="icon" {...props}>
            {children}
        </Button>
    );
}

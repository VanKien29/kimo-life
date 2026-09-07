import { Logo } from '@/components/shared/logo';
import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <Logo variant="mark" className={props.className} />;
}

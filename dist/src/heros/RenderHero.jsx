import React from 'react';
import { HighImpactHero } from '@/heros/HighImpact';
import { LowImpactHero } from '@/heros/LowImpact';
import { MediumImpactHero } from '@/heros/MediumImpact';
const heroes = {
    highImpact: HighImpactHero,
    lowImpact: LowImpactHero,
    mediumImpact: MediumImpactHero,
};
export const RenderHero = (props) => {
    const { type } = props || {};
    if (!type || type === 'none')
        return null;
    const HeroToRender = heroes[type];
    if (!HeroToRender)
        return null;
    return <HeroToRender {...props}/>;
};
//# sourceMappingURL=RenderHero.jsx.map
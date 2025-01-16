import React from 'react';
import RichText from '@/components/RichText';
export const LowImpactHero = ({ children, richText }) => {
    return (<div className="container mt-16">
      <div className="max-w-[48rem]">
        {children || (richText && <RichText content={richText} enableGutter={false}/>)}
      </div>
    </div>);
};
//# sourceMappingURL=index.jsx.map
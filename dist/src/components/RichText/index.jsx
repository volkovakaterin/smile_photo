import { cn } from '@/utilities/cn';
import React from 'react';
import { serializeLexical } from './serialize';
const RichText = ({ className, content, enableGutter = true, enableProse = true, }) => {
    if (!content) {
        return null;
    }
    return (<div className={cn({
            'container ': enableGutter,
            'max-w-none': !enableGutter,
            'mx-auto prose dark:prose-invert ': enableProse,
        }, className)}>
      {content &&
            !Array.isArray(content) &&
            typeof content === 'object' &&
            'root' in content &&
            serializeLexical({ nodes: content?.root?.children })}
    </div>);
};
export default RichText;
//# sourceMappingURL=index.jsx.map
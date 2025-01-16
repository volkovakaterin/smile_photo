import React from 'react';
import { Code } from './Component.client';
export const CodeBlock = ({ className, code, language }) => {
    return (<div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <Code code={code} language={language}/>
    </div>);
};
//# sourceMappingURL=Component.jsx.map
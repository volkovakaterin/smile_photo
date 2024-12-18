import * as React from 'react';
export const Width = ({ children, className, width }) => {
    return (<div className={className} style={{ maxWidth: width ? `${width}%` : undefined }}>
      {children}
    </div>);
};
//# sourceMappingURL=index.jsx.map
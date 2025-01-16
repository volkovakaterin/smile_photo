import React, { Fragment } from 'react';
import { ImageMedia } from './ImageMedia';
import { VideoMedia } from './VideoMedia';
export const Media = (props) => {
    const { className, htmlElement = 'div', resource } = props;
    const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video');
    const Tag = htmlElement || Fragment;
    return (<Tag {...(htmlElement !== null
        ? {
            className,
        }
        : {})}>
      {isVideo ? <VideoMedia {...props}/> : <ImageMedia {...props}/>}
    </Tag>);
};
//# sourceMappingURL=index.jsx.map
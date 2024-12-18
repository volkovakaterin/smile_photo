'use client';
import { cn } from 'src/utilities/cn';
import React, { useEffect, useRef } from 'react';
import { getClientSideURL } from '@/utilities/getURL';
export const VideoMedia = (props) => {
    const { onClick, resource, videoClassName } = props;
    const videoRef = useRef(null);
    // const [showFallback] = useState<boolean>()
    useEffect(() => {
        const { current: video } = videoRef;
        if (video) {
            video.addEventListener('suspend', () => {
                // setShowFallback(true);
                // console.warn('Video was suspended, rendering fallback image.')
            });
        }
    }, []);
    if (resource && typeof resource === 'object') {
        const { filename } = resource;
        return (<video autoPlay className={cn(videoClassName)} controls={false} loop muted onClick={onClick} playsInline ref={videoRef}>
        <source src={`${getClientSideURL()}/media/${filename}`}/>
      </video>);
    }
    return null;
};
//# sourceMappingURL=index.jsx.map
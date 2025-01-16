import { cn } from 'src/utilities/cn';
import React from 'react';
import RichText from '@/components/RichText';
import { Media } from '../../components/Media';
export const MediaBlock = (props) => {
    const { captionClassName, className, enableGutter = true, imgClassName, media, staticImage, disableInnerContainer, } = props;
    let caption;
    if (media && typeof media === 'object')
        caption = media.caption;
    return (<div className={cn('', {
            container: enableGutter,
        }, className)}>
      <Media imgClassName={cn('border border-border rounded-[0.8rem]', imgClassName)} resource={media} src={staticImage}/>
      {caption && (<div className={cn('mt-6', {
                container: !disableInnerContainer,
            }, captionClassName)}>
          <RichText content={caption} enableGutter={false}/>
        </div>)}
    </div>);
};
//# sourceMappingURL=Component.jsx.map
import React from 'react';
import { CMSLink } from '@/components/Link';
import { Media } from '@/components/Media';
import RichText from '@/components/RichText';
export const MediumImpactHero = ({ links, media, richText }) => {
    return (<div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" content={richText} enableGutter={false}/>}

        {Array.isArray(links) && links.length > 0 && (<ul className="flex gap-4">
            {links.map(({ link }, i) => {
                return (<li key={i}>
                  <CMSLink {...link}/>
                </li>);
            })}
          </ul>)}
      </div>
      <div className="container ">
        {media && typeof media === 'object' && (<div>
            <Media className="-mx-4 md:-mx-8 2xl:-mx-16" imgClassName="" priority resource={media}/>
            {media?.caption && (<div className="mt-3">
                <RichText content={media.caption} enableGutter={false}/>
              </div>)}
          </div>)}
      </div>
    </div>);
};
//# sourceMappingURL=index.jsx.map
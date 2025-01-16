'use client';
import { memo } from 'react';
import styles from './BreadCrumbs.module.scss';
export const Breadcrumbs = memo(({ breadcrumbs, onClick }) => {
    return (<div className={`${styles.Breadcrumbs} ${breadcrumbs.length > 1 ? styles.visible : false}`}>
                {breadcrumbs.map((folder, index) => (<span key={`${folder.name}-${index}`} onClick={() => onClick(folder, index)}>
                        {index > 0 ? ' / ' : false}
                        {folder.name}
                    </span>))}
            </div>);
});
//# sourceMappingURL=BreadCrumbs.jsx.map
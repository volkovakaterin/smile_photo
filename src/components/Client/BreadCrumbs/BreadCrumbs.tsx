'use client';

import { FC, ReactNode, memo } from 'react';
import cn from 'classnames';
import styles from './BreadCrumbs.module.scss';
import Arrow from '../../../../assets/icons/Arrow_icon.svg';
import Image from 'next/image';

export interface Folder {
    name: string;
    path: string;
}

interface BreadcrumbsProps {
    onClick: (breadcrumb: Folder, index: number) => void;
    breadcrumbs: Folder[];
}
export const Breadcrumbs: FC<BreadcrumbsProps> = memo(
    ({ breadcrumbs, onClick }) => {
        return (
            <div className={`${styles.Breadcrumbs} ${breadcrumbs.length > 1 ? styles.visible : false}`}>
                {breadcrumbs.map((folder, index) => (
                    <span key={`${folder.name}-${index}`} onClick={() => onClick(folder, index)} >
                        {index > 0 ? ' / ' : false}
                        {folder.name}
                    </span>
                ))}
            </div>
        );
    }
);
'use client';

import { FC, memo } from 'react';
import styles from './Folder.module.scss';
import FolderIcon from '../../../assets/icons/folder.svg';
import Image from 'next/image';


interface FolderProps {
    order?: string;
    name: string;
    onClick: () => void;
}

export const Folder: FC<FolderProps> = memo(
    ({ order, name, onClick }) => {
        return (
            <div className={styles.Folder} onClick={onClick} >
                <Image src={FolderIcon} alt={'arrow'} width={78} height={60} />
                <span className={styles.nameFolder}>{name}</span>
            </div>
        );
    }
);
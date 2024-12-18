'use client';

import { ReactNode, memo, useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloseIcon from '../../../assets/icons/close.svg';
import cn from 'classnames';
import styles from './TheModal.module.scss';
import Image from 'next/image';

interface TheModalProps {
    name?: string;
    className?: string;
    open: boolean;
    handleClose?: () => void;
    children: ReactNode;
    width?: number;
}

export const TheModal = memo(({ name, className, open, handleClose, children, width }: TheModalProps) => {
    if (!open) return null;
    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={open}>
                <Box className={cn(styles.modal, className)} style={{ width: `${width}px` }}>
                    <div className={styles.wrapper} >
                        <div className={styles.wrapperBox}>
                            <div className={styles.wrapperClose} onClick={handleClose}>
                                <Image src={CloseIcon} alt={'close'} width={20} height={20} />
                            </div>
                        </div>
                        {children}
                    </div>
                </Box>
            </Fade>
        </Modal>
    );
});


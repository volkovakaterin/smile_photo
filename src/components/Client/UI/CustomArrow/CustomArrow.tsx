import { FC, ReactNode } from 'react';


interface CustomArrowProps {
    onClick?: () => void;
    children: ReactNode;
    isHovered?: boolean;
}

export const CustomArrow: FC<CustomArrowProps> = ({ onClick, children }) => <div onClick={onClick}>{children}</div>;



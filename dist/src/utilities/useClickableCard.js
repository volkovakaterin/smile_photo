'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
function useClickableCard({ external = false, newTab = false, scroll = true, }) {
    const router = useRouter();
    const card = useRef(null);
    const link = useRef(null);
    const timeDown = useRef(0);
    const hasActiveParent = useRef(false);
    const pressedButton = useRef(0);
    const handleMouseDown = useCallback((e) => {
        if (e.target) {
            const target = e.target;
            const timeNow = +new Date();
            const parent = target?.closest('a');
            pressedButton.current = e.button;
            if (!parent) {
                hasActiveParent.current = false;
                timeDown.current = timeNow;
            }
            else {
                hasActiveParent.current = true;
            }
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, card, link, timeDown]);
    const handleMouseUp = useCallback((e) => {
        if (link.current?.href) {
            const timeNow = +new Date();
            const difference = timeNow - timeDown.current;
            if (link.current?.href && difference <= 250) {
                if (!hasActiveParent.current && pressedButton.current === 0 && !e.ctrlKey) {
                    if (external) {
                        const target = newTab ? '_blank' : '_self';
                        window.open(link.current.href, target);
                    }
                    else {
                        router.push(link.current.href, { scroll });
                    }
                }
            }
        }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, card, link, timeDown]);
    useEffect(() => {
        const cardNode = card.current;
        if (cardNode) {
            cardNode.addEventListener('mousedown', handleMouseDown);
            cardNode.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            if (cardNode) {
                if (cardNode) {
                    cardNode?.removeEventListener('mousedown', handleMouseDown);
                    cardNode?.removeEventListener('mouseup', handleMouseUp);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [card, link, router]);
    return {
        card: {
            ref: card,
        },
        link: {
            ref: link,
        },
    };
}
export default useClickableCard;
//# sourceMappingURL=useClickableCard.js.map
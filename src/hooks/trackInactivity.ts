import { useEffect, useRef, useState } from "react";

const DEFAULT_EVENTS: (keyof DocumentEventMap | keyof WindowEventMap)[] = [
    "keypress",
    "mousemove",
    "touchmove",
    "click",
    "scroll",
];
const DEFAULT_OPTIONS = {
    timeout: 15000,
    events: DEFAULT_EVENTS,
    initialState: true,
};

export default function useIdle(
    options?: Partial<{
        timeout: number;
        events: (keyof DocumentEventMap | keyof WindowEventMap)[];
        initialState: boolean;
        action?: () => void;
    }>
): boolean {
    const { action, events, initialState, timeout } = {
        ...DEFAULT_OPTIONS,
        ...options,
    };
    const [idle, setIdle] = useState<boolean>(initialState);

    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        const handleEvents = () => {
            setIdle(false);

            if (timer.current) {
                window.clearTimeout(timer.current);
            }

            timer.current = window.setTimeout(() => {
                setIdle(true);
                if (action) action();
            }, timeout);
        };

        timer.current = window.setTimeout(() => {
            setIdle(true);
            if (action) action();
        }, timeout);

        events.forEach((event) => {
            if (event === "scroll") {
                window.addEventListener("scroll", handleEvents, true);
            } else {
                document.addEventListener(event, handleEvents);
            }
        });

        return () => {
            events.forEach((event) => {
                if (event === "scroll") {
                    window.removeEventListener("scroll", handleEvents, true);
                } else {
                    document.removeEventListener(event, handleEvents);
                }
            });
            window.clearTimeout(timer.current);
        };
    }, [action, timeout, events]);

    return idle;
}
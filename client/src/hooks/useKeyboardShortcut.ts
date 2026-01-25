import { useEffect } from 'react';

export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    options?: { ctrl?: boolean; alt?: boolean; shift?: boolean }
) {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (
                event.key.toLowerCase() === key.toLowerCase() &&
                (!options?.ctrl || event.ctrlKey || event.metaKey) &&
                (!options?.alt || event.altKey) &&
                (!options?.shift || event.shiftKey)
            ) {
                event.preventDefault();
                callback();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, callback, options]);
}

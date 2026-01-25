import { useState, useEffect, useCallback } from 'react';

export function useIntersectionObserver(
    options?: IntersectionObserverInit
): [React.RefCallback<Element>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [element, setElement] = useState<Element | null>(null);

    useEffect(() => {
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);
        return () => observer.disconnect();
    }, [element, options]);

    const ref = useCallback((el: Element | null) => {
        setElement(el);
    }, []);

    return [ref, isIntersecting];
}

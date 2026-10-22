import {useCallback, useEffect, useRef, useState} from 'react';

export function useConfirmation() {
    const [options, setOptions] = useState(null);
    const pending = useRef(null);
    const settle = useCallback(accepted => {
        const resolve = pending.current;
        pending.current = null;
        setOptions(null);
        resolve?.(accepted);
    }, []);
    const confirm = useCallback(options => {
        if (pending.current) return Promise.resolve(false);
        return new Promise(resolve => {
            pending.current = resolve;
            setOptions(options);
        });
    }, []);
    useEffect(() => () => {
        pending.current?.(false);
        pending.current = null;
    }, []);
    return {
        confirm,
        confirmation: {
            ...options,
            isOpen: Boolean(options),
            onConfirm: () => settle(true),
            onCancel: () => settle(false),
        },
    };
}

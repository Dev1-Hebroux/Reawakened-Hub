import { useState, useEffect, useCallback } from 'react';
import { offlineService, type OfflineSyncStatus } from '../services/offlineService';

export function useOfflineStatus(): OfflineSyncStatus {
    const [status, setStatus] = useState<OfflineSyncStatus>(() => offlineService.getStatus());

    useEffect(() => {
        return offlineService.subscribe(setStatus);
    }, []);

    return status;
}

export function useIsOnline(): boolean {
    const status = useOfflineStatus();
    return status.isOnline;
}

export function useOfflineQueue() {
    const [queueLength, setQueueLength] = useState(0);

    useEffect(() => {
        const updateQueue = async () => {
            const queue = await offlineService.getSyncQueue();
            setQueueLength(queue.length);
        };

        updateQueue();

        return offlineService.subscribe(() => {
            updateQueue();
        });
    }, []);

    const triggerSync = useCallback(async () => {
        await offlineService.sync();
    }, []);

    return { queueLength, triggerSync };
}

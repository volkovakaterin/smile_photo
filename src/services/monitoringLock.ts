type Scope = 'all' | 'today';

let locked = false;
let lockedBy: { scope: Scope; startedAt: number } | null = null;

export function tryAcquireMonitoringLock(scope: Scope) {
    if (locked) return { ok: false as const, lockedBy };

    locked = true;
    lockedBy = { scope, startedAt: Date.now() };
    return { ok: true as const };
}

export function releaseMonitoringLock() {
    locked = false;
    lockedBy = null;
}

export function getMonitoringLockState() {
    return { locked, lockedBy };
}

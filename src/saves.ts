import { freshProgress, readProgress, type Progress } from './mission.js';

export const slotIds = [1, 2, 3, 4, 5] as const;
export type SlotId = (typeof slotIds)[number];
export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type Profile = Readonly<{ label: string }>;
export type Save = Readonly<{ version: 1; id: string; revision: number; profile: Profile; progress: Progress }>;
export type Slot = { id: SlotId; state: 'empty' | 'invalid' | 'unavailable' } |
    { id: SlotId; state: 'ready'; save: Save };
export type Snapshot = Readonly<{ id: SlotId; save: Save }>;
type Outcome = { ok: true; snapshot: Snapshot } | { ok: false; reason: 'changed' | 'unavailable' | 'invalid' };
export const storagePrefix = 'ck-technical-showcase.v1.';
export const slotKey = (id: SlotId) => storagePrefix + 'slot.' + id;
export const activeKey = storagePrefix + 'active';

export function readProfile(input: unknown): Profile | undefined {
    if (!input || typeof input !== 'object' || !('label' in input) || typeof input.label !== 'string') return;
    const label = input.label.trim();
    if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N} -]{0,23}$/u.test(label)) return;
    return { label };
}

export function decodeSave(raw: string): Save | undefined {
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return; }
    if (!parsed || typeof parsed !== 'object') return;
    const value = parsed as Partial<Save>;
    if (value.version !== 1 || typeof value.id !== 'string' || !value.id ||
        typeof value.revision !== 'number' || !Number.isSafeInteger(value.revision) ||
        value.revision < 0) return;
    const profile = readProfile(value.profile);
    const progress = readProgress(value.progress);
    if (!profile || !progress) return;
    return { version: 1, id: value.id, revision: value.revision, profile, progress };
}

export class SlotStore {
    constructor(private storage: () => StoragePort, private createId = () => globalThis.crypto.randomUUID()) {}

    read(id: SlotId): Slot {
        try {
            const raw = this.storage().getItem(slotKey(id));
            if (raw === null) return { id, state: 'empty' };
            const save = decodeSave(raw);
            return save ? { id, state: 'ready', save } : { id, state: 'invalid' };
        } catch { return { id, state: 'unavailable' }; }
    }

    list(): Slot[] { return slotIds.map(id => this.read(id)); }

    selected(): SlotId {
        try {
            const selected = this.storage().getItem(activeKey);
            return slotIds.find(id => String(id) === selected) ?? 1;
        } catch { return 1; }
    }

    select(id: SlotId): boolean {
        try { this.storage().setItem(activeKey, String(id)); return true; } catch { return false; }
    }

    create(id: SlotId, profile: unknown, expected?: Save): Outcome {
        const safe = readProfile(profile);
        if (!safe) return { ok: false, reason: 'invalid' };
        const current = this.read(id);
        if (current.state === 'unavailable') return { ok: false, reason: 'unavailable' };
        if (expected ? !this.matches(current, expected) : current.state !== 'empty') {
            return { ok: false, reason: 'changed' };
        }
        try {
            return this.write(id, { version: 1, id: this.createId(), revision: 0, profile: safe, progress: freshProgress() });
        } catch { return { ok: false, reason: 'unavailable' }; }
    }

    update(snapshot: Snapshot, progress: Progress): Outcome {
        const current = this.read(snapshot.id);
        if (current.state === 'unavailable') return { ok: false, reason: 'unavailable' };
        if (!this.matches(current, snapshot.save)) return { ok: false, reason: 'changed' };
        const safe = readProgress(progress);
        if (!safe || current.save.revision === Number.MAX_SAFE_INTEGER || (current.save.progress.complete && !safe.complete)) return { ok: false, reason: 'invalid' };
        return this.write(snapshot.id, { ...current.save, revision: current.save.revision + 1, progress: safe });
    }

    remove(snapshot: Snapshot): 'removed' | 'changed' | 'unavailable' {
        const current = this.read(snapshot.id);
        if (current.state === 'unavailable') return 'unavailable';
        if (!this.matches(current, snapshot.save)) return 'changed';
        try {
            const storage = this.storage();
            storage.removeItem(slotKey(snapshot.id));
            return storage.getItem(slotKey(snapshot.id)) === null ? 'removed' : 'unavailable';
        } catch { return 'unavailable'; }
    }

    private matches(slot: Slot, expected: Save): slot is Extract<Slot, { state: 'ready' }> {
        return slot.state === 'ready' && slot.save.id === expected.id && slot.save.revision === expected.revision;
    }

    private write(id: SlotId, save: Save): Outcome {
        try {
            const storage = this.storage();
            const raw = JSON.stringify(save);
            storage.setItem(slotKey(id), raw);
            return storage.getItem(slotKey(id)) === raw ? { ok: true, snapshot: { id, save } } :
                { ok: false, reason: 'changed' };
        } catch { return { ok: false, reason: 'unavailable' }; }
    }
}

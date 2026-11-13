export const records = ['schedule', 'poster', 'contact'] as const;
export type RecordId = (typeof records)[number];
export const categories = ['publish', 'verify', 'private'] as const;
export type Category = (typeof categories)[number];
export type Assignments = Partial<Record<RecordId, Category>>;
export type Progress = Readonly<{ assignments: Readonly<Assignments>; complete: boolean }>;
const answer: Record<RecordId, Category> = {
    schedule: 'publish', poster: 'verify', contact: 'private'
};

export function readProgress(input: unknown): Progress | undefined {
    if (!input || typeof input !== 'object' || !('assignments' in input) || !('complete' in input)) return;
    if (typeof input.complete !== 'boolean' || !input.assignments || typeof input.assignments !== 'object' ||
        Array.isArray(input.assignments)) return;
    const assignments: Assignments = {};
    for (const [record, category] of Object.entries(input.assignments)) {
        if (!isRecord(record) || !isCategory(category)) return;
        assignments[record] = category;
    }
    if (input.complete && checkAssignments(assignments) !== 'correct') return;
    return { assignments, complete: input.complete };
}

export function isRecord(value: unknown): value is RecordId {
    return records.some(record => record === value);
}
export function isCategory(value: unknown): value is Category {
    return categories.some(category => category === value);
}
export const freshProgress = (): Progress => ({ assignments: {}, complete: false });

export function assign(progress: Progress, record: RecordId, category: Category | null): Progress {
    if (progress.complete || !isRecord(record) || (category !== null && !isCategory(category))) return progress;
    const assignments = { ...progress.assignments };
    if (category === null) delete assignments[record];
    else assignments[record] = category;
    return { assignments, complete: false };
}

export function checkAssignments(assignments: Readonly<Assignments>): 'missing' | 'review' | 'correct' {
    if (records.some(record => !assignments[record])) return 'missing';
    return records.every(record => assignments[record] === answer[record]) ? 'correct' : 'review';
}

export function submit(progress: Progress): Progress {
    return checkAssignments(progress.assignments) === 'correct' ? { ...progress, complete: true } : progress;
}

export function objective(progress: Progress): 'sort' | 'check' | 'done' {
    return progress.complete ? 'done' : records.every(record => progress.assignments[record]) ? 'check' : 'sort';
}

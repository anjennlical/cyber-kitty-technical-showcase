import { copy, localeKey, readLocale, type Message } from './locales.js';
import { assign, categories, checkAssignments, isRecord, objective, records, submit, type Category, type Progress, type RecordId } from './mission.js';
import { activeKey, readProfile, SlotStore, storagePrefix, type SlotId, type Snapshot } from './saves.js';

function element<T extends HTMLElement>(id: string): T {
    const item = document.getElementById(id);
    if (!item) throw new Error('Missing element: ' + id);
    return item as T;
}

const store = new SlotStore(() => window.localStorage);
const work = element('work');
const slots = element('slots');
const localeSelect = element<HTMLSelectElement>('locale');
const dialog = element<HTMLDialogElement>('confirmation');
const form = element<HTMLFormElement>('confirmation-form');
const input = element<HTMLInputElement>('profile-input');
const nameField = element('name-field');
const error = element('dialog-error');
const confirm = element<HTMLButtonElement>('confirm');
const cancel = element<HTMLButtonElement>('cancel');
const template = element<HTMLTemplateElement>('record-template');
const dragFormat = 'application/x-ck-showcase-record';

let locale = readLocale(loadLocale());
let current = store.selected();
let selected: RecordId | null = null;
let feedback: Message | null = null;
let dragged: RecordId | null = null;
type Intent = { kind: 'create'; id: SlotId } | { kind: 'replace' | 'remove'; snapshot: Snapshot };
let pending: Intent | null = null;
let returnFocus = '';

function loadLocale() {
    try { return window.localStorage.getItem(localeKey); } catch { return null; }
}
const text = (message: Message) => copy[locale][message];

function node<K extends keyof HTMLElementTagNameMap>(tag: K, parent: Element, content?: string, className?: string) {
    const item = document.createElement(tag);
    if (content !== undefined) item.textContent = content;
    if (className) item.className = className;
    parent.append(item);
    return item;
}
function action(parent: Element, id: string, message: Message, run: () => void, className = 'primary') {
    const item = node('button', parent, text(message), className);
    item.type = 'button';
    item.id = id;
    item.addEventListener('click', run);
    return item;
}
function renderCopy() {
    document.documentElement.lang = locale;
    document.title = text('page');
    work.setAttribute('aria-label', text('workspace'));
    localeSelect.value = locale;
    localeSelect.setAttribute('aria-label', text('select'));
    input.placeholder = text('example');
    document.querySelectorAll<HTMLElement>('[data-copy]').forEach(item => {
        const key = item.dataset.copy as Message;
        item.textContent = text(key);
    });
}
function focus(id: string) { document.getElementById(id)?.focus(); }

function render(focusId?: string) {
    slots.replaceChildren();
    for (const slot of store.list()) {
        const button = node('button', slots, undefined, 'slot');
        button.id = 'slot-' + slot.id;
        button.type = 'button';
        button.setAttribute('aria-current', String(current === slot.id));
        node('strong', button, text('slot') + ' ' + slot.id);
        node('small', button, slot.state === 'ready' ? slot.save.profile.label :
            text(slot.state === 'empty' ? 'empty' : slot.state === 'invalid' ? 'invalid' : 'slotUnavailable'));
        button.addEventListener('click', () => {
            current = slot.id;
            feedback = store.select(current) ? null : 'unavailable';
            selected = null;
            render(button.id);
        });
    }
    const slot = store.read(current);
    work.replaceChildren();
    if (slot.state !== 'ready') {
        node('h2', work, text('slot') + ' ' + current);
        const empty = node('div', work, undefined, 'empty-view');
        node('p', empty, text(slot.state === 'empty' ? 'createFirst' : slot.state === 'invalid' ? 'invalidHint' : 'unavailable'));
        if (slot.state === 'empty') action(empty, 'create', 'create', () => openDialog({ kind: 'create', id: current }, 'create'));
        if (feedback) announce(empty, feedback);
    } else {
        const snapshot: Snapshot = { id: slot.id, save: slot.save };
        const heading = node('div', work, undefined, 'work-header');
        const profile = node('div', heading);
        node('h2', profile, slot.save.profile.label);
        node('p', profile, text('active') + ' · ' + slot.id, 'quiet');
        const actions = node('div', heading, undefined, 'actions');
        action(actions, 'replace', 'replace', () => openDialog({ kind: 'replace', snapshot }, 'replace'), 'secondary');
        action(actions, 'remove', 'remove', () => openDialog({ kind: 'remove', snapshot }, 'remove'), 'secondary danger');
        renderBoard(snapshot);
    }
    if (focusId) focus(focusId);
}

function announce(parent: Element, message: Message | null) {
    const status = node('p', parent, message ? text(message) : '', 'status');
    status.id = 'status';
    status.setAttribute('role', 'status');
    return status;
}
function say(message: Message | null) {
    feedback = message;
    const status = document.getElementById('status');
    if (status) status.textContent = message ? text(message) : '';
}

function saveProgress(snapshot: Snapshot, progress: Progress, message: Message, focusId: string) {
    const result = store.update(snapshot, progress);
    feedback = result.ok ? message : result.reason === 'invalid' ? 'review' : result.reason;
    render(focusId);
}
function place(snapshot: Snapshot, record: RecordId, category: Category, focusId: string) {
    selected = null;
    saveProgress(snapshot, assign(snapshot.save.progress, record, category), 'saved', focusId);
}

const symbols: Record<RecordId, string> = { schedule: '≡', poster: '◇', contact: '↳' };
function card(parent: Element, id: RecordId, locked: boolean) {
    const button = template.content.firstElementChild!.cloneNode(true) as HTMLButtonElement;
    button.id = 'card-' + id;
    button.dataset.record = id;
    button.querySelector('strong')!.textContent = text(id);
    button.querySelector('small')!.textContent = text(`${id}Note`);
    button.querySelector('.file-icon')!.textContent = symbols[id];
    button.disabled = locked;
    button.draggable = !locked;
    button.setAttribute('aria-pressed', String(selected === id));
    button.addEventListener('click', () => {
        selected = selected === id ? null : id;
        work.querySelectorAll<HTMLButtonElement>('.record').forEach(item =>
            item.setAttribute('aria-pressed', String(item.dataset.record === selected)));
        say(selected ? 'selected' : null);
    });
    button.addEventListener('dragstart', event => {
        if (!event.dataTransfer || locked) return;
        dragged = id;
        event.dataTransfer.setData(dragFormat, id);
        event.dataTransfer.effectAllowed = 'move';
    });
    button.addEventListener('dragend', clearDrag);
    parent.append(button);
}
function clearDrag() {
    dragged = null;
    work.querySelectorAll('.bin[data-hover]').forEach(item => item.removeAttribute('data-hover'));
}

function renderBoard(snapshot: Snapshot) {
    const progress = snapshot.save.progress;
    const target = node('div', work, undefined, 'objective');
    node('span', target, text('objective'));
    node('strong', target, text(objective(progress))).id = 'objective';

    node('h3', work, text('bank'), 'board-title');
    node('p', work, text('how'), 'quiet');
    const bank = node('div', work, undefined, 'bank');
    for (const record of records) if (!progress.assignments[record]) card(bank, record, progress.complete);

    node('h3', work, text('board'), 'board-title');
    const bins = node('div', work, undefined, 'bins');
    for (const category of categories) {
        const bin = node('section', bins, undefined, 'bin');
        bin.dataset.category = category;
        const target = action(bin, 'bin-' + category, category, () => {
            if (selected) place(snapshot, selected, category, target.id);
        }, 'bin-target');
        target.replaceChildren();
        node('strong', target, text(category));
        node('small', target, text(`${category}Note`));
        bin.setAttribute('aria-labelledby', target.id);
        target.disabled = progress.complete;
        const assigned = records.filter(record => progress.assignments[record] === category);
        if (!assigned.length) node('p', bin, text('unassigned'), 'quiet bin-empty');
        for (const record of assigned) card(bin, record, progress.complete);
        bin.addEventListener('dragover', event => {
            if (progress.complete || !dragged || !event.dataTransfer?.types.includes(dragFormat)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            bin.dataset.hover = 'true';
        });
        bin.addEventListener('dragleave', event => {
            if (!(event.relatedTarget instanceof Node) || !bin.contains(event.relatedTarget)) delete bin.dataset.hover;
        });
        bin.addEventListener('drop', event => {
            event.preventDefault();
            const id = event.dataTransfer?.getData(dragFormat);
            if (!progress.complete && isRecord(id) && id === dragged) place(snapshot, id, category, target.id);
            clearDrag();
        });
    }
    const row = node('div', work, undefined, 'submit-row');
    const check = action(row, 'check', 'submit', () => {
        const verdict = checkAssignments(progress.assignments);
        if (verdict !== 'correct') { say(verdict); return; }
        selected = null;
        saveProgress(snapshot, submit(progress), 'complete', 'objective');
    });
    check.disabled = progress.complete;
    target.querySelector('strong')!.tabIndex = -1;
    announce(row, feedback ?? (progress.complete ? 'complete' : null));
}

function openDialog(intent: Intent, opener: string) {
    pending = intent;
    returnFocus = opener;
    const remove = intent.kind === 'remove';
    const title = intent.kind === 'create' ? 'createTitle' : intent.kind === 'replace' ? 'replaceTitle' : 'removeTitle';
    element('dialog-title').textContent = text(title);
    element('dialog-note').textContent = text(intent.kind === 'create' ? 'demoData' : remove ? 'removeInfo' : 'replaceInfo');
    confirm.textContent = text(intent.kind);
    nameField.hidden = remove;
    input.disabled = remove;
    input.value = '';
    error.textContent = '';
    dialog.showModal();
    (remove ? cancel : input).focus();
}
cancel.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
    pending = null;
    focus(returnFocus);
});
form.addEventListener('submit', event => {
    event.preventDefault();
    if (!pending) return;
    if (pending.kind === 'remove') {
        const result = store.remove(pending.snapshot);
        feedback = result === 'removed' ? 'removed' : result;
    } else {
        const profile = readProfile({ label: input.value });
        if (!profile) {
            error.textContent = text('labelError');
            input.focus();
            return;
        }
        const result = pending.kind === 'create' ? store.create(pending.id, profile) :
            store.create(pending.snapshot.id, profile, pending.snapshot.save);
        feedback = result.ok ? 'saved' : result.reason === 'invalid' ? 'labelError' : result.reason;
    }
    returnFocus = 'slot-' + current;
    selected = null;
    dialog.close();
    render();
});
localeSelect.addEventListener('change', () => {
    locale = readLocale(localeSelect.value);
    try { window.localStorage.setItem(localeKey, locale); } catch { feedback = 'unavailable'; }
    renderCopy();
    render();
});
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || dialog.open || !selected) return;
    const cardId = 'card-' + selected;
    selected = null;
    say(null);
    work.querySelectorAll('.record').forEach(item => item.setAttribute('aria-pressed', 'false'));
    focus(cardId);
});
window.addEventListener('storage', event => {
    if (event.key === localeKey) {
        locale = readLocale(event.newValue);
        renderCopy();
        render();
    } else if (event.key === null || (event.key.startsWith(storagePrefix) && event.key !== activeKey)) {
        selected = null;
        if (dialog.open) dialog.close();
        feedback = 'changed';
        render();
    }
});

renderCopy();
render();

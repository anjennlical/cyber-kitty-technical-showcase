import test from 'node:test';
import assert from 'node:assert/strict';
import { SlotStore, decodeSave, readProfile, slotIds, slotKey, storagePrefix } from '../dist/saves.js';
import { assign, checkAssignments, freshProgress, objective, readProgress, submit } from '../dist/mission.js';
import { copy, localeKey, locales, readLocale } from '../dist/locales.js';

function setup() {
    const data = new Map();
    const storage = {
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key)
    };
    let sequence = 0;
    const open = () => new SlotStore(() => storage, () => 'demo-' + ++sequence);
    return { data, open, store: open() };
}
function saved(result) {
    assert.equal(result.ok, true);
    return result.snapshot;
}

test('all five slots are independent and selection persists after reopening', () => {
    const { store, open, data } = setup();
    data.set('unrelated-save', 'keep');
    assert.deepEqual(store.list().map(slot => slot.state), Array(5).fill('empty'));
    for (const id of slotIds) saved(store.create(id, { label: 'Perfil ' + id }));
    store.select(4);
    const restored = open();
    assert.equal(restored.selected(), 4);
    assert.deepEqual(restored.list().map(slot => slot.save.profile.label), slotIds.map(id => 'Perfil ' + id));
    assert.equal(data.get('unrelated-save'), 'keep');
    assert.equal(restored.create(4, { label: 'Duplicado' }).reason, 'changed');
});

test('partial assignments and completion survive a reload', () => {
    const { store, open, data } = setup();
    let snapshot = saved(store.create(1, { label: 'Perfil Lua' }));
    snapshot = saved(store.update(snapshot, assign(snapshot.save.progress, 'schedule', 'publish')));
    const restored = open();
    assert.equal(restored.read(1).save.progress.assignments.schedule, 'publish');
    const ready = assign(assign(snapshot.save.progress, 'poster', 'verify'), 'contact', 'private');
    snapshot = saved(restored.update(snapshot, submit(ready)));
    assert.equal(objective(open().read(1).save.progress), 'done');
    assert.deepEqual(decodeSave(data.get(slotKey(1))), snapshot.save);
    assert.equal(restored.update(snapshot, freshProgress()).reason, 'invalid');
});

test('replace and delete use the slot identity and revision', () => {
    const { store, open } = setup();
    const previous = saved(store.create(1, { label: 'Perfil Lua' }));
    const next = saved(open().update(previous, assign(freshProgress(), 'schedule', 'publish')));
    assert.equal(store.remove(previous), 'changed');
    assert.equal(store.create(1, { label: 'Perfil Sol' }, previous.save).reason, 'changed');
    const replacement = saved(store.create(1, { label: 'Perfil Sol' }, next.save));
    assert.notEqual(replacement.save.id, previous.save.id);
    assert.deepEqual(replacement.save.progress, freshProgress());
    assert.equal(store.update(next, freshProgress()).reason, 'changed');
    assert.equal(store.remove(replacement), 'removed');
    assert.equal(store.read(1).state, 'empty');
});

test('invalid saves and blocked storage are distinguished and preserved', () => {
    const { store, data } = setup();
    data.set(slotKey(3), '{broken');
    assert.equal(store.read(3).state, 'invalid');
    assert.equal(store.create(3, { label: 'Perfil Sol' }).reason, 'changed');
    assert.equal(data.get(slotKey(3)), '{broken');
    const snapshot = saved(store.create(2, { label: 'Perfil Órbita' }));
    const maxed = { ...snapshot.save, revision: Number.MAX_SAFE_INTEGER };
    data.set(slotKey(2), JSON.stringify(maxed));
    assert.equal(store.read(2).state, 'ready');
    assert.equal(store.update({ id: 2, save: maxed }, freshProgress()).reason, 'invalid');
    assert.equal(decodeSave('null'), undefined);
    assert.equal(readProfile({ label: '<b>x</b>' }), undefined);
    assert.equal(readProfile({ label: ' ' }), undefined);
    assert.equal(readProfile({ label: 'x'.repeat(25) }), undefined);
    assert.deepEqual(readProfile({ label: ' Perfil Órbita ' }), { label: 'Perfil Órbita' });
    const blocked = new SlotStore(() => { throw new Error('blocked'); });
    assert.equal(blocked.read(1).state, 'unavailable');
    assert.equal(blocked.create(1, { label: 'Perfil Sol' }).reason, 'unavailable');
    assert.equal(blocked.select(4), false);
});

test('write failures keep the existing checkpoint', () => {
    const { store, data } = setup();
    const start = saved(store.create(1, { label: 'Perfil Lua' }));
    const noWrite = new SlotStore(() => ({
        getItem: key => data.get(key) ?? null,
        setItem() { throw new Error('quota'); },
        removeItem() { throw new Error('blocked'); }
    }));
    assert.equal(noWrite.update(start, assign(freshProgress(), 'schedule', 'publish')).reason, 'unavailable');
    assert.equal(noWrite.remove(start), 'unavailable');
    assert.deepEqual(store.read(1).save, start.save);
});

test('classify, reassign and check gated mission completion', () => {
    let progress = freshProgress();
    assert.equal(objective(progress), 'sort');
    assert.equal(checkAssignments(progress.assignments), 'missing');
    assert.equal(submit(progress), progress);
    progress = assign(progress, 'schedule', 'publish');
    progress = assign(progress, 'poster', 'private');
    progress = assign(progress, 'contact', 'private');
    assert.equal(objective(progress), 'check');
    assert.equal(checkAssignments(progress.assignments), 'review');
    assert.equal(submit(progress), progress);
    progress = assign(progress, 'poster', 'verify');
    assert.equal(checkAssignments(progress.assignments), 'correct');
    assert.equal(objective(assign(progress, 'contact', null)), 'sort');
    const done = submit(progress);
    assert.equal(objective(done), 'done');
    assert.equal(assign(done, 'poster', 'publish'), done);
});

test('malformed assignments cannot invent records or finish early', () => {
    assert.equal(readProgress({ assignments: { mystery: 'publish' }, complete: false }), undefined);
    assert.equal(readProgress({ assignments: { poster: 'bad' }, complete: false }), undefined);
    assert.equal(readProgress({ assignments: { schedule: 'publish' }, complete: true }), undefined);
    assert.equal(readProgress({ assignments: [], complete: false }), undefined);
    const progress = freshProgress();
    assert.equal(assign(progress, 'fake', 'publish'), progress);
    assert.equal(assign(progress, 'poster', 'bad'), progress);
});

test('localization uses consistent IDs, a separate key and a deterministic fallback', () => {
    assert.deepEqual(locales, ['pt-BR', 'en']);
    assert.deepEqual(Object.keys(copy.en).sort(), Object.keys(copy['pt-BR']).sort());
    assert.ok(Object.values(copy.en).every(value => value.length > 0));
    assert.ok(Object.values(copy['pt-BR']).every(value => value.length > 0));
    assert.notEqual(copy.en.schedule, copy['pt-BR'].schedule);
    assert.equal(readLocale('en'), 'en');
    assert.equal(readLocale('xx'), 'pt-BR');
    assert.equal(readLocale(null), 'pt-BR');
    assert.equal(localeKey, storagePrefix + 'locale');
    assert.equal(slotIds.some(id => slotKey(id) === localeKey), false);
});

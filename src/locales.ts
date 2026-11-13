import { storagePrefix } from './saves.js';

export const locales = ['pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];
export const localeKey = storagePrefix + 'locale';
const pt = {
    page: 'Cyber Kitty Adventures — Demonstração técnica', identity: 'CYBER KITTY ADVENTURES',
    product: 'Demonstração técnica', title: 'Classifique os registros',
    intro: 'Decida o que pode ser publicado, o que precisa de verificação e o que deve ficar em sigilo.',
    workspace: 'Estações de trabalho', slots: 'Slots de teste', slotUnavailable: 'Indisponível', slot: 'Slot', empty: 'Disponível',
    invalid: 'Registro inválido', unavailable: 'Armazenamento indisponível. Confira as permissões do navegador.',
    select: 'Idioma', profile: 'Apelido de teste', example: 'Ex.: Perfil Lua', create: 'Criar perfil',
    replace: 'Substituir', remove: 'Excluir', demoData: 'Use um apelido inventado. Os dados ficam neste navegador.',
    createTitle: 'Criar um perfil', replaceTitle: 'Substituir perfil?', removeTitle: 'Excluir perfil?',
    replaceInfo: 'O progresso deste slot será substituído.', removeInfo: 'O perfil e o progresso deste slot serão excluídos.',
    cancel: 'Cancelar', labelError: 'Use de 1 a 24 letras, números, espaços ou hífens. Comece com uma letra ou número.',
    changed: 'Este slot mudou. Revise o estado atual e tente novamente.', removed: 'Perfil excluído.',
    active: 'Slot ativo', createFirst: 'Crie um perfil neste slot para começar.',
    invalidHint: 'Escolha outro slot para começar. O registro inválido foi preservado.',
    objective: 'Objetivo', sort: 'Classificar os três registros', check: 'Conferir as escolhas', done: 'Classificação concluída',
    bank: 'Registros para analisar', board: 'Quadro de classificação', how: 'Arraste um cartão ou selecione um cartão e depois uma categoria. Use Esc para cancelar a seleção.',
    schedule: 'Horário da oficina', scheduleNote: 'Sábado, 10h. Confirmado no calendário público.',
    poster: 'Cartaz revisado', posterNote: 'O local mudou em uma cópia sem autoria confirmada.',
    contact: 'Contato interno', contactNote: 'Ramal de teste da equipe. Apenas para uso interno.',
    publish: 'Publicar', publishNote: 'Informação confirmada e útil ao público.',
    verify: 'Verificar', verifyNote: 'A procedência ou a versão precisa ser confirmada.',
    private: 'Manter privado', privateNote: 'Dado destinado à equipe.',
    unassigned: 'Sem cartões', review: 'Algumas escolhas precisam de revisão. Confira a origem e quem deve ter acesso a cada registro.',
    missing: 'Classifique todos os registros antes de conferir.',
    selected: 'Cartão selecionado. Escolha uma categoria.', saved: 'Progresso salvo neste slot.',
    complete: 'Concluído. Você separou informações públicas, pendentes e privadas.',
    submit: 'Conferir classificação', note: 'Exercício demonstrativo com dados inventados.'
};
type Copy = { [K in keyof typeof pt]: string };
const en: Copy = {
    page: 'Cyber Kitty Adventures — Technical Showcase', identity: 'CYBER KITTY ADVENTURES',
    product: 'Technical Showcase', title: 'Sort the records',
    intro: 'Decide what can be published, what needs verification, and what should stay private.',
    workspace: 'Workspaces', slots: 'Test slots', slotUnavailable: 'Unavailable', slot: 'Slot', empty: 'Available',
    invalid: 'Invalid record', unavailable: 'Storage is unavailable. Check your browser permissions.',
    select: 'Language', profile: 'Test nickname', example: 'e.g. Moon Profile', create: 'Create profile',
    replace: 'Replace', remove: 'Delete', demoData: 'Use a made-up nickname. Data stays in this browser.',
    createTitle: 'Create a profile', replaceTitle: 'Replace profile?', removeTitle: 'Delete profile?',
    replaceInfo: 'Progress in this slot will be replaced.', removeInfo: 'This slot’s profile and progress will be deleted.',
    cancel: 'Cancel', labelError: 'Use 1 to 24 letters, numbers, spaces, or hyphens. Start with a letter or number.',
    changed: 'This slot has changed. Review its current state and try again.', removed: 'Profile deleted.',
    active: 'Active slot', createFirst: 'Create a profile in this slot to begin.',
    invalidHint: 'Choose another slot to begin. The invalid record was preserved.',
    objective: 'Objective', sort: 'Sort all three records', check: 'Check your choices', done: 'Sorting complete',
    bank: 'Records to review', board: 'Sorting board', how: 'Drag a card, or select a card and then a category. Press Esc to cancel selection.',
    schedule: 'Workshop hours', scheduleNote: 'Saturday, 10 a.m. Confirmed on the public calendar.',
    poster: 'Revised poster', posterNote: 'The venue changed in a copy with an unverified author.',
    contact: 'Internal contact', contactNote: 'Test extension for the team. For internal use only.',
    publish: 'Publish', publishNote: 'Verified information for visitors.',
    verify: 'Verify', verifyNote: 'The source or version needs confirmation.',
    private: 'Keep private', privateNote: 'Information intended for the team.',
    unassigned: 'No cards', review: 'Some choices need another look. Check the source and who needs access to each record.',
    missing: 'Sort every record before checking your choices.',
    selected: 'Card selected. Choose a category.', saved: 'Progress saved in this slot.',
    complete: 'Complete. You separated public, pending, and private information.',
    submit: 'Check classification', note: 'Practice exercise with made-up data.'
};
export const copy = { 'pt-BR': pt, en } satisfies Record<Locale, Copy>;
export type Message = keyof Copy;
export function readLocale(value: unknown): Locale { return value === 'en' ? 'en' : 'pt-BR'; }

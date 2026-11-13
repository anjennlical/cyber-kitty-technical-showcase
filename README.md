# Cyber Kitty Adventures — Technical Showcase

Demonstração técnica local de quatro sistemas desenvolvidos no contexto de Cyber Kitty Adventures, um projeto educativo de cibersegurança para iniciantes. A interface usa um exercício curto de classificação de registros com textos e perfis inventados.

## O que experimentar

1. Escolha um dos cinco slots e crie um perfil com um apelido inventado.
2. Leia os três cartões. Arraste um cartão para uma categoria ou selecione o cartão e depois a categoria. Pelo teclado, use Tab e Enter ou Espaço. Esc cancela a seleção.
3. Confira a classificação. Se alguma escolha precisar de revisão, selecione e mova o cartão para outra categoria.
4. Troque o idioma ou recarregue a página para verificar a retomada. O menu do perfil permite substituir ou excluir o slot ativo após confirmação.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| `src/saves.ts` | Cinco slots, serialização versionada, validação, troca de perfil e proteção contra edições baseadas em revisão desatualizada |
| `src/mission.ts` | Regras puras de classificação, validação e avanço do objetivo |
| `src/locales.ts` | Catálogos tipados PT-BR/EN e seleção de idioma |
| `src/main.ts` | Composição da interface, eventos de arraste e teclado, modais e persistência de checkpoints |
| `web/` | HTML, CSS, ilustração geométrica em CSS, fonte e aviso OFL |
| `scripts/` e `tests/` | Build estática, servidor local e testes com armazenamento em memória |

TypeScript 5.7.3 é a única dependência de desenvolvimento. A interface usa APIs nativas do navegador e roda sem dependências de JavaScript em tempo de execução. O servidor de demonstração usa somente módulos da biblioteca padrão do Node.js.

## Rodar localmente

Requer Node.js 22 ou mais recente e npm. No PowerShell, a partir desta pasta:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abra `http://127.0.0.1:4173/`. O comando compila e serve os arquivos. Após editar, reinicie o comando para reconstruir. Em outros terminais, use `npm` no lugar de `npm.cmd`. Use Ctrl+C para parar o servidor.

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
npm.cmd run preview
```

A build fica em `dist/`. `preview` serve a última build. Caso a porta padrão esteja ocupada, use `npm.cmd run preview -- 4174`. Os oito testes automatizados cobrem os cinco slots, conflitos de revisão, estados inválidos, falhas de gravação, persistência, regras de conclusão e consistência das traduções.

## Decisões e limites

Cada avanço bem-sucedido grava o estado do exercício no slot. O app valida o JSON ao ler, preserva um registro inválido e detecta alterações que já estejam visíveis no momento da gravação. `localStorage` não oferece transações entre abas. Os perfis e o idioma ficam no navegador, por origem, sob chaves próprias. Use o mesmo protocolo, host e porta ao testar recarga. A demo funciona sem conta ou conexão com serviços externos.

Esta seleção usa registros neutros e uma interface própria. Campanha, Phaser, personagens, sprites, trilhas, cenas e migrações do jogo completo ficaram fora do escopo.

## Direitos e atribuições

A licença do código da demonstração ainda está em decisão. A fonte Nunito é distribuída sob SIL Open Font License 1.1, com o aviso que acompanha o arquivo. TypeScript é a dependência de desenvolvimento e tem licença própria. Os créditos do projeto e a origem dos componentes estão documentados. [Procedência e atribuições](docs/PROCEDENCIA.md)

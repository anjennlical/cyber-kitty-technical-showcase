# Procedência e atribuições

Cyber Kitty Adventures foi concebido e dirigido por Larissa Albuquerque. A documentação do jogo atribui à criadora o conceito, a direção criativa, a narrativa, os objetivos educativos e a revisão do projeto. ChatGPT, Codex e Claude Code apoiaram a implementação e a revisão ao longo do desenvolvimento original. Esta demonstração recebeu assistência do Codex. O histórico local do jogo conserva as atribuições registradas em cada commit.

## Relação com a versão original

| Arquivos da demonstração | Procedência |
| --- | --- |
| `src/saves.ts` | Implementação nova, baseada nas decisões de slots independentes, revisão e validação do sistema `adventureSlots.ts`. Nenhum trecho de código, save legado ou metadado Git foi copiado |
| `src/mission.ts` | Exercício novo de privacidade. Os checkpoints retomam a ideia de objetivos condicionais de `chapterOneCheckpoint.ts`, com regras, estados e registros próprios |
| `src/locales.ts` | Catálogos novos em PT-BR/EN. O padrão de IDs compartilhados foi observado na localização do jogo |
| `src/main.ts`, `web/index.html` e `web/style.css` | Interface original que demonstra seleção e arraste, inspirada no modo de interação de `noticeBoard.ts`. Ilustração feita com formas CSS e caracteres tipográficos |
| `scripts/`, `tests/` e configurações | Escritos para a demonstração. O lockfile referencia a versão fixada do compilador usada na validação |
| `web/Nunito.ttf` e `web/Nunito-OFL.txt` | Fonte e aviso copiados do recurso instalado no jogo. Copyright e termos SIL Open Font License 1.1 preservados. SHA-256 da fonte `BB55A5CA5C2042335B3991AF27C4D0705D0EF41CAC6164AC737FD8F2A1E85207` |

Os módulos de referência no projeto original foram revisados para identificar dependências e conteúdo de campanha. A demo reimplementa os padrões com dados próprios. O modelo MIT da Phaser Studio e a biblioteca Phaser continuam creditados no projeto original. Nenhum código do modelo ou da biblioteca integra esta seleção. O compilador TypeScript é distribuído sob Apache-2.0 pelo respectivo pacote npm, que contém seu texto de licença e avisos.

## Escopo dos direitos

A OFL aplica-se à fonte Nunito. A licença Apache-2.0 do compilador aplica-se ao TypeScript. A licença de redistribuição do código da demonstração ainda depende de decisão da responsável. Os avisos da fonte e do compilador cobrem seus respectivos materiais. A preparação do repositório privado destina-se à revisão desta seleção. Uma divulgação pública exige revisão própria de direitos, atribuições e conteúdo.

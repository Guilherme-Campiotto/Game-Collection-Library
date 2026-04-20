# Game Collection

Catálogo pessoal para organizar a coleção de jogos em uma interface simples, bonita e sem banco de dados.

## Preview

Tela inicial com painel, resumo da coleção e filtros:

![Tela inicial do site](docs/site-home.png)

Área da biblioteca com cards, preço médio e ações de editar ou excluir:

![Biblioteca de jogos no site](docs/site-library.png)

## O que o site faz

- Mostra um painel com jogos da coleção cadastrados em `data/library-games.json`.
- Permite buscar, filtrar e ordenar por plataforma, gênero, status, ano e preço médio.
- Traz um formulário para cadastrar novos itens direto no navegador.
- Permite cadastrar um jogo a partir de uma foto usando IA com busca web.
- Quando aberto com o servidor local em `npm start`, salva a coleção em `data/library-games.json` e as novas capas em `assets/covers/`.
- Tem uma página de galeria para guardar fotos da coleção em `assets/gallery/`, com upload, zoom e exclusão.
- Permite exportar e importar os dados em JSON.

## Arquivos principais

- `index.html`: estrutura do site
- `styles.css`: visual da interface
- `app.js`: lógica de filtros, cadastro, persistência e exportação
- `gallery.html` e `gallery.js`: galeria de fotos da coleção
- `server.js`: servidor local para salvar coleção e uploads dentro do projeto
- `data/library-games.json`: fonte única dos jogos cadastrados na coleção

## Como usar

1. Na pasta do projeto, rode `npm start`.
2. Abra `http://127.0.0.1:3000` no navegador.
3. Use o formulário para adicionar ou editar jogos.
4. Quando enviar uma capa nova, o arquivo será salvo em `assets/covers/`.
5. Use a página `Fotos da coleção` para enviar, ampliar ou excluir fotos da galeria.
6. As alterações da coleção ficam persistidas em `data/library-games.json`.

## Cadastro por foto com IA

1. Clique em `Configurar IA`.
2. Cole sua API key da OpenAI.
3. A chave será salva apenas localmente em `.local/openai-key.json`, que é ignorado pelo Git.
4. Clique em `Cadastrar por foto` e selecione uma imagem com um ou mais jogos.
5. O servidor usa a foto e busca web para sugerir título, plataforma, gênero, ano, preço médio e capa oficial de cada jogo identificado.

## Observações sobre os preços

- Os preços médios iniciais foram estimados com base em pesquisas no Mercado Livre em abril de 2026.
- Como o mercado muda, você pode editar a base exportando o JSON, ajustando os valores e importando novamente.

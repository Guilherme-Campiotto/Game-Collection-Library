# Game Collection Library

Catalogo pessoal para organizar a colecao de jogos em uma interface simples, bonita e sem banco de dados.

## O que o site faz

- Mostra um painel com jogos da colecao, usando as fotos da estante como base inicial.
- Permite buscar, filtrar e ordenar por plataforma, genero, status, ano e preco medio.
- Traz um formulario para cadastrar novos itens direto no navegador.
- Salva os novos itens em `localStorage`.
- Permite exportar e importar os dados em JSON.

## Arquivos principais

- `index.html`: estrutura do site
- `styles.css`: visual da interface
- `app.js`: logica de filtros, cadastro, persistencia e exportacao
- `data/seed-games.js`: jogos iniciais identificados nas fotos

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Explore os jogos cadastrados inicialmente.
3. Use o formulario para adicionar novos jogos com foto.
4. Clique em `Exportar JSON` para salvar uma copia da colecao.
5. Use `Importar JSON` para restaurar ou migrar seus dados.

## Observacoes sobre os precos

- Os precos medios iniciais foram estimados com base em pesquisas no Mercado Livre em abril de 2026.
- Como o mercado muda, voce pode editar a base exportando o JSON, ajustando os valores e importando novamente.

## Publicar no GitHub

Dentro desta pasta, rode:

```powershell
git add .
git commit -m "Create static game collection site"
gh repo create "Game Collection Library" --public --source . --remote origin --push
```

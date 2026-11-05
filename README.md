# Eleitoral Digital — demonstração v1.3

Projeto educacional de **simulação eleitoral**, com candidatos, eleitores, urnas e resultados inteiramente fictícios. Não é um sistema oficial e não deve ser usado em eleições reais.

## Deploy no Netlify

- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

A configuração está em `netlify.toml`. Requer Node.js 20 ou superior. Para testar localmente: `npm install` e `npx netlify dev`.

## Limites importantes

O bloqueio de repetição é por sessão do navegador, não verifica a identidade de uma pessoa. Apagar cookies ou usar outro navegador cria outra sessão. Não insira CPF, telefone, e-mail real ou outros dados pessoais. Todos os dados exibidos são demonstrativos.
# Eleição Escolar — demonstração educacional

Projeto de simulação eleitoral para aprendizado. Candidatos, participantes, municípios e resultados são fictícios. Não é um sistema oficial nem deve ser usado em eleições reais. Não insira CPF, telefone, e-mail ou outros dados pessoais reais.

## Histórico do projeto

O sistema começou como **Eleitoral Digital** e foi preparado inicialmente para o Netlify. A estrutura original usa arquivos estáticos em `public/`, rotas de backend em `netlify/functions/` para sessão, voto e resultados, e Netlify Blobs para guardar os votos demonstrativos.

Depois, o projeto passou a se chamar **Eleição Escolar** e a hospedagem da interface foi transferida do Netlify para o **Render**. O repositório de publicação é [sistema-escola](https://github.com/joelvibecoder-wq/sistema-escola).

## Estado atual

- **Site publicado:** [https://sistema-escola-p7xy.onrender.com](https://sistema-escola-p7xy.onrender.com)
- **Hospedagem atual:** Render Static Site, publicando a pasta `public/`.
- **Deploy:** automático a partir da branch `main` do GitHub.
- **Interface:** HTML, CSS e JavaScript, responsiva e com recursos PWA (manifest e service worker).
- **CRUD demonstrativo:** cadastro, listagem, pesquisa, edição e exclusão de registros fictícios na área Administração.
- **Armazenamento do CRUD:** `localStorage` do navegador atual. Os registros não sincronizam entre aparelhos e podem ser apagados ao limpar os dados do navegador.
- **Backend original:** Netlify Functions (sessão, voto e apuração) + Netlify Blobs.
- **Migração incompleta:** as APIs e o armazenamento de Netlify ainda não foram migrados para serviços compatíveis com Render. O serviço Render atual é estático e não executa Netlify Functions nem oferece armazenamento persistente de votos por si só.

A proteção contra repetição na versão de origem é por sessão do navegador, não por identidade real. Cookies removidos ou outro navegador podem iniciar uma sessão diferente.

## Fluxograma

![Fluxograma do sistema Eleição Escolar](docs/fluxograma-sistema.svg)

## CRUD local demonstrativo

Na área **Administração / CRUD**, é possível criar, consultar, pesquisar, editar e excluir registros de demonstração (nome fictício, turma e data de nascimento fictícia). O conteúdo fica apenas no `localStorage` daquele navegador. Não utilize informações reais. A API e o banco de dados remoto não fazem parte desta atualização.

## Tecnologias

- HTML, CSS e JavaScript
- PWA: `public/manifest.webmanifest` e `public/sw.js`
- GitHub para versionamento e disparo de deploy
- Render Static Site para publicação da interface
- Netlify Functions + Netlify Blobs na implementação original do backend

## Uso responsável

Este é um protótipo educacional com dados inteiramente fictícios. Não utilize para eleições reais, não colete credenciais reais e não cadastre informações pessoais.

## Criação e gerenciamento de eleições

Na aplicação, entre em **Administração** e localize o painel **Criação de eleição**. Nele, você pode configurar e administrar eleições fictícias para testar o sistema.

### Como criar uma eleição

1. Informe o **nome da eleição** (por exemplo, Eleição do Grêmio Estudantil).
2. Selecione a **modalidade**: grêmio estudantil, representante de turma, direção escolar ou simulação livre.
3. Preencha o **município** e a **UF**.
4. Defina a **data e hora de início** e de **encerramento**. O encerramento precisa ser posterior ao início.
5. Opcionalmente, escreva uma **descrição ou regras da simulação**.
6. Clique em **Criar eleição**. A eleição será exibida na lista do painel.

### Gerenciar eleições criadas

- **Editar:** altera os dados da eleição selecionada.
- **Ativar / Pausar:** muda o estado demonstrativo da eleição.
- **Excluir:** remove a eleição do armazenamento local após confirmação.
- **Lista:** mostra as eleições que foram criadas nesse navegador.

### Limites desta versão

As eleições são guardadas no `localStorage` do navegador que as criou. Elas não aparecem em outros aparelhos ou para outros usuários, não iniciam uma votação real e ainda não estão conectadas à API nem a um banco de dados remoto. O status Ativa/Pausada é apenas demonstrativo e não controla o acesso à votação.

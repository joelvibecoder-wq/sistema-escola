# Kennedy Vota — preparação do PostgreSQL

O banco Render gratuito criado para este projeto é **kennedy-vota-db**, no workspace **Joel_vibecoder** (região Ohio, PostgreSQL 16). Este arquivo descreve a preparação; **não declara que a conexão foi feita nem que o SQL já foi executado**.

## Segurança e limites

- Usar somente para desenvolvimento e testes com dados fictícios. O banco gratuito expira após 30 dias e não oferece backup gerenciado suficiente para eleição oficial.
- O serviço atualmente publicado em `sistema-escola-p7xy.onrender.com` é um **Static Site**, portanto **não executa** a API `server.js` nem consegue escrever no Postgres.
- É necessário criar/configurar um **Render Web Service Node.js** e definir a variável **DATABASE_URL** com a URL **interna** do Postgres, no painel privado do Render. Não enviar credenciais ao GitHub, ao chat ou ao navegador.
- Configurar **GOOGLE_CLIENT_ID** no Render, com credencial criada em Google Cloud Console e origem autorizada exatamente igual ao domínio HTTPS do servidor.
- Definir uma **JWT_SECRET** forte somente no ambiente servidor, se a API utilizar sessões JWT.
- O protótipo atualmente ainda contém telas/votos no `localStorage`; substituir a votação local por uma API transacional e esconder rotas de administração com verificação de autorização no servidor, antes de uso real.
- O endpoint preparatório de Google apenas valida ID token e coloca usuários como pendentes; não concede privilégios administrativos nem habilita votar.
- Aplicar `db/kennedy-vota-schema.sql` em ambiente de desenvolvimento com migração controlada após revisão, sem tocar nos registros de demonstração existentes. O script ainda não foi executado no banco.
- A comissão eleitoral deve aprovar participantes por um fluxo autenticado e auditado; jamais aprovar contas ou conceder papel admin por entrada enviada pelo browser.
- O registro de participação e a cédula devem ser inseridos na mesma transação. Garantia real de sigilo exige auditoria do sistema completo, logs e infraestrutura.

## Próximas etapas técnicas

1. Concluir provisionamento do banco no Render e configurar a URL interna no serviço de API Node.
2. Executar migração após revisão, com permissões restritas.
3. Conectar OAuth Google e implementar aprovação de perfis.
4. Migrar telas de eleições, candidatos, votação e apuração do `localStorage` para endpoints com autorização.
5. Fazer testes de concorrência, voto duplicado, recuperação, backup, privacidade e segurança antes de uma eleição real.

**Estado:** banco criado no Render; esquema preparado no GitHub; conexão, migração e produção ainda pendentes.

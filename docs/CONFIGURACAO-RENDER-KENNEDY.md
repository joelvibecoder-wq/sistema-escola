# Configuração do Render — Kennedy Vota

[← README](../README.md) · [Guia completo](GUIA-DO-PROJETO.md) · [Segurança](SEGURANCA.md)

> **Documento atualizado.** Substitui instruções antigas que descreviam uma aplicação somente estática ou um banco ainda não conectado.

O **Kennedy Vota** usa o Web Service Node.js publicado em **https://kennedy-vota-app.onrender.com**, associado à branch `feature/google-login-animacoes-20261109`.

### Como a versão atual está organizada

- **Serviço:** Render Web Service Node.js, build `npm install && npm run build`, inicialização `npm start`.
- **API:** `server.js` (Express), saúde em `GET /api/status`.
- **Banco:** PostgreSQL já conectado ao serviço em testes (a conexão aparece nos logs de inicialização).
- **Migração:** `server.js` verifica/cria as tabelas `kv_*` e atualiza a coluna opcional de idade.
- **Site anterior:** uma implantação estática mais antiga pode continuar disponível separadamente; não é o serviço atual.
- **PWA:** arquivos em `public/` e geração dos ícones no build.

### Variáveis (valores somente no painel privado)

| Variável | Função |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL |
| `SESSION_SECRET` | Chave privada de sessão |
| `NODE_ENV` | `production` |
| `ADMIN_SETUP_EMAIL` | Endereço permitido para ativação inicial |
| `ADMIN_SETUP_TOKEN` | Token confidencial de uso único |
| `GOOGLE_CLIENT_ID` | Login Google opcional |
| `ADMIN_GOOGLE_EMAIL` | Configuração opcional de administrador Google |

**Nunca coloque os valores** dessas variáveis, credenciais, senhas, tokens ou e-mails pessoais em commits e documentação pública.

**Passo a passo operacional atualizado:** [GUIA-DO-PROJETO.md](GUIA-DO-PROJETO.md).  
**Arquitetura:** [ARQUITETURA.md](ARQUITETURA.md).  
**Diagrama lógico:** [diagrama-logico-kennedy-vota.svg](diagrama-logico-kennedy-vota.svg).

**Atenção:** a aplicação continua experimental. Verificar banco conectado não comprova segurança ou prontidão para eleições oficiais.

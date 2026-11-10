# Kennedy Vota — nova versão instalável (2026)

## Publicação de teste

- **Novo Render Web Service Node.js (plano free):** https://kennedy-vota-app.onrender.com
- **Código:** branch `feature/google-login-animacoes-20261109` de `joelvibecoder-wq/sistema-escola`
- **Banco Render PostgreSQL:** `kennedy-vota-db` (Ohio, plano free, com expiração de 30 dias)
- O site público anterior `sistema-escola-p7xy.onrender.com` permanece separado e não foi substituído.
- O novo serviço tem HTTPS, CSS responsivo, PWA, tela de login inicial, ícones gerados no build, animações e uma ilustração escolar.

## Configuração obrigatória antes de habilitar cadastros

**Atenção:** a integração do banco ainda NÃO está concluída até definir a variável `DATABASE_URL` no painel do novo Web Service.

1. No painel Render abra o banco [kennedy-vota-db](https://dashboard.render.com/d/dpg-dbp6hv8m7kps73a065f0-a).
2. Em **Connections**, copie a **Internal Database URL** (o banco e serviço estão em Ohio).
3. Abra [kennedy-vota-app · Environment](https://dashboard.render.com/web/srv-dbp6spp42hec73boq7og), entre em **Environment** e crie `DATABASE_URL` com a URL interna copiada.
4. Salve e aguarde o redeploy. A inicialização criará tabelas `kv_*` no banco. Confirme `/api/status` com `ready: true`.
5. Nunca cole a URL do banco em um issue, repositório público ou mensagem de chat: ela contém senha.

A variável `SESSION_SECRET` já foi definida no serviço como valor secreto; não a versionar.

## Login Google (opcional, mas solicitado)

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Configure a tela de consentimento OAuth conforme as políticas Google (interno/external, conforme a escola).
3. Crie um ID de cliente do tipo **Aplicativo Web**.
4. Em **Origens JavaScript autorizadas**, cadastre exatamente `https://kennedy-vota-app.onrender.com`.
5. Copie o **Client ID** (não o Client Secret) para `GOOGLE_CLIENT_ID` no painel Environment do serviço.
6. Configure `ADMIN_GOOGLE_EMAIL` com o endereço Google verificado da pessoa responsável, antes do primeiro login administrativo. Sem esta variável, nenhuma conta pode se tornar administradora automaticamente.
7. Para vincular Google a uma conta com senha já existente, entre com e-mail/senha e depois use **Configurações > Vincular Google**.
8. Contas criadas por ambos os métodos entram pendentes de aprovação, salvo o e-mail administrativo Google definido na variável do servidor.

## Cadastro por e-mail e senha

Após configurar `DATABASE_URL`, o cadastro por e-mail e senha terá pelo menos 10 caracteres na senha, armazenará o hash com bcrypt, e exigirá aprovação manual da administração. **Não está implementada a verificação de titularidade do e-mail por mensagem de confirmação nem recuperação de senha**; essas funções são necessárias antes de uso com usuários reais.

## Instalação como aplicativo

- **Android/Chrome:** abrir o link HTTPS e escolher Instalar ou Adicionar à tela inicial.
- **iPhone/Safari:** Compartilhar > Adicionar à Tela de Início.
- **Windows/macOS Chrome ou Edge:** menu do navegador > Instalar aplicativo.

O manifesto e o service worker tornam a página instalável; **votação exige acesso online**. A instalação em dispositivos/navegadores específicos deve ser verificada.

## Segurança e limites

- O sistema **não deve ser usado para eleições oficiais** sem revisão e teste de segurança independentes.
- O voto é enviado ao backend, exige aprovação e é limitado a um registro de participação por usuário/eleição através de chave primária transacional.
- A tabela de cédulas não tem e-mail ou ID do eleitor. Ainda é necessário auditar possíveis correlações via logs, horários e operação do banco.
- **Não há verificação de e-mail** nem recuperação de senha para contas locais; não autorize usuários antes de confirmar manualmente a identidade.
- Os planos gratuitos expiram ou podem suspender/hibernar e não oferecem disponibilidade/backup apropriados para votação oficial.
- A ilustração da escola é uma representação criativa, **não uma fotografia oficial da instituição**.

## Revisão de versão

Esta implementação está numa branch de desenvolvimento e na implantação de teste `kennedy-vota-app`, não na branch `main`. **Não mesclar** com o site anterior antes de validação integral de login, permissões, voto duplicado, sigilo e apuração.

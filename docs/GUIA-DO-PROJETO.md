# Guia passo a passo — Kennedy Vota

[← README](../README.md) · [Diagrama](diagrama-logico-kennedy-vota.svg) · [Arquitetura](ARQUITETURA.md)

> Este guia descreve o **ambiente experimental**. Para simulações, utilize contas e dados fictícios. Não publique senhas ou e-mails pessoais no GitHub.

## 1. Conhecer o projeto

- Repositório: https://github.com/joelvibecoder-wq/sistema-escola
- Aplicação de testes: https://kennedy-vota-app.onrender.com
- Branch implantada: `feature/google-login-animacoes-20261109`
- Tecnologias: HTML, CSS, JavaScript, Node.js/Express, PostgreSQL e PWA.
- Diagrama: [docs/diagrama-logico-kennedy-vota.svg](diagrama-logico-kennedy-vota.svg).

## 2. Executar na sua máquina

**Pré-requisitos:** Git, Node.js 20 ou superior e PostgreSQL com banco de testes disponível.

1. Abra um terminal e clone o projeto:

   ```bash
   git clone https://github.com/joelvibecoder-wq/sistema-escola.git
   cd sistema-escola
   git checkout feature/google-login-animacoes-20261109
   ```

2. Instale os pacotes:

   ```bash
   npm install
   ```

3. Crie um arquivo local de ambiente:

   ```bash
   cp .env.example .env
   ```

   No Windows sem `cp`, copie `.env.example` para `.env` no Explorador. **Não faça commit de `.env`.**

4. Preencha, *somente na sua máquina*, os campos `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_SETUP_EMAIL` e `ADMIN_SETUP_TOKEN`. Use banco e conta fictícios para testes.

   Para gerar um segredo aleatório com Node:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Gere **valores distintos** para `SESSION_SECRET` e `ADMIN_SETUP_TOKEN`.

5. Execute verificações de sintaxe e inicie a API:

   ```bash
   npm run check
   node --env-file=.env server.js
   ```

6. Abra `http://localhost:10000`. Verifique `http://localhost:10000/api/status`. Deve indicar `"ready": true` se o PostgreSQL está acessível e as variáveis foram configuradas.

O build `npm run build` também gera ícones PNG da PWA. **O comando `npm start` sozinho não carrega `.env` automaticamente**; no Render as variáveis vêm do painel privado.

## 3. Implantar no Render

1. Crie/acesse um serviço **Web Service Node.js** vinculado ao repositório.
2. Configure a branch de implantação conforme `render.yaml`.
3. Use **Build Command**: `npm install && npm run build`.
4. Use **Start Command**: `npm start`.
5. Tenha um PostgreSQL compatível e configure **`DATABASE_URL`** com endereço privado de conexão.
6. Em **Environment**, configure **`SESSION_SECRET`** (ao menos 32 caracteres). O `NODE_ENV` da hospedagem deve ser `production`.
7. Se for ativar a primeira conta administrativa por senha, configure em privado **`ADMIN_SETUP_EMAIL`** e **`ADMIN_SETUP_TOKEN`** (ao menos 32 caracteres).
8. Se quiser login Google, configure **`GOOGLE_CLIENT_ID`** no serviço e a origem autorizada do domínio HTTPS no Google Cloud.
9. Salve e aguarde o deploy. Verifique `/api/status` sem expor dados privados.

> O projeto possui uma base do Render usada pelo serviço existente. **Não crie outro banco nem substitua dados reais sem revisar o ambiente primeiro.** As tabelas `kv_*` são inicializadas por `server.js`.

## 4. Ativar o primeiro administrador

1. Em um navegador, abra o endereço do serviço, selecione **Criar conta → Administrador**.
2. Digite o **endereço que foi previamente autorizado em `ADMIN_SETUP_EMAIL`**, o nome, uma senha de pelo menos 12 caracteres e o código configurado em `ADMIN_SETUP_TOKEN`.
3. Envie a ativação. Ela só funciona uma vez e não deve expor o código publicamente.
4. Nos próximos acessos use **Entrar**, com e-mail e senha.
5. Não é possível conceder perfil admin apenas escolhendo-o no formulário.

**Atenção:** não é obrigatório criar um administrador no ambiente local se o objetivo é apenas estudar o código. Não compartilhe o código de ativação por mensagem ou capturas.

## 5. Criar e aprovar contas comuns

1. Acesse **Criar conta** e selecione **Aluno** ou **Professor**.
2. Informe nome, e-mail e uma senha de pelo menos 10 caracteres.
3. Após entrar, o usuário poderá consultar o painel e verá a situação de aprovação.
4. O responsável entra na conta administrativa, abre **Cadastros**, verifica o vínculo por meio externo e aprova o usuário.
5. A pessoa aprovada atualiza a sessão e passa a poder participar das eleições elegíveis.

**O sistema não envia e-mail de verificação** para cadastros locais; o responsável deve verificar as pessoas antes de aprovar.

## 6. Criar uma eleição de teste e abrir a votação

1. Entre como administrador e abra **Eleições**.
2. Preencha título, modalidade, descrição e **data/hora de início e fim**. O fim deve ser posterior ao início.
3. Clique em **Salvar eleição**: o estado inicial é **Planejada**.
4. Abra **Candidatos**, escolha a eleição e cadastre **pelo menos dois candidatos** com números distintos.
5. Volte a **Eleições** e clique em **Abrir**.
6. Confirme que a hora atual está entre início e encerramento. Se o horário ainda não chegou, a Área de votação avisará.
7. A API aceita alunos e professores definidos como elegíveis. Administradores podem votar nas eleições que permitem professores, seguindo as mesmas restrições de voto único.

**Importante:** a opção **Abrir** é indispensável; apenas salvar a eleição não libera a votação.

## 7. Realizar voto de teste

1. Entre com uma conta **aprovada e elegível**; não use uma eleição oficial.
2. Abra **Área de votação** no computador ou celular.
3. Se necessário, clique em **Atualizar eleições**.
4. Selecione a eleição e depois o candidato.
5. Clique em **Confirmar voto** e confirme na janela apresentada.
6. Confira a mensagem de resultado. O mesmo usuário não poderá votar novamente nessa eleição.

Em caso de erro, a interface informa se a conta não foi aprovada, se o processo ainda está Planejado, se está fora do período, se o perfil não é elegível ou se o voto já foi registrado.

## 8. Encerrar e consultar resultados

1. Como administrador, abra **Eleições** e use **Encerrar**, quando apropriado.
2. Acesse **Apuração** para consultar resultados após o encerramento do processo ou após o fim do período configurado.
3. Exporte o CSV de resultados, se disponível.

Resultados antes do encerramento são bloqueados pela API.

## 9. Perfil e saída

No canto superior direito, clique no nome da pessoa conectada. O menu permite consultar nome, e-mail próprio, idade opcional e indicador de senha protegida. É possível **informar a idade**, **alterar a senha informando a atual** e clicar no botão vermelho **Sair da conta**. O sistema pergunta **“Sair da sua conta?”** e só encerra após confirmação.

O sistema não permite recuperar a senha antiga em texto. Para senhas salvas no navegador, utilize o gerenciador de senhas do próprio navegador.

## 10. Atualizar o código sem perder dados

1. Edite os arquivos no repositório; não inclua `.env` ou segredos.
2. Execute `npm run check` e `npm run build`.
3. Faça commit na branch apropriada. O Render está configurado para atualizar a partir de `feature/google-login-animacoes-20261109`.
4. Verifique o deploy como **live**, a conexão do banco e o funcionamento em computador e celular.
5. Não exclua tabelas, não reinicialize a base e não execute votos reais durante testes automáticos.

### Se algo não funcionar

| Sintoma | O que verificar |
| --- | --- |
| Login inválido | Conta realmente cadastrada no banco e senha correta; gerenciador de senhas |
| Cadastro pendente | Aguardar aprovação do administrador |
| Botão de votar desativado | Eleição aberta, intervalo de datas, candidatos, perfil aprovado e elegível |
| Votação não aparece | Clicar em **Atualizar eleições**, verificar estado **Aberta** e intervalo |
| Admin não ativa | E-mail e código configurados no Render, ativação já usada ou erro de digitação |
| Interface antiga no celular | Atualizar página e, se necessário, reinstalar/atualizar PWA |
| `/api/status` não está pronto | Conferir `DATABASE_URL`, `SESSION_SECRET`, PostgreSQL e logs do Render |

## 11. Limitações e boas práticas

- **Não usar este projeto em eleições reais** sem auditoria e infraestrutura adequadas.
- Não há verificação automática de e-mail local nem recuperação de senha por e-mail.
- A base e os serviços gratuitos podem dormir, expirar ou não ter backups suficientes.
- Não envie credenciais, contas pessoais, CPF, identidade dos eleitores ou resultados reais ao GitHub.
- Não use nomes de estudantes reais em documentação pública.

Mais informações: [SEGURANCA.md](SEGURANCA.md).

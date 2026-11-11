<div align="center">

# 🗳️ Kennedy Vota
### Portal de eleições escolares · código, arquitetura e documentação

**Projeto web educacional para organizar e simular eleições no ambiente escolar.**  
Cadastro de pessoas, aprovação por administrador, eleições, candidatos, voto único por conta e apuração após o encerramento.

**[🌐 Abrir aplicação](https://kennedy-vota-app.onrender.com)** · **[📐 Ver diagrama lógico](docs/diagrama-logico-kennedy-vota.svg)** · **[📖 Guia passo a passo](docs/GUIA-DO-PROJETO.md)** · **[🔧 Arquitetura](docs/ARQUITETURA.md)**

</div>

> [!IMPORTANT]
> **Ambiente de desenvolvimento e testes.** Este projeto não é um sistema eleitoral oficial e **não deve ser usado em eleições reais** sem auditoria independente de segurança, privacidade, integridade, disponibilidade e procedimentos eleitorais. Use dados fictícios para demonstrações.

## 1. Apresentação do repositório e do projeto

Bem-vindo ao repositório **[joelvibecoder-wq/sistema-escola](https://github.com/joelvibecoder-wq/sistema-escola)**. Aqui estão o código-fonte, os recursos da interface, os arquivos de implantação, a documentação técnica e o **diagrama lógico do Kennedy Vota**.

O sistema serve como laboratório de aprendizagem sobre participação estudantil, desenvolvimento web e gestão de eleições escolares. Foi inspirado em um contexto escolar e **não representa um serviço oficial ou um endosso de instituição de ensino**.

| Recurso | Endereço ou descrição |
| --- | --- |
| Aplicação (Render Web Service) | **https://kennedy-vota-app.onrender.com** |
| Código-fonte | **https://github.com/joelvibecoder-wq/sistema-escola** |
| Implantação atual no Render | Branch `feature/google-login-animacoes-20261109` |
| Linguagem | HTML, CSS, JavaScript, Node.js |
| API | Express |
| Banco de dados | PostgreSQL, via `pg` |
| Instalação | PWA (manifest + service worker) |
| Google login | Opcional, exige configuração em Google Cloud |
| Status de uso | Ambiente experimental, sujeito a validação |

Nenhuma senha, token, código administrativo, URL autenticada do banco ou lista privada de usuários está publicada nesta documentação.

## 2. O que a aplicação faz

- **Conta de aluno/professor** por e-mail e senha, com autorização escolar antes de votar.
- **Ativação inicial de administrador** por autorização de uso único configurada no servidor; novos administradores não são criados apenas pela seleção de perfil.
- **Acesso ao painel** após autenticação, incluindo informação sobre aprovação da conta.
- **Menu de perfil** no canto superior direito: nome, e-mail da própria conta, idade opcional, senha protegida, opção de trocar senha e **saída com confirmação**.
- **Gerenciamento de eleições** e candidaturas para administradores.
- **Área de votação** para usuários aprovados e elegíveis, quando a eleição estiver aberta no período correto.
- **Um voto por conta e eleição** por restrição e transação no banco.
- **Apuração** consultável após o encerramento.
- **Modo claro/escuro**, interface responsiva e instalação como aplicativo PWA.
- **Google Sign-In opcional**: depende de `GOOGLE_CLIENT_ID` válido no ambiente; não substitui autorização da escola.

## 3. Diagrama lógico completo

A imagem SVG abaixo representa os componentes, os perfis e o caminho dos dados **conforme o código atual**; não contém credenciais nem dados pessoais:

[![Diagrama lógico Kennedy Vota — navegador, API, PostgreSQL, fluxo de votação e segurança](docs/diagrama-logico-kennedy-vota.svg)](docs/diagrama-logico-kennedy-vota.svg)

**[Abrir imagem em tamanho completo](docs/diagrama-logico-kennedy-vota.svg)** · **[Detalhes técnicos e regras](docs/ARQUITETURA.md)**

## 4. Organização do repositório

```text
sistema-escola/
├── README.md                          # Apresentação e links principais
├── .env.example                       # Nomes de variáveis, sem valores secretos
├── .gitignore                         # Evita versionar segredos locais
├── package.json                       # Dependências e comandos
├── server.js                          # API Express, sessões, regras, migração
├── render.yaml                        # Configuração declarativa do Render
├── public/
│   ├── index.html                     # Interface e CSS
│   ├── app.js                         # Lógica de navegação e chamadas API
│   ├── sw.js                          # Cache de arquivos públicos da PWA
│   ├── manifest.webmanifest           # Metadados de instalação
│   ├── icon.svg                       # Ícone
│   └── kennedy-escola-pixel-art.svg   # Ilustração
├── scripts/
│   └── generate-icons.mjs             # Gera ícones PNG no build
├── db/
│   └── kennedy-vota-schema.sql        # Referência de esquema (revisar versões)
├── docs/
│   ├── diagrama-logico-kennedy-vota.svg # Imagem oficial do diagrama
│   ├── ARQUITETURA.md                 # Componentes, tabelas, rotas e regras
│   ├── GUIA-DO-PROJETO.md             # Passo a passo completo
│   └── SEGURANCA.md                   # Dados confidenciais e limitações
└── netlify/ + netlify.toml            # Material de versões anteriores (legado)
```

**Nota:** arquivos de legado são preservados para referência; a aplicação atual é o **Render Web Service Node.js** descrito aqui, não o site estático anterior. A inicialização/migração do banco atualmente ocorre em `server.js`.

## 5. Como funciona a votação

1. A pessoa se cadastra como **aluno** ou **professor** (ou entra em uma conta já existente).
2. O **administrador autorizado** confere e aprova o cadastro.
3. O administrador cria uma eleição, inicialmente **Planejada**.
4. Cadastra **pelo menos dois candidatos** e clica em **Abrir** na lista de eleições.
5. Durante o período configurado, uma pessoa **aprovada e elegível** acessa **Área de votação**.
6. Escolhe o candidato e confirma; o servidor valida todas as regras antes de gravar.
7. A conta não pode votar duas vezes na mesma eleição. A apuração fica disponível após o encerramento.

Para configurar uma eleição de teste do início ao fim, consulte **[GUIA-DO-PROJETO.md](docs/GUIA-DO-PROJETO.md)**.

## 6. Instalar e executar localmente

Pré-requisitos: **Node.js 20+** e **PostgreSQL** acessível.

```bash
git clone https://github.com/joelvibecoder-wq/sistema-escola.git
cd sistema-escola
git checkout feature/google-login-animacoes-20261109
npm install
cp .env.example .env
# Preencha .env somente na sua máquina, sem publicar credenciais.
node --env-file=.env server.js
```

Abrir `http://localhost:10000`. Verificar `http://localhost:10000/api/status`; `ready: true` indica conexão com o banco. **Apenas copiar `.env.example` não configura o servidor**: é necessário definir as variáveis no arquivo privado.

Comandos úteis: `npm run check`, `npm run build`, `npm start`.

## 7. Configuração no Render

O serviço atual usa o `render.yaml` como referência. No ambiente privado do Render, configure:

| Variável | Uso | Pode publicar o valor? |
| --- | --- | --- |
| `DATABASE_URL` | String de conexão com PostgreSQL | **Não** |
| `SESSION_SECRET` | Assinatura das sessões JWT (mín. 32 caracteres) | **Não** |
| `ADMIN_SETUP_EMAIL` | E-mail autorizado para ativação inicial | **Não divulgar como dado pessoal** |
| `ADMIN_SETUP_TOKEN` | Código secreto de uso único (mín. 32 caracteres) | **Não** |
| `NODE_ENV` | `production` na hospedagem | Sim |
| `GOOGLE_CLIENT_ID` | Identificador OAuth web opcional | Publicável tecnicamente, mas configure com cuidado |
| `ADMIN_GOOGLE_EMAIL` | Endereço autorizado em fluxo Google legado/opcional | **Não divulgar como dado pessoal** |

**Nunca envie** credenciais a issues, commits, arquivos de documentação ou mensagens públicas. Configure-as exclusivamente em **Render → Environment** ou no `.env` privado local.

Mais detalhes em **[GUIA-DO-PROJETO.md](docs/GUIA-DO-PROJETO.md)** e **[SEGURANCA.md](docs/SEGURANCA.md)**.

## 8. Arquitetura resumida

```text
Navegador / PWA (HTML + CSS + JS)
        | HTTPS, /api e cookie de sessão
        v
Node.js / Express (Render Web Service)
        | autenticação e permissões
        | SQL / transações
        v
PostgreSQL (usuários, eleições, candidatos, participação, cédulas)
```

As cédulas não incluem a identidade direta do eleitor. Isso **não dispensa** uma auditoria completa de confidencialidade, logs e possíveis correlações.

## 9. Guias e referência

- **[Diagrama lógico em imagem](docs/diagrama-logico-kennedy-vota.svg)** — visão visual do fluxo inteiro.
- **[Guia do projeto](docs/GUIA-DO-PROJETO.md)** — uso, desenvolvimento, implantação e teste passo a passo.
- **[Arquitetura](docs/ARQUITETURA.md)** — módulos, banco de dados, API e regras de negócio.
- **[Segurança e privacidade](docs/SEGURANCA.md)** — proteção de contas e limites desta versão.
- **[Render](render.yaml)** — referência de infraestrutura, sem segredos.

### Situação do código e da publicação

A aplicação de teste em execução no Render acompanha a branch `feature/google-login-animacoes-20261109`. A branch `main` pode representar uma versão anterior até a integração do trabalho por pull request. Confirme sempre a branch antes de editar ou implantar.

---

**Projeto educacional experimental.** Sem garantia de adequação para eleições oficiais. Não há licença de software declarada neste repositório; não presuma uma licença sem aprovação de seu titular.

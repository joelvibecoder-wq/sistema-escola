<div align="center">

# 🗳️ Kennedy Vota
### Sistema de votação escolar · repositório e documentação

**Um projeto educacional para aprender sobre eleições escolares, desenvolvimento web e participação da comunidade.**

[**🌐 Acessar o Kennedy Vota**](https://kennedy-vota-app.onrender.com) · [**📂 Ver o código atualizado**](https://github.com/joelvibecoder-wq/sistema-escola/tree/feature/google-login-animacoes-20261109) · [**📖 Abrir documentação completa**](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/README.md)

</div>

> [!IMPORTANT]
> **Ambiente experimental.** Não usar em eleições oficiais sem auditoria de segurança, privacidade, disponibilidade e integridade. A aplicação atual está na branch `feature/google-login-animacoes-20261109`; a branch `main` mantém código de uma versão anterior.

## Apresentação do repositório

Este é o repositório público **[sistema-escola](https://github.com/joelvibecoder-wq/sistema-escola)**, que reúne o projeto **Kennedy Vota** e sua evolução. O sistema foi desenvolvido como experiência educativa e não é um serviço eleitoral oficial nem representa endosso formal de uma escola.

A versão atual conta com entrada por e-mail/senha, aprovação de cadastros por administrador, gestão de eleições, candidatos, área de votação, apuração após encerramento, modo escuro, interface para celular e PWA instalável.

### Links principais

| Item | Link |
| --- | --- |
| Sistema publicado (Render) | **https://kennedy-vota-app.onrender.com** |
| Código da versão atual | [Branch de desenvolvimento e publicação](https://github.com/joelvibecoder-wq/sistema-escola/tree/feature/google-login-animacoes-20261109) |
| README completo | [Apresentação + instalação](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/README.md) |
| Passo a passo | [Guia do projeto](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/docs/GUIA-DO-PROJETO.md) |
| Arquitetura | [Arquitetura, regras e dados](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/docs/ARQUITETURA.md) |
| Segurança | [Informações publicáveis e confidenciais](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/docs/SEGURANCA.md) |
| Diagrama lógico (imagem) | [Imagem PNG em tamanho completo](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/docs/fluxograma-logico-kennedy-vota.png) |

## Diagrama lógico do Kennedy Vota

[![Diagrama lógico do Kennedy Vota](https://raw.githubusercontent.com/joelvibecoder-wq/sistema-escola/refs/heads/feature/google-login-animacoes-20261109/docs/fluxograma-logico-kennedy-vota.png)](https://github.com/joelvibecoder-wq/sistema-escola/blob/feature/google-login-animacoes-20261109/docs/fluxograma-logico-kennedy-vota.png)

## Como o sistema funciona

1. Pessoa se cadastra como aluno/professor ou entra em conta existente.
2. Administração aprova o vínculo para votação.
3. Administração cria eleição **Planejada**, adiciona pelo menos dois candidatos e clica **Abrir**.
4. Pessoa aprovada e elegível vota dentro do prazo; o servidor impede voto duplicado.
5. Resultados são consultados após o encerramento.

## Tecnologias da aplicação atual

**HTML · CSS · JavaScript · Node.js · Express · PostgreSQL · PWA · GitHub · Render.**

O código atual de `server.js`, `public/app.js`, `render.yaml` e os guias técnicos ficam na **branch de publicação**. O conteúdo antigo presente em `main` é preservado para evitar alterações involuntárias no protótipo anterior e no fluxo de implantação já existente.

## Proteção de dados

Este repositório **não publica senhas, e-mails reais de usuários, cookies, tokens de ativação, segredos de sessão nem credenciais de banco**. Um `.env.example` com nomes e valores em branco está disponível na branch atual. As configurações verdadeiras pertencem somente ao ambiente privado do operador.

---

**Atenção:** não há licença de software declarada neste repositório. O projeto continua experimental e em processo de validação.

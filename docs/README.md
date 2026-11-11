# 📚 Documentação do Kennedy Vota

[← Voltar à apresentação do repositório](../README.md)

Esta pasta reúne as informações **públicas e não confidenciais** da versão atual do Kennedy Vota.

| Documento | Conteúdo |
| --- | --- |
| [Diagrama lógico em imagem](fluxograma-logico-kennedy-vota.png) | Fluxograma PNG original enviado pelo autor |
| [Guia do projeto](GUIA-DO-PROJETO.md) | Instalação, configuração, uso, teste, implantação e solução de problemas |
| [Arquitetura](ARQUITETURA.md) | Tecnologias, módulos, banco, rotas, autenticação e regras de votação |
| [Segurança e privacidade](SEGURANCA.md) | Dados publicáveis, informações privadas e limitações |
| [Configuração Render](CONFIGURACAO-RENDER-KENNEDY.md) | Referência atual para hospedagem e variáveis sem segredos |
| [Instalação e login](KENNEDY-VOTA-INSTALACAO-E-LOGIN.md) | Ponte de endereço antigo para o guia atualizado |
| [Versão vetorial anterior](diagrama-logico-kennedy-vota.svg) | Outra representação da arquitetura em formato SVG |
| [Fluxograma de compatibilidade](fluxograma-sistema.svg) | Versão vetorial anterior, preservada para compatibilidade |

## Endereços

- **Projeto no navegador:** https://kennedy-vota-app.onrender.com
- **Repositório:** https://github.com/joelvibecoder-wq/sistema-escola
- **Branch implantada:** `feature/google-login-animacoes-20261109`

## Importante

O código atual é **HTML/CSS/JavaScript puro + Node.js/Express + PostgreSQL**. Não utiliza React nem Bootstrap. O banco é gerenciado pelo backend atual; não é um sistema de votação offline. Não use o projeto em eleições oficiais antes de auditoria especializada.

**Nenhum arquivo da pasta contém senhas reais, tokens, sessão privada, string de conexão com credenciais ou listagens de e-mails de pessoas.**

# Instalação e login do Kennedy Vota

[← README](../README.md) · [Passo a passo completo](GUIA-DO-PROJETO.md) · [Diagrama](diagrama-logico-kennedy-vota.svg)

> Esta página mantém o endereço histórico do documento. O conteúdo antigo ficou desatualizado à medida que o Web Service, o PostgreSQL e a interface evoluíram. A versão consolidada está em **[GUIA-DO-PROJETO.md](GUIA-DO-PROJETO.md)**.

### Acessos públicos

- **Portal experimental:** https://kennedy-vota-app.onrender.com
- **Repositório:** https://github.com/joelvibecoder-wq/sistema-escola
- **Código do serviço atual:** branch `feature/google-login-animacoes-20261109`.

### Cadastro e entrada

1. Criar conta de aluno ou professor por e-mail/senha ou usar Google **quando configurado**.
2. Entrar em conta existente; a conta pode consultar o painel mesmo enquanto aguarda aprovação.
3. Administrador verifica e aprova o cadastro antes da participação em votos.
4. O acesso de administrador só pode ser ativado via autorização exclusiva configurada no servidor, não apenas pelo seletor de perfil.
5. No menu do canto superior direito é possível consultar idade opcional, trocar a senha com a senha atual e sair após confirmação.

### Instalar como aplicativo

- **Android:** navegador → menu → Instalar/Adicionar à tela inicial.
- **iPhone:** Safari → Compartilhar → Adicionar à Tela de Início.
- **Desktop:** Chrome ou Edge → menu → Instalar aplicativo, quando oferecido.

A PWA usa cache para a interface; **votar requer internet**.

Para configurar banco, ambiente e administrador, seguir o [guia atualizado](GUIA-DO-PROJETO.md). O projeto ainda não possui verificação automática de e-mail local nem recuperação completa de senha.

**Segurança:** [SEGURANCA.md](SEGURANCA.md). Não utilizar em eleições oficiais sem auditoria.

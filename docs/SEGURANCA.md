# Segurança, contas e dados confidenciais — Kennedy Vota

[← README](../README.md) · [Arquitetura](ARQUITETURA.md) · [Guia do projeto](GUIA-DO-PROJETO.md)

## O que pode ser público

- Endereço de acesso à interface: **https://kennedy-vota-app.onrender.com**.
- Código-fonte e documentação técnica que não contenham segredos.
- Nomes de bibliotecas, componentes, rotas e tecnologias.
- Diagrama lógico, estrutura de pastas e instruções com **valores fictícios**.
- Nomes das variáveis de ambiente, **nunca os valores reais**.

## O que NÃO colocar em GitHub, documentação, prints ou issues

| Informação | Tratamento |
| --- | --- |
| Senhas de alunos, professores e administradores | Não armazenar em texto, não divulgar |
| `ADMIN_SETUP_TOKEN` e códigos de ativação | Somente ambiente privado, gerar e rotacionar se houver exposição |
| `SESSION_SECRET`, cookies de sessão e tokens JWT | Nunca versionar |
| `DATABASE_URL` com senha do banco | Somente no Render/local privado |
| `GOOGLE_CLIENT_SECRET` (se existente) | Nunca divulgar |
| E-mails pessoais e relação de contas reais | Não publicar listagens, usar exemplos fictícios |
| Histórico individual de voto e dados pessoais | Não exportar como exemplo público |
| Arquivo `.env` preenchido | Ignorado pelo Git e restrito ao operador |

**E-mail administrativo** não equivale a senha, mas ainda é dado pessoal: não o incluímos nos documentos públicos. Os exemplos usam apenas campos vazios ou endereços fictícios.

## Proteções implementadas

- `bcryptjs` para armazenar o **hash de senha**, não a senha legível.
- JWT de sessão assinado em cookie `HttpOnly`, `SameSite=Lax`; em produção, cookie `Secure`.
- Rate limiting em login, cadastro, ativação administrativa e votação.
- Verificação de permissão no **servidor**, independente do botão que aparece na tela.
- Ativação administrativa inicial com e-mail autorizado, token longo e marcação de uso único no banco.
- Restrições de papel para criar e aprovar eleições e contas.
- Transação SQL com participação e cédula; chave primária composta em `kv_participation`.
- Requisições de mutação exigem cabeçalho e origem esperados.
- Apuração só após fim do período ou encerramento.

Essas proteções são parciais e **não equivalem a certificação nem auditoria eleitoral**.

## Limitações conhecidas

- E-mail/senha local não verifica o controle do endereço de e-mail.
- Não há fluxo completo e auditado de recuperação de conta.
- Falta revisão independente de proteção contra ataque, privacidade, acessibilidade, disponibilidade e coerção.
- Hospedagem gratuita pode ser inadequada para disponibilidade, backups e integridade exigidos em uma eleição oficial.
- Cédulas sem ID de usuário reduzem associação direta, mas podem existir **correlações temporais ou operacionais**.
- O campo idade é opcional, informado pela pessoa; não comprova idade nem autorização parental.

## Antes de uma eleição real

É necessário, no mínimo, verificação efetiva de identidade e elegibilidade, política de privacidade, minimização de dados pessoais, plano de backups e recuperação, auditoria independente do fluxo eleitoral, revisão de sigilo, controle de acesso administrativo e testes de concorrência, dispositivo e acessibilidade.

## Em caso de exposição de um segredo

1. Remova a exposição pública e trate o dado como comprometido.
2. **Troque/rotacione** o valor no serviço/identidade correspondente.
3. Revise logs, permissões e possíveis acessos indevidos.
4. Considere que apagar a última versão de um arquivo **não remove** o segredo do histórico Git; revise o histórico por meio apropriado e solicite auxílio técnico.
5. Se envolver dados pessoais, aplique os procedimentos de privacidade e notificação pertinentes.

**Este repositório é público.** O diagrama, README e guias não contém credenciais nem listagens de usuários reais.

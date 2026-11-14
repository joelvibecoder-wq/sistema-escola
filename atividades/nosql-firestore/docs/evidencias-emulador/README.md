# Evidências automáticas — Firestore Emulator

Imagens geradas a partir de **logs reais de testes de integração** do Firebase Admin SDK com o **emulador oficial** do Firestore, usando apenas dados fictícios.

| Etapa | Evidência | Conteúdo |
|---|---|---|
| Conexão | [01-conexao.png](01-conexao.png) | Conexão ao emulador local |
| CREATE | [02-create.png](02-create.png) | Criação de três documentos |
| READ | [03-read.png](03-read.png) | Listagem de registros |
| UPDATE | [04-update.png](04-update.png) | Mudança da turma e do campo ativo |
| Turma | [05-consulta-turma.png](05-consulta-turma.png) | Filtro turma == 3DSB |
| Nascimento | [06-consulta-nascimento.png](06-consulta-nascimento.png) | Filtro dataNascimento == 2009-05-15 |
| Período | [07-consulta-periodo.png](07-consulta-periodo.png) | Consulta de intervalo de nascimento |
| DELETE | [08-delete.png](08-delete.png) | Exclusão de um documento |
| Testes | [09-resumo.png](09-resumo.png) | Resultado final da execução |

**Aviso:** o emulador não é o Cloud Firestore real; as imagens não substituem capturas do projeto Firebase real exigidas pelo professor. Não há credenciais neste repositório.

# Atividade — Banco de Dados NoSQL | CRUD com Firebase Cloud Firestore

Projeto didático desenvolvido em **Node.js**, usando **Firebase Admin SDK** e a coleção NoSQL `alunos`.

> **Situação:** código preparado e testado em modo local. Para operar com o Firestore, crie um projeto Firebase e configure as credenciais localmente. Não há credenciais embutidas neste repositório.

## Objetivo e requisitos atendidos

| Requisito | Implementação |
|---|---|
| CREATE | Criar documento na coleção `alunos` |
| READ | Listar e buscar por ID |
| UPDATE | Atualizar nome, turma, nascimento e ativo |
| DELETE | Excluir aluno após confirmação |
| Consulta por turma | Filtro `where('turma', '==', ...)` |
| Consulta por nascimento | Filtro por data exata e por intervalo |
| Interface | Menu interativo no terminal |
| Segurança | Admin SDK no servidor; credencial mantida fora do GitHub |

## Estrutura dos documentos

A coleção `alunos` possui documentos com IDs automáticos e campos:

```json
{
  "nome": "Ana Silva",
  "turma": "3DSB",
  "dataNascimento": "2009-05-15",
  "ativo": true
}
```

Tipos: `nome` (**string**), `turma` (**string**), `dataNascimento` (**string** em formato `AAAA-MM-DD`) e `ativo` (**boolean**). Datas ISO como string permitem comparação lexicográfica para intervalos, desde que todos os dados sigam o mesmo padrão.

## Requisitos locais

- Node.js **20 ou superior**;
- uma conta com acesso ao [Firebase Console](https://console.firebase.google.com/);
- projeto com **Cloud Firestore** ativado;
- uma credencial de conta de serviço para desenvolvimento local, armazenada **fora** da pasta do repositório (ou outro método ADC autorizado).

## Como executar com Firestore real

1. No Firebase Console, crie/abra um projeto e ative **Firestore Database**. Escolha o banco padrão e as configurações adequadas.
2. No Firebase Console, acesse **Configurações do projeto → Contas de serviço → Gerar nova chave privada**. Guarde o JSON em um local seguro fora da pasta do projeto. **Não faça upload dessa chave.**
3. Abra o terminal dentro da pasta do projeto e instale as dependências:

   ```bash
   npm install
   ```

4. Informe o caminho completo da credencial e o ID do projeto. No **Windows PowerShell**:

   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\credenciais\\serviceAccountKey.json"
   $env:FIREBASE_PROJECT_ID="SEU_ID_FIREBASE"
   npm start
   ```

   No **Linux/macOS**:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/caminho/seguro/serviceAccountKey.json"
   export FIREBASE_PROJECT_ID="SEU_ID_FIREBASE"
   npm start
   ```

   Substitua os exemplos pelo caminho real e pelo ID do seu projeto. Alternativamente, em ambientes Google configurados, use Application Default Credentials.
5. Escolha uma opção do menu no terminal. O Firestore criará a coleção `alunos` quando for gravado o primeiro documento.
6. Confira os documentos no **Firebase Console → Firestore Database → Dados**.

> O Firebase Admin SDK possui privilégios elevados. Execute somente em ambiente de servidor ou terminal sob seu controle. Nunca coloque uma chave de serviço em HTML/JavaScript do navegador nem em repositório público.

## Menu de opções

```text
1 - CREATE: cadastrar aluno
2 - READ: listar alunos
3 - READ: buscar aluno por ID
4 - UPDATE: atualizar aluno
5 - DELETE: excluir aluno
6 - CONSULTA: filtrar por turma
7 - CONSULTA: filtrar por nascimento exato
8 - CONSULTA: filtrar por período de nascimento
0 - Sair
```

## Testes e demonstração sem acesso ao Firebase

```bash
npm test
npm run demo
```

`npm test` valida as regras de dados e as operações em memória. `npm run demo` inicia um menu com três alunos fictícios, mas **não se conecta ao Firebase e não salva dados permanentemente**. Esse modo existe para estudar o fluxo antes de configurar a nuvem. Para entregar capturas que comprovem o exercício com Firestore, execute `npm start` com credenciais válidas.

## Consultas utilizadas

```javascript
// Turma específica
alunos.where('turma', '==', '3DSB').get();

// Nascimento exato
alunos.where('dataNascimento', '==', '2009-05-15').get();

// Datas de nascimento entre dois dias (inclusive)
alunos.where('dataNascimento', '>=', '2009-01-01')
      .where('dataNascimento', '<=', '2009-12-31').get();
```

As operações de atualização e exclusão exigem o ID do documento. O projeto valida os formatos, recusa datas inexistentes e pede confirmação antes de excluir.

## Comprovação para o Google Sala de Aula

Siga o [roteiro de evidências](docs/EVIDENCIAS.md): conexão, criação, listagem, atualização, exclusão, consulta por turma, consulta por nascimento exato e consulta por período. Use **apenas dados fictícios**.

Envie o link do repositório (ou da pasta deste projeto dentro dele) e as capturas de tela verdadeiras do funcionamento. Não publique a chave privada `serviceAccountKey.json`.

## Referências

- [Inicialização do Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Firestore — bibliotecas de servidor](https://firebase.google.com/docs/firestore/quickstart-server)
- [Consultas no Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/queries)

---

**Projeto educacional:** não usa dados pessoais reais e não precisa de acesso a outro sistema escolar.

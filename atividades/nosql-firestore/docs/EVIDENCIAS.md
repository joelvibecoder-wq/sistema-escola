# Roteiro para as capturas de tela exigidas

**Importante:** as capturas devem mostrar operações executadas com **Firestore real** para comprovar a atividade. O modo `npm run demo` é apenas uma simulação local e não substitui a evidência de conexão ao Firebase.

1. **Conexão Firebase:** Console Firebase com o banco Cloud Firestore criado. Oculte identificadores que não deseja compartilhar.
2. **CREATE:** terminal após opção 1 com confirmação de cadastro; e documento correspondente na coleção `alunos`.
3. **READ:** opção 2 exibindo a tabela de alunos.
4. **UPDATE:** opção 4 mostrando o mesmo ID com dados alterados.
5. **DELETE:** opção 5 com confirmação e lista sem o documento excluído.
6. **Consulta por turma:** opção 6 usando `3DSB` (dados fictícios).
7. **Consulta por nascimento:** opção 7 para `2009-05-15` e opção 8 para intervalo de datas.

Salve, se desejar, as imagens `01-firebase.png`, `02-criar.png`, `03-listar.png`, `04-atualizar.png`, `05-excluir.png`, `06-turma.png`, `07-nascimento.png` e `08-periodo.png` na pasta `docs/evidencias/`.

Nunca capture nem publique conteúdo de `serviceAccountKey.json`, tokens, senhas, dados reais de estudantes ou outras credenciais.

## Testes automáticos já preparados

O projeto também possui [evidências demonstrativas no Firestore Emulator](evidencias-emulador/README.md), com logs verdadeiros de CRUD via SDK, mas essas imagens **não substituem** provas de conexão ao Firebase Cloud Firestore real.

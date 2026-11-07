# Eleição Escolar

Aplicação web educacional para simular eleições no ambiente escolar, incluindo eleições para **direção escolar** e **pedagogia**, além de outros formatos de votação de teste.

> **Aviso:** este projeto é uma simulação para fins educacionais. Não é um sistema oficial, não tem validade eleitoral e não deve ser usado para eleições reais. Utilize apenas informações fictícias.

## Acesso ao projeto

- **Aplicação publicada:** https://sistema-escola-p7xy.onrender.com
- **Repositório GitHub:** https://github.com/joelvibecoder-wq/sistema-escola
- **Hospedagem:** Render Static Site
- **Branch de publicação:** `main`
- **Diretório publicado:** `public/`

O Render está configurado para iniciar uma implantação automaticamente quando há alterações na branch `main`.

## Sobre o sistema

O Eleição Escolar reúne uma interface de simulação eleitoral com páginas para acompanhar a visão geral, escolher candidaturas de teste, consultar apuração ilustrativa, visualizar urnas fictícias e administrar registros.

A interface possui layout responsivo, modo claro/escuro e recursos de instalação como PWA.

### Funcionalidades da interface

- Tela de cadastro e entrada para acesso à interface.
- Painel de visão geral.
- Área de votação de teste com candidaturas fictícias.
- Apuração ilustrativa e gráficos de resultados.
- Resumo de urnas de demonstração.
- Área de administração para criar e gerenciar eleições.
- CRUD de registros: criação, listagem, pesquisa, edição e exclusão.
- Página de cadastro do perfil.
- Navegação lateral, modo claro/escuro e adaptação para celular e computador.

## Organização dos arquivos

```text
sistema-escola/
├── public/
│   ├── index.html             # Interface, estilos e lógica do navegador
│   ├── manifest.webmanifest   # Configuração da PWA
│   ├── sw.js                  # Service worker
│   └── icon.svg               # Ícone da aplicação
├── docs/
│   └── fluxograma-sistema.svg # Fluxograma do sistema
├── package.json               # Metadados e dependências do projeto
├── server.js                  # API de servidor (implementação em desenvolvimento)
├── render.yaml                # Configuração declarativa do Render
└── README.md                 # Documentação principal
```

> A estrutura pode evoluir conforme a integração do backend e do armazenamento remoto for concluída.

## Como usar a interface

1. Abra o [Eleição Escolar publicado](https://sistema-escola-p7xy.onrender.com).
2. Faça o cadastro ou entre pela tela inicial.
3. Use o menu lateral para navegar pelas áreas.
4. Na área **Administração**, utilize o painel de criação de eleição para informar nome, modalidade, município, UF, período e descrição.
5. Use os controles de administração para consultar e gerenciar as eleições e registros de teste.
6. Na área de votação, escolha uma candidatura fictícia e finalize a simulação.

### Modalidades disponíveis na interface

- Grêmio estudantil
- Representante de turma
- Direção escolar
- Simulação livre

## Tecnologias

- HTML
- CSS
- JavaScript
- Progressive Web App (PWA): manifest e service worker
- GitHub: versionamento do código
- Render: publicação da interface

O repositório também contém arquivos para uma API de servidor e uma configuração declarativa do Render. A integração dessas partes com o fluxo da interface e com o banco de dados precisa ser validada antes de considerar o sistema pronto para uso com dados persistentes.

## Dados, autenticação e persistência

O estado atual da interface utiliza mecanismos de demonstração no navegador. O cadastro e a entrada presentes na página não devem ser considerados autenticação segura de usuários. Alguns dados de administração e votos de teste são mantidos no armazenamento local do navegador.

- O armazenamento local não sincroniza automaticamente entre dispositivos ou navegadores.
- Limpar os dados do navegador pode remover registros locais.
- Os números e resultados de demonstração não representam uma eleição oficial.
- Não insira senhas reais, dados pessoais ou informações institucionais sensíveis.

**Firebase:** a conexão completa com Firebase Authentication e Firestore, incluindo regras de segurança e persistência compartilhada, deve ser concluída e testada antes de afirmar que os dados são salvos em uma base remota. A presença de arquivos de servidor ou de configuração de hospedagem, por si só, não confirma essa integração.

## Fluxograma

![Fluxograma do sistema Eleição Escolar](docs/fluxograma-sistema.svg)

## Publicação no Render

O serviço está configurado como um **Static Site**, com a pasta `public/` como diretório publicado.

Para atualizar a interface:

1. Faça as alterações no repositório.
2. Envie um commit para a branch `main`.
3. O Render inicia o deploy automaticamente.
4. Confira o estado da implantação no [painel do Render](https://dashboard.render.com/static/srv-dbmefeifngtc73f4te00).

## Segurança e uso responsável

- Use exclusivamente dados fictícios durante testes.
- Não reutilize senhas de e-mail, contas escolares ou outros serviços.
- Não publique chaves privadas, tokens ou credenciais.
- Não utilize esta versão para registrar votos reais.
- Antes de uso com pessoas reais, é necessário implementar e auditar autenticação, regras de acesso, persistência, integridade dos votos, prevenção de duplicidade e proteção de dados.

## Contexto escolar

Projeto educacional desenvolvido com referência ao Colégio Estadual Presidente Kennedy. A menção à instituição é contextual e não significa que o sistema seja um serviço oficial ou que a escola endosse a aplicação.

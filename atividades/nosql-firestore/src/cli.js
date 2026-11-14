import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { criarRepositorioMemoria } from './memory.js';

const demonstracao = process.argv.includes('--demo');
let repo;
if (demonstracao) {
  repo = criarRepositorioMemoria();
  console.log('\n*** MODO DEMONSTRAÇÃO LOCAL: os dados NÃO são gravados no Firestore. ***\n');
  await repo.criar({ nome: 'Ana Silva', turma: '3DSB', dataNascimento: '2009-05-15', ativo: true });
  await repo.criar({ nome: 'Bruno Costa', turma: '3DSB', dataNascimento: '2008-11-21', ativo: true });
  await repo.criar({ nome: 'Carla Souza', turma: '2DSA', dataNascimento: '2009-05-15', ativo: false });
} else {
  try {
    const { conectarFirestore } = await import('./firebase.js');
    const { criarRepositorioFirestore } = await import('./repository.js');
    repo = criarRepositorioFirestore(conectarFirestore());
    console.log('\nProjeto Firebase iniciado. As operações usarão o Firestore configurado.');
  } catch (erro) {
    console.error('Erro na configuração do Firebase:', erro.message);
    console.error('Configure GOOGLE_APPLICATION_CREDENTIALS e FIREBASE_PROJECT_ID. Consulte o README.');
    process.exit(1);
  }
}

const rl = createInterface({ input, output });

async function perguntar(rotulo, valorPadrao = '') {
  const sufixo = valorPadrao !== '' ? ` [${valorPadrao}]` : '';
  const resposta = (await rl.question(`${rotulo}${sufixo}: `)).trim();
  return resposta || String(valorPadrao);
}

async function lerAluno(anterior = {}) {
  const nome = await perguntar('Nome', anterior.nome ?? '');
  const turma = await perguntar('Turma', anterior.turma ?? '');
  const dataNascimento = await perguntar('Nascimento (AAAA-MM-DD)', anterior.dataNascimento ?? '');
  const atual = anterior.ativo === undefined ? 's' : anterior.ativo ? 's' : 'n';
  const resposta = (await perguntar('Ativo? (s/n)', atual)).toLowerCase();
  if (!['s', 'n'].includes(resposta)) throw new Error('Responda s ou n para o campo ativo.');
  return { nome, turma, dataNascimento, ativo: resposta === 's' };
}

function mostrar(lista) {
  if (!lista.length) return console.log('Nenhum aluno encontrado.');
  console.table(lista.map(a => ({
    ID: a.id, Nome: a.nome, Turma: a.turma,
    Nascimento: a.dataNascimento, Ativo: a.ativo ? 'Sim' : 'Não'
  })));
}

function exibirMenu() {
  console.log('\n===== CRUD NoSQL - COLEÇÃO alunos =====');
  console.log('1 - CREATE: cadastrar aluno');
  console.log('2 - READ: listar alunos');
  console.log('3 - READ: buscar aluno por ID');
  console.log('4 - UPDATE: atualizar aluno');
  console.log('5 - DELETE: excluir aluno');
  console.log('6 - CONSULTA: filtrar por turma');
  console.log('7 - CONSULTA: filtrar por nascimento exato');
  console.log('8 - CONSULTA: filtrar por período de nascimento');
  console.log('0 - Sair');
}

try {
  while (true) {
    exibirMenu();
    const opcao = await perguntar('Escolha uma opção');
    if (opcao === '0') { console.log('Programa encerrado.'); break; }
    try {
      switch (opcao) {
        case '1': {
          const aluno = await repo.criar(await lerAluno());
          console.log('Aluno cadastrado com sucesso!'); mostrar([aluno]); break;
        }
        case '2': mostrar(await repo.listar()); break;
        case '3': {
          const aluno = await repo.buscar(await perguntar('ID do documento'));
          mostrar(aluno ? [aluno] : []); break;
        }
        case '4': {
          const id = await perguntar('ID do documento a atualizar');
          const anterior = await repo.buscar(id);
          if (!anterior) { console.log('Aluno não encontrado.'); break; }
          const aluno = await repo.atualizar(id, await lerAluno(anterior));
          console.log('Aluno atualizado com sucesso!'); mostrar([aluno]); break;
        }
        case '5': {
          const id = await perguntar('ID do documento a excluir');
          const anterior = await repo.buscar(id);
          if (!anterior) { console.log('Aluno não encontrado.'); break; }
          mostrar([anterior]);
          if ((await perguntar('Confirmar exclusão definitiva? (s/n)', 'n')).toLowerCase() !== 's') {
            console.log('Exclusão cancelada.'); break;
          }
          console.log((await repo.excluir(id)) ? 'Aluno excluído com sucesso!' : 'Aluno não encontrado.');
          break;
        }
        case '6': mostrar(await repo.consultarTurma(await perguntar('Turma (ex.: 3DSB)'))); break;
        case '7': mostrar(await repo.consultarNascimento(await perguntar('Data (AAAA-MM-DD)'))); break;
        case '8': {
          const inicio = await perguntar('Data inicial (AAAA-MM-DD)');
          const fim = await perguntar('Data final (AAAA-MM-DD)');
          mostrar(await repo.consultarPeriodoNascimento(inicio, fim)); break;
        }
        default: console.log('Opção inválida.');
      }
    } catch (erro) {
      console.error('Falha:', erro.message);
      if (!demonstracao && (erro.code === 7 || erro.code === 16)) {
        console.error('Confira a conexão, a permissão da conta de serviço e a ativação do Firestore.');
      }
    }
  }
} finally {
  rl.close();
}

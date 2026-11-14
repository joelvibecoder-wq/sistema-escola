/**
 * Prova de funcionamento usando o EMULADOR OFICIAL do Firestore.
 * NÃO realiza chamadas ao Cloud Firestore real nem precisa de chave privada.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { conectarFirestore } from '../src/firebase.js';
import { criarRepositorioFirestore } from '../src/repository.js';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('Segurança: defina FIRESTORE_EMULATOR_HOST. Este script NÃO deve operar em produção.');
}
if (!String(process.env.FIREBASE_PROJECT_ID || '').startsWith('demo-')) {
  throw new Error('Segurança: FIREBASE_PROJECT_ID deve iniciar com demo-.');
}
const pasta = new URL('../docs/evidencias-emulador/', import.meta.url);
await mkdir(pasta, { recursive: true });
const db = conectarFirestore();
const repo = criarRepositorioFirestore(db);

async function registrar(nome, titulo, linhas) {
  const saida = [
    `MODO: EMULADOR OFICIAL FIRESTORE (não é nuvem)`,
    `PROJETO FICTÍCIO: ${process.env.FIREBASE_PROJECT_ID}`,
    `COLEÇÃO: alunos`,
    '',
    `ETAPA: ${titulo}`,
    ...linhas,
  ].join('\n');
  console.log(`\n${'='.repeat(70)}\n${saida}\n`);
  await writeFile(new URL(`${nome}.txt`, pasta), `${saida}\n`, 'utf8');
}
function detalhe(a) {
  return `ID: ${a.id} | Nome: ${a.nome} | Turma: ${a.turma} | Nascimento: ${a.dataNascimento} | Ativo: ${a.ativo}`;
}
try {
  await registrar('01-conexao', 'CONEXÃO AO EMULADOR', [
    `HOST: ${process.env.FIRESTORE_EMULATOR_HOST}`,
    'Conectado à API local do Firestore através do Firebase Admin SDK.',
    'Sem dados pessoais e sem chave de produção.',
  ]);

  const ana = await repo.criar({ nome: 'Ana Silva', turma: '3DSB', dataNascimento: '2009-05-15', ativo: true });
  const bruno = await repo.criar({ nome: 'Bruno Costa', turma: '3DSB', dataNascimento: '2008-11-21', ativo: true });
  const carla = await repo.criar({ nome: 'Carla Souza', turma: '2DSA', dataNascimento: '2009-05-15', ativo: false });
  await registrar('02-create', 'CREATE - CADASTRAR ALUNOS', ['3 documentos adicionados com sucesso:', detalhe(ana), detalhe(bruno), detalhe(carla)]);

  let alunos = await repo.listar();
  if (alunos.length !== 3) throw Error('Falha READ: quantidade inesperada.');
  await registrar('03-read', 'READ - LISTAR ALUNOS', [`Total de alunos: ${alunos.length}`, ...alunos.map(detalhe)]);

  const atualizado = await repo.atualizar(bruno.id, { turma: '3DSC', ativo: false });
  if (atualizado.turma !== '3DSC' || atualizado.ativo !== false) throw Error('Falha UPDATE');
  await registrar('04-update', 'UPDATE - ATUALIZAR ALUNO', ['Aluno atualizado com sucesso:', detalhe(atualizado)]);

  const turma = await repo.consultarTurma('3DSB');
  if (turma.length !== 1 || turma[0].id !== ana.id) throw Error('Falha na consulta por turma.');
  await registrar('05-consulta-turma', 'CONSULTA - TURMA 3DSB', [`Resultados encontrados: ${turma.length}`, ...turma.map(detalhe)]);

  const nascimento = await repo.consultarNascimento('2009-05-15');
  if (nascimento.length !== 2) throw Error('Falha na consulta por data.');
  await registrar('06-consulta-nascimento', 'CONSULTA - NASCIMENTO 2009-05-15', [`Resultados encontrados: ${nascimento.length}`, ...nascimento.map(detalhe)]);

  const periodo = await repo.consultarPeriodoNascimento('2009-01-01', '2009-12-31');
  if (periodo.length !== 2) throw Error('Falha na consulta por intervalo.');
  await registrar('07-consulta-periodo', 'CONSULTA - NASCIMENTO ENTRE 2009-01-01 E 2009-12-31', [`Resultados encontrados: ${periodo.length}`, ...periodo.map(detalhe)]);

  const apagado = await repo.excluir(carla.id);
  alunos = await repo.listar();
  if (!apagado || alunos.length !== 2 || await repo.buscar(carla.id) !== null) throw Error('Falha DELETE');
  await registrar('08-delete', 'DELETE - EXCLUIR ALUNO', [
    'Exclusão concluída no Firestore Emulator.',
    `ID removido: ${carla.id}`,
    `Quantidade restante: ${alunos.length}`,
    ...alunos.map(detalhe),
  ]);
  await registrar('09-resumo', 'RESULTADO FINAL DOS TESTES', [
    'CREATE: PASSOU', 'READ: PASSOU', 'UPDATE: PASSOU', 'DELETE: PASSOU',
    'CONSULTA POR TURMA: PASSOU', 'CONSULTA POR NASCIMENTO: PASSOU',
    'CONSULTA POR PERÍODO: PASSOU',
    'Todos os testes foram feitos no emulador do Firestore.',
  ]);
} finally {
  await db.terminate();
}

import { validarAluno, validarDataNascimento, validarId, validarTurma } from './validation.js';

const converter = doc => ({ id: doc.id, ...doc.data() });
const organizar = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');

export function criarRepositorioFirestore(db) {
  const alunos = db.collection('alunos');

  return {
    async criar(dados) {
      const aluno = validarAluno(dados);
      const ref = await alunos.add(aluno);
      return { id: ref.id, ...aluno };
    },
    async listar() {
      const snap = await alunos.get();
      return snap.docs.map(converter).sort(organizar);
    },
    async buscar(id) {
      const snap = await alunos.doc(validarId(id)).get();
      return snap.exists ? converter(snap) : null;
    },
    async atualizar(id, dados) {
      const ref = alunos.doc(validarId(id));
      const atual = await ref.get();
      if (!atual.exists) return null;
      const atualizado = validarAluno({ ...atual.data(), ...dados });
      await ref.update(atualizado);
      return { id: ref.id, ...atualizado };
    },
    async excluir(id) {
      const ref = alunos.doc(validarId(id));
      const atual = await ref.get();
      if (!atual.exists) return false;
      await ref.delete();
      return true;
    },
    async consultarTurma(turma) {
      const snap = await alunos.where('turma', '==', validarTurma(turma)).get();
      return snap.docs.map(converter).sort(organizar);
    },
    async consultarNascimento(data) {
      const snap = await alunos.where('dataNascimento', '==', validarDataNascimento(data)).get();
      return snap.docs.map(converter).sort(organizar);
    },
    async consultarPeriodoNascimento(inicio, fim) {
      inicio = validarDataNascimento(inicio);
      fim = validarDataNascimento(fim);
      if (inicio > fim) throw new Error('Data inicial não pode ser posterior à final.');
      const snap = await alunos.where('dataNascimento', '>=', inicio)
        .where('dataNascimento', '<=', fim).get();
      return snap.docs.map(converter).sort((a, b) =>
        a.dataNascimento.localeCompare(b.dataNascimento) || organizar(a, b));
    }
  };
}

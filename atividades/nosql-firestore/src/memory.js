import { validarAluno, validarDataNascimento, validarId, validarTurma } from './validation.js';

// Implementação apenas para DEMONSTRAÇÃO LOCAL: NÃO acessa o Firestore.
export function criarRepositorioMemoria() {
  const registros = new Map();
  let contador = 0;
  const ordenar = dados => dados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return {
    async criar(dados) {
      const aluno = validarAluno(dados);
      const id = `demo${String(++contador).padStart(3, '0')}`;
      registros.set(id, aluno);
      return { id, ...aluno };
    },
    async listar() {
      return ordenar([...registros].map(([id, aluno]) => ({ id, ...aluno })));
    },
    async buscar(id) {
      id = validarId(id);
      return registros.has(id) ? { id, ...registros.get(id) } : null;
    },
    async atualizar(id, dados) {
      id = validarId(id);
      const anterior = registros.get(id);
      if (!anterior) return null;
      const aluno = validarAluno({ ...anterior, ...dados });
      registros.set(id, aluno);
      return { id, ...aluno };
    },
    async excluir(id) { return registros.delete(validarId(id)); },
    async consultarTurma(turma) {
      turma = validarTurma(turma);
      return (await this.listar()).filter(a => a.turma === turma);
    },
    async consultarNascimento(data) {
      data = validarDataNascimento(data);
      return (await this.listar()).filter(a => a.dataNascimento === data);
    },
    async consultarPeriodoNascimento(inicio, fim) {
      inicio = validarDataNascimento(inicio);
      fim = validarDataNascimento(fim);
      if (inicio > fim) throw new Error('Data inicial não pode ser posterior à final.');
      return (await this.listar()).filter(a => a.dataNascimento >= inicio && a.dataNascimento <= fim)
        .sort((a, b) => a.dataNascimento.localeCompare(b.dataNascimento) || a.nome.localeCompare(b.nome, 'pt-BR'));
    }
  };
}

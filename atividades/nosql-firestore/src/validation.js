export function validarNome(valor) {
  const nome = String(valor ?? '').trim().replace(/\s+/g, ' ');
  if (nome.length < 2 || nome.length > 80) throw new Error('O nome deve ter de 2 a 80 caracteres.');
  return nome;
}

export function validarTurma(valor) {
  const turma = String(valor ?? '').trim().replace(/\s+/g, ' ');
  if (turma.length < 1 || turma.length > 30) throw new Error('A turma deve ter de 1 a 30 caracteres.');
  return turma;
}

export function validarDataNascimento(valor) {
  const data = String(valor ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Use uma data no formato AAAA-MM-DD.');
  const instante = new Date(`${data}T00:00:00Z`);
  if (Number.isNaN(instante.getTime()) || instante.toISOString().slice(0, 10) !== data) {
    throw new Error('Data de nascimento inexistente.');
  }
  return data;
}

export function validarAluno({ nome, turma, dataNascimento, ativo }) {
  if (typeof ativo !== 'boolean') throw new Error('O campo ativo deve ser verdadeiro ou falso.');
  return {
    nome: validarNome(nome),
    turma: validarTurma(turma),
    dataNascimento: validarDataNascimento(dataNascimento),
    ativo
  };
}

export function validarId(id) {
  const valor = String(id ?? '').trim();
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(valor)) throw new Error('ID de documento inválido.');
  return valor;
}

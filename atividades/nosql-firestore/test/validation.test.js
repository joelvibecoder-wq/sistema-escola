import test from 'node:test';
import assert from 'node:assert/strict';
import { validarAluno, validarDataNascimento, validarNome, validarTurma } from '../src/validation.js';

test('valida aluno com os tipos do Firestore', () => {
  const aluno = validarAluno({ nome:' Ana  Silva ', turma:'3DSB', dataNascimento:'2009-05-15', ativo:true });
  assert.deepEqual(aluno, { nome:'Ana Silva', turma:'3DSB', dataNascimento:'2009-05-15', ativo:true });
});

test('rejeita data inexistente ou fora do formato', () => {
  assert.throws(() => validarDataNascimento('2009-02-29'));
  assert.throws(() => validarDataNascimento('15/05/2009'));
  assert.equal(validarDataNascimento('2008-02-29'),'2008-02-29');
});

test('rejeita nome, turma e ativo inválidos', () => {
  assert.throws(() => validarNome('a'));
  assert.throws(() => validarTurma(''));
  assert.throws(() => validarAluno({nome:'Ana',turma:'3DSB',dataNascimento:'2009-05-15',ativo:'true'}));
});

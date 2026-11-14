import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRepositorioMemoria } from '../src/memory.js';

test('CRUD e consultas por turma, data e período no modo local', async () => {
  const db = criarRepositorioMemoria();
  const ana = await db.criar({nome:'Ana Silva',turma:'3DSB',dataNascimento:'2009-05-15',ativo:true});
  const bruno = await db.criar({nome:'Bruno Costa',turma:'3DSB',dataNascimento:'2008-11-21',ativo:true});
  const carla = await db.criar({nome:'Carla Souza',turma:'2DSA',dataNascimento:'2009-05-15',ativo:false});
  assert.equal((await db.listar()).length,3);
  assert.equal((await db.buscar(ana.id)).nome,'Ana Silva');
  assert.equal((await db.consultarTurma('3DSB')).length,2);
  assert.equal((await db.consultarNascimento('2009-05-15')).length,2);
  assert.equal((await db.consultarPeriodoNascimento('2009-01-01','2009-12-31')).length,2);
  assert.equal((await db.atualizar(bruno.id,{ativo:false})).ativo,false);
  assert.equal(await db.excluir(carla.id),true);
  assert.equal((await db.listar()).length,2);
  assert.equal(await db.excluir(carla.id),false);
  await assert.rejects(db.consultarPeriodoNascimento('2010-01-01','2009-01-01'));
});

import express from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const {Pool}=pg;
const app=express(), port=Number(process.env.PORT||10000);
const secret=process.env.SESSION_SECRET||"";
const db=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:6,connectionTimeoutMillis:8000}):null;
const google=new OAuth2Client();
let dbReady=false;
const publicDir=path.join(path.dirname(fileURLToPath(import.meta.url)),"public");
app.disable("x-powered-by");
app.set("trust proxy",1);
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options","DENY");
  if(process.env.RENDER||process.env.NODE_ENV==="production")res.setHeader("Strict-Transport-Security","max-age=15552000");
  if(req.path.startsWith("/api/"))res.setHeader("Cache-Control","no-store");
  next();
});
app.use(express.json({limit:"32kb"}));
function error(res,status,message){return res.status(status).json({error:message});}
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const limitAuth=rateLimit({windowMs:15*60*1000,limit:15,standardHeaders:"draft-7",legacyHeaders:false});
const limitVote=rateLimit({windowMs:60*1000,limit:12,standardHeaders:"draft-7",legacyHeaders:false});
function text(x,max=160){return String(x??"").trim().slice(0,max);}
function validEmail(x){return typeof x==="string"&&x.length<=254&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x);}
function jsonUser(u){return {id:u.id,name:u.full_name,email:u.email,requestedRole:u.requested_role,role:u.role,approved:u.approved};}
const cname="kennedy_session";
function setCookie(res,id){
  if(secret.length<32)throw Error("SESSION_SECRET não configurado");
  const token=jwt.sign({sub:id},secret,{expiresIn:"8h",issuer:"kennedy-vota",audience:"kennedy-web",algorithm:"HS256"});
  res.setHeader("Set-Cookie",cname+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800"+((process.env.RENDER||process.env.NODE_ENV==="production")?"; Secure":""));
}
function clearCookie(res){res.setHeader("Set-Cookie",cname+"=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"+((process.env.RENDER||process.env.NODE_ENV==="production")?"; Secure":""));}
function getCookie(req){const raw=(req.headers.cookie||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(cname+"="));return raw?decodeURIComponent(raw.slice(cname.length+1)):"";}
function available(req,res,next){if(!db||!dbReady||secret.length<32)return error(res,503,"Sistema em configuração: conexão segura com o banco indisponível.");next();}
async function logged(req,res,next){
 try{
  const p=jwt.verify(getCookie(req),secret,{algorithms:["HS256"],issuer:"kennedy-vota",audience:"kennedy-web"});
  const {rows}=await db.query("SELECT id,full_name,email,requested_role,role,approved FROM kv_users WHERE id=$1",[p.sub]);
  if(!rows.length)return error(res,401,"Sua sessão expirou.");
  req.current=rows[0];next();
 }catch{return error(res,401,"Entre na sua conta para continuar.");}
}
function admin(req,res,next){if(req.current.approved!==true||req.current.role!=="admin")return error(res,403,"Acesso restrito à administração.");next();}
function approved(req,res,next){if(!req.current.approved)return error(res,403,"Cadastro aguardando aprovação.");next();}
function eligibleToVote(role,allowedRoles){return Array.isArray(allowedRoles)&&(allowedRoles.includes(role)||(role==="admin"&&allowedRoles.includes("professor")));}
function sameOrigin(req,res,next){
  const origin=req.get("origin");
  // O cabeçalho customizado impede envios por formulário cross-site (CSRF).
  if(req.get("x-kennedy-request")!=="1")return error(res,403,"Requisição não autorizada.");
  if(origin&&origin!==(req.protocol+"://"+req.get("host")))return error(res,403,"Origem não autorizada.");
  next();
}
async function initDb(){
 if(!db||secret.length<32){console.warn("Aguardando DATABASE_URL e SESSION_SECRET para ativar contas e eleições.");return;}
 await db.query(
  "CREATE TABLE IF NOT EXISTS kv_users (id UUID PRIMARY KEY,google_sub TEXT UNIQUE,email TEXT NOT NULL UNIQUE,full_name TEXT NOT NULL,password_hash TEXT,requested_role TEXT NOT NULL CHECK(requested_role IN ('aluno','professor')),role TEXT CHECK(role IN ('aluno','professor','admin')),approved BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());"+
  "CREATE TABLE IF NOT EXISTS kv_elections (id UUID PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL,description TEXT DEFAULT '',status TEXT NOT NULL DEFAULT 'Planejada' CHECK(status IN ('Planejada','Aberta','Encerrada')),starts_at TIMESTAMPTZ NOT NULL,ends_at TIMESTAMPTZ NOT NULL,eligible_roles TEXT[] NOT NULL DEFAULT ARRAY['aluno','professor']::TEXT[],created_by UUID NOT NULL REFERENCES kv_users(id),created_at TIMESTAMPTZ NOT NULL DEFAULT now(),CONSTRAINT kv_dates CHECK(ends_at>starts_at));"+
  "CREATE TABLE IF NOT EXISTS kv_candidates (id UUID PRIMARY KEY,election_id UUID NOT NULL REFERENCES kv_elections(id) ON DELETE RESTRICT,name TEXT NOT NULL,number TEXT NOT NULL,office TEXT DEFAULT '',proposals TEXT DEFAULT '',UNIQUE(election_id,number),UNIQUE(id,election_id));"+
  "CREATE TABLE IF NOT EXISTS kv_participation (election_id UUID NOT NULL REFERENCES kv_elections(id) ON DELETE RESTRICT,user_id UUID NOT NULL REFERENCES kv_users(id) ON DELETE RESTRICT,PRIMARY KEY(election_id,user_id));"+
  "CREATE TABLE IF NOT EXISTS kv_ballots (id UUID PRIMARY KEY,election_id UUID NOT NULL REFERENCES kv_elections(id) ON DELETE RESTRICT,candidate_id UUID NOT NULL,FOREIGN KEY(candidate_id,election_id) REFERENCES kv_candidates(id,election_id) ON DELETE RESTRICT);"+
  "CREATE INDEX IF NOT EXISTS kv_ballots_election ON kv_ballots(election_id,candidate_id);"+
  "CREATE TABLE IF NOT EXISTS kv_admin_setup (singleton boolean PRIMARY KEY DEFAULT TRUE CHECK(singleton),admin_user_id UUID NOT NULL REFERENCES kv_users(id),activated_at TIMESTAMPTZ NOT NULL DEFAULT now());"
 );
 dbReady=true;
 console.info("Kennedy Vota: PostgreSQL conectado e estrutura de tabelas verificada.");
}
app.get("/api/status",wrap(async(req,res)=>{
 let ready=false;if(db&&dbReady){try{await db.query("SELECT 1");ready=true;}catch{}}
 res.status(ready?200:503).json({ready,googleConfigured:!!process.env.GOOGLE_CLIENT_ID,message:ready?"Sistema conectado.":"Aguardando configuração do banco."});
}));
app.get("/api/config",(req,res)=>res.json({googleClientId:process.env.GOOGLE_CLIENT_ID||"",siteName:"Kennedy Vota",demo:false}));
app.post("/api/register",limitAuth,sameOrigin,available,wrap(async(req,res)=>{
 const name=text(req.body?.name,120),email=text(req.body?.email,254).toLowerCase();
 const role=text(req.body?.requestedRole,30),password=String(req.body?.password||"");
 if(name.length<3||!validEmail(email)||!["aluno","professor"].includes(role)||password.length<10||Buffer.byteLength(password)>72)
  return error(res,400,"Informe nome, e-mail, perfil e senha de 10 a 72 bytes.");
 const hash=await bcrypt.hash(password,12);
 try{
  const r=await db.query("INSERT INTO kv_users(id,email,full_name,requested_role,password_hash) VALUES($1,$2,$3,$4,$5) RETURNING *",[randomUUID(),email,name,role,hash]);
  setCookie(res,r.rows[0].id);res.status(201).json({user:jsonUser(r.rows[0])});
 }catch(e){if(e.code==="23505")return error(res,409,"E-mail já cadastrado. Use a opção Entrar.");throw e;}
}));
app.post("/api/login",limitAuth,sameOrigin,available,wrap(async(req,res)=>{
 const email=text(req.body?.email,254).toLowerCase(),password=String(req.body?.password||"");
 const {rows}=await db.query("SELECT * FROM kv_users WHERE email=$1",[email]);
 if(!rows[0]?.password_hash||!(await bcrypt.compare(password,rows[0].password_hash)))return error(res,401,"E-mail ou senha inválidos.");
 setCookie(res,rows[0].id);res.json({user:jsonUser(rows[0])});
}));
app.post("/api/google",limitAuth,sameOrigin,available,wrap(async(req,res)=>{
 if(!process.env.GOOGLE_CLIENT_ID)return error(res,503,"Google ainda não configurado.");
 const credential=String(req.body?.credential||"");
 if(credential.length<100||credential.length>10000)return error(res,400,"Credencial inválida.");
 let profile;
 try{profile=(await google.verifyIdToken({idToken:credential,audience:process.env.GOOGLE_CLIENT_ID})).getPayload();}
 catch{return error(res,401,"Falha ao verificar login Google.");}
 if(!profile?.sub||!validEmail(profile.email)||profile.email_verified!==true)return error(res,403,"Conta Google não verificada.");
 const email=profile.email.toLowerCase(),name=text(profile.name||email,120);
 let user=(await db.query("SELECT * FROM kv_users WHERE google_sub=$1",[profile.sub])).rows[0];
 if(!user){
  const exists=await db.query("SELECT id FROM kv_users WHERE email=$1",[email]);
  if(exists.rowCount)return error(res,409,"E-mail já cadastrado com senha. Entre com a senha e vincule o Google em Configurações.");
  const role=["aluno","professor"].includes(req.body?.requestedRole)?req.body.requestedRole:"aluno";
  // Bootstrap somente por conta Google verificada, com e-mail configurado no Render.
  const adminMail=text(process.env.ADMIN_GOOGLE_EMAIL,254).toLowerCase(),isAdmin=!!adminMail&&adminMail===email;
  try{
   const r=await db.query("INSERT INTO kv_users(id,google_sub,email,full_name,requested_role,role,approved) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [randomUUID(),profile.sub,email,name,role,isAdmin?"admin":null,isAdmin]);
   user=r.rows[0];
  }catch(e){if(e.code==="23505")return error(res,409,"Esta conta já existe. Entre com seu cadastro.");throw e;}
 }else{
  const collision=await db.query("SELECT 1 FROM kv_users WHERE email=$1 AND id<>$2",[email,user.id]);
  if(collision.rowCount)return error(res,409,"O e-mail já pertence a outra conta.");
  user=(await db.query("UPDATE kv_users SET email=$1,full_name=$2 WHERE id=$3 RETURNING *",[email,name,user.id])).rows[0];
 }
 setCookie(res,user.id);res.json({user:jsonUser(user)});
}));
app.post("/api/link-google",limitAuth,sameOrigin,available,logged,wrap(async(req,res)=>{
 if(!process.env.GOOGLE_CLIENT_ID)return error(res,503,"Google não configurado.");
 let profile;try{profile=(await google.verifyIdToken({idToken:String(req.body?.credential||""),audience:process.env.GOOGLE_CLIENT_ID})).getPayload();}
 catch{return error(res,401,"Conta Google não validada.");}
 if(profile?.email_verified!==true||profile.email?.toLowerCase()!==req.current.email)return error(res,403,"Use a mesma conta de e-mail para vincular.");
 try{
  const result=await db.query("UPDATE kv_users SET google_sub=$1 WHERE id=$2 AND (google_sub IS NULL OR google_sub=$1) RETURNING id",[profile.sub,req.current.id]);
  if(!result.rowCount)return error(res,409,"Conta já vinculada a outro Google.");
  res.json({ok:true});
 }catch(e){if(e.code==="23505")return error(res,409,"Esta conta Google já está vinculada.");throw e;}
}));
// Ativação administrativa de uso único. A autorização deve ser definida exclusivamente
// pelo proprietário do serviço na variável secreta ADMIN_SETUP_TOKEN do Render.
// ADMIN_SETUP_EMAIL limita qual endereço poderá receber a função admin.
const adminSetupLimiter=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:"draft-7",legacyHeaders:false});
function setupConfigured(){
 const email=text(process.env.ADMIN_SETUP_EMAIL,254).toLowerCase();
 const token=String(process.env.ADMIN_SETUP_TOKEN||"");
 return validEmail(email)&&token.length>=32?{email,token}:null;
}
function matchesCode(received,expected){
 if(typeof received!=="string"||received.length>256)return false;
 const left=Buffer.from(received),right=Buffer.from(expected);
 return left.length===right.length&&timingSafeEqual(left,right);
}
app.get("/api/admin/setup-status",available,wrap(async(req,res)=>{
 const configured=setupConfigured();
 if(!configured)return res.json({available:false});
 const {rows}=await db.query("SELECT EXISTS (SELECT 1 FROM kv_admin_setup) AS used");
 const adminExists=await db.query("SELECT EXISTS (SELECT 1 FROM kv_users WHERE role='admin') AS exists");
 res.json({available:!rows[0].used&&!adminExists.rows[0].exists});
}));
app.post("/api/admin/setup",adminSetupLimiter,sameOrigin,available,wrap(async(req,res)=>{
 const configured=setupConfigured();
 const email=text(req.body?.email,254).toLowerCase(),name=text(req.body?.name,120);
 const password=typeof req.body?.password==="string"?req.body.password:"";
 const code=req.body?.setupToken;
 if(!configured||email!==configured.email||!matchesCode(code,configured.token))
  return error(res,403,"Ativação não autorizada. Confira o e-mail e o código fornecidos pelo administrador do Render.");
 if(name.length<3||!validEmail(email)||password.length<12||Buffer.byteLength(password)>72)
  return error(res,400,"Informe nome e senha forte de 12 a 72 bytes.");
 const hash=await bcrypt.hash(password,12),client=await db.connect();
 let user;
 try{
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(849231,712834)");
  const setupUsed=(await client.query("SELECT EXISTS (SELECT 1 FROM kv_admin_setup) AS used")).rows[0].used;
  const adminExists=(await client.query("SELECT EXISTS (SELECT 1 FROM kv_users WHERE role='admin') AS found")).rows[0].found;
  if(setupUsed||adminExists){await client.query("ROLLBACK");return error(res,409,"A conta administrativa já foi ativada.");}
  const existing=(await client.query("SELECT * FROM kv_users WHERE email=$1 FOR UPDATE",[email])).rows[0];
  if(existing?.password_hash&&!(await bcrypt.compare(password,existing.password_hash))){
   await client.query("ROLLBACK");return error(res,403,"Este e-mail já existe com outra senha. Entre na conta existente ou use a senha correta.");
  }
  if(existing){
   user=(await client.query("UPDATE kv_users SET full_name=$1,password_hash=$2,role='admin',approved=true WHERE id=$3 RETURNING *",[name,hash,existing.id])).rows[0];
  }else{
   user=(await client.query("INSERT INTO kv_users(id,email,full_name,requested_role,password_hash,role,approved) VALUES ($1,$2,$3,'professor',$4,'admin',true) RETURNING *",[randomUUID(),email,name,hash])).rows[0];
  }
  await client.query("INSERT INTO kv_admin_setup(singleton,admin_user_id) VALUES(TRUE,$1)",[user.id]);
  await client.query("COMMIT");
 }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 setCookie(res,user.id);
 res.status(201).json({user:jsonUser(user)});
}));
app.get("/api/me",available,logged,(req,res)=>res.json({user:jsonUser(req.current)}));
app.post("/api/logout",sameOrigin,(req,res)=>{clearCookie(res);res.json({ok:true});});
app.get("/api/users/pending",available,logged,admin,wrap(async(req,res)=>{
 const {rows}=await db.query("SELECT id,full_name,email,requested_role,created_at FROM kv_users WHERE approved=false ORDER BY created_at LIMIT 200");
 res.json({users:rows});
}));
app.post("/api/users/:id/approve",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const role=text(req.body?.role,30);if(!["aluno","professor"].includes(role))return error(res,400,"Perfil inválido.");
 const r=await db.query("UPDATE kv_users SET approved=true,role=$1 WHERE id=$2 AND approved=false RETURNING id",[role,req.params.id]);
 if(!r.rowCount)return error(res,404,"Conta pendente não encontrada.");res.json({ok:true});
}));
app.get("/api/elections",available,logged,wrap(async(req,res)=>{
 const {rows:elections}=await db.query("SELECT id,title,kind,description,status,starts_at,ends_at,eligible_roles FROM kv_elections ORDER BY created_at DESC");
 const {rows:candidates}=await db.query("SELECT id,election_id,name,number,office,proposals FROM kv_candidates ORDER BY number,name");
 const {rows:participation}=await db.query("SELECT election_id FROM kv_participation WHERE user_id=$1",[req.current.id]);
 res.json({elections,candidates,votedElectionIds:participation.map(x=>x.election_id)});
}));
function parseElection(input){
 const title=text(input?.title,180),kind=text(input?.kind,100),description=text(input?.description,3000);
 const start=new Date(input?.start),end=new Date(input?.end);
 const roles=Array.isArray(input?.eligibleRoles)?[...new Set(input.eligibleRoles.filter(x=>["aluno","professor"].includes(x)))]:["aluno","professor"];
 if(!title||!kind||!roles.length||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start)return null;
 return {title,kind,description,start,end,roles};
}
app.post("/api/elections",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const x=parseElection(req.body);if(!x)return error(res,400,"Dados de eleição inválidos.");
 const id=randomUUID();await db.query("INSERT INTO kv_elections(id,title,kind,description,starts_at,ends_at,eligible_roles,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[id,x.title,x.kind,x.description,x.start,x.end,x.roles,req.current.id]);
 res.status(201).json({id});
}));
app.patch("/api/elections/:id",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const x=parseElection(req.body);if(!x)return error(res,400,"Dados inválidos.");
 const r=await db.query("UPDATE kv_elections SET title=$1,kind=$2,description=$3,starts_at=$4,ends_at=$5,eligible_roles=$6 WHERE id=$7 AND status='Planejada' RETURNING id",[x.title,x.kind,x.description,x.start,x.end,x.roles,req.params.id]);
 if(!r.rowCount)return error(res,409,"Só é possível editar eleições planejadas.");res.json({ok:true});
}));
app.post("/api/elections/:id/status",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const status=text(req.body?.status,20);
 if(!["Aberta","Encerrada"].includes(status))return error(res,400,"Situação inválida.");
 const c=await db.connect();
 try{
  await c.query("BEGIN");
  const e=(await c.query("SELECT * FROM kv_elections WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
  if(!e){await c.query("ROLLBACK");return error(res,404,"Eleição não encontrada.");}
  if(e.status==="Encerrada"||status==="Aberta"&&e.status!=="Planejada"){await c.query("ROLLBACK");return error(res,409,"Transição de situação não permitida.");}
  if(status==="Aberta"){
   const n=(await c.query("SELECT COUNT(*)::int n FROM kv_candidates WHERE election_id=$1",[e.id])).rows[0].n;
   if(n<2||Date.now()>=+new Date(e.ends_at)){await c.query("ROLLBACK");return error(res,409,"Precisa ter dois candidatos e uma data futura para encerramento.");}
  }
  await c.query("UPDATE kv_elections SET status=$1 WHERE id=$2",[status,e.id]);await c.query("COMMIT");res.json({ok:true});
 }catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();}
}));
app.delete("/api/elections/:id",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const c=await db.connect();try{
  await c.query("BEGIN");
  const e=(await c.query("SELECT status FROM kv_elections WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
  if(!e||e.status!=="Planejada"){await c.query("ROLLBACK");return error(res,409,"Só é possível excluir eleições planejadas.");}
  await c.query("DELETE FROM kv_candidates WHERE election_id=$1",[req.params.id]);
  await c.query("DELETE FROM kv_elections WHERE id=$1",[req.params.id]);await c.query("COMMIT");res.json({ok:true});
 }catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();}
}));
function parseCandidate(input){
 const name=text(input?.name,160),number=text(input?.number,15),office=text(input?.office,120),proposals=text(input?.proposals,3000);
 return name&&/^[0-9A-Za-z-]{1,12}$/.test(number)?{name,number,office,proposals}:null;
}
app.post("/api/candidates",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const x=parseCandidate(req.body);if(!x)return error(res,400,"Candidatura inválida.");
 try{
  const r=await db.query("INSERT INTO kv_candidates(id,election_id,name,number,office,proposals) SELECT $1,id,$3,$4,$5,$6 FROM kv_elections WHERE id=$2 AND status='Planejada' RETURNING id",
   [randomUUID(),req.body.electionId,x.name,x.number,x.office,x.proposals]);
  if(!r.rowCount)return error(res,409,"Eleição não aceita candidaturas.");res.status(201).json({id:r.rows[0].id});
 }catch(e){if(e.code==="23505")return error(res,409,"Número já cadastrado.");throw e;}
}));
app.patch("/api/candidates/:id",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const x=parseCandidate(req.body);if(!x)return error(res,400,"Dados inválidos.");
 try{
  const r=await db.query("UPDATE kv_candidates c SET name=$1,number=$2,office=$3,proposals=$4 FROM kv_elections e WHERE c.election_id=e.id AND e.status='Planejada' AND c.id=$5 RETURNING c.id",
   [x.name,x.number,x.office,x.proposals,req.params.id]);
  if(!r.rowCount)return error(res,409,"Candidatura não pode ser editada.");res.json({ok:true});
 }catch(e){if(e.code==="23505")return error(res,409,"Número já cadastrado.");throw e;}
}));
app.delete("/api/candidates/:id",sameOrigin,available,logged,admin,wrap(async(req,res)=>{
 const r=await db.query("DELETE FROM kv_candidates c USING kv_elections e WHERE c.election_id=e.id AND e.status='Planejada' AND c.id=$1 RETURNING c.id",[req.params.id]);
 if(!r.rowCount)return error(res,409,"Candidatura não pode ser excluída.");res.json({ok:true});
}));
app.post("/api/elections/:id/vote",limitVote,sameOrigin,available,logged,approved,wrap(async(req,res)=>{
 const c=await db.connect(),candidateId=text(req.body?.candidateId,50);
 try{
  await c.query("BEGIN");
  const e=(await c.query("SELECT * FROM kv_elections WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
  if(!e||e.status!=="Aberta"||Date.now()<+new Date(e.starts_at)||Date.now()>=+new Date(e.ends_at)){
   await c.query("ROLLBACK");return error(res,409,"Eleição indisponível.");}
  if(!eligibleToVote(req.current.role,e.eligible_roles)){await c.query("ROLLBACK");return error(res,403,"Este perfil não está habilitado para votar nesta eleição.");}
  const cand=await c.query("SELECT id FROM kv_candidates WHERE id=$1 AND election_id=$2",[candidateId,e.id]);
  if(!cand.rowCount){await c.query("ROLLBACK");return error(res,400,"Candidato inválido.");}
  await c.query("INSERT INTO kv_participation(election_id,user_id) VALUES($1,$2)",[e.id,req.current.id]);
  await c.query("INSERT INTO kv_ballots(id,election_id,candidate_id) VALUES($1,$2,$3)",[randomUUID(),e.id,candidateId]);
  await c.query("COMMIT");res.status(201).json({ok:true});
 }catch(e){
  await c.query("ROLLBACK");
  if(e.code==="23505")return error(res,409,"Esta conta já votou nesta eleição.");
  throw e;
 }finally{c.release();}
}));
app.get("/api/elections/:id/results",available,logged,wrap(async(req,res)=>{
 const el=(await db.query("SELECT status,ends_at FROM kv_elections WHERE id=$1",[req.params.id])).rows[0];
 if(!el)return error(res,404,"Eleição não encontrada.");
 if(el.status!=="Encerrada"&&Date.now()<+new Date(el.ends_at))return error(res,403,"Apuração disponível após o encerramento.");
 const {rows}=await db.query("SELECT c.id,c.number,c.name,c.office,c.proposals,COUNT(b.id)::int votes FROM kv_candidates c LEFT JOIN kv_ballots b ON b.candidate_id=c.id AND b.election_id=c.election_id WHERE c.election_id=$1 GROUP BY c.id ORDER BY votes DESC,c.number",[req.params.id]);
 res.json({results:rows,total:rows.reduce((n,r)=>n+r.votes,0)});
}));
app.use("/api",(req,res)=>error(res,404,"Endpoint não encontrado."));
app.use(express.static(publicDir,{index:"index.html",maxAge:0}));
app.get("*",(req,res)=>res.sendFile(path.join(publicDir,"index.html")));
app.use((e,req,res,next)=>{console.error("API:",e.code||e.message);return error(res,500,"Falha interna. Verifique os logs do servidor.");});
initDb().catch(e=>{console.error("Banco não conectado:",e.message);}).finally(()=>{
 app.listen(port,"0.0.0.0",()=>console.log("Kennedy Vota iniciado na porta",port));
});

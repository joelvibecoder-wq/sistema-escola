import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID, randomBytes, createHash } from "node:crypto";
const {Pool}=pg, app=express(), port=process.env.PORT||10000;
if(!process.env.DATABASE_URL||!process.env.JWT_SECRET) throw new Error("DATABASE_URL e JWT_SECRET são obrigatórios");
const db=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
app.use(cors({origin:true})); app.use(express.json({limit:"100kb"})); app.use(express.static("public"));
const run=(fn)=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const auth=(req,res,next)=>{try{req.user=jwt.verify((req.headers.authorization||"").replace(/^Bearer /,""),process.env.JWT_SECRET);next()}catch{res.status(401).json({error:"Sessão inválida ou expirada."})}};
const token=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"8h"});
const user=u=>({id:u.id,fullName:u.full_name,email:u.email,role:u.role,verified:!!u.email_verified,banned:!!u.banned,banReason:u.ban_reason||""});
const hashToken=v=>createHash("sha256").update(v).digest("hex");
const normalize=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const inappropriate=v=>/\b(?:puta|puto|putaria|caralho|porra|merda|buceta|viado|vadia|vagabunda|vagabundo|arrombado|arrombada|foda|fodase|cuzao|cacete|piranha)\b/i.test(normalize(v).replace(/[^a-z0-9]+/g," "));
const validEmail=e=>e.length<=254&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(e)&&!/(?:example\.(?:com|org|net)|teste\.|test\.|mailinator\.|tempmail\.|10minutemail\.|guerrillamail\.)/i.test(e);
const adminEmail=String(process.env.ADMIN_EMAIL||"").toLowerCase().trim();
async function sendVerification(email,rawToken){
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM||!process.env.APP_BASE_URL) throw new Error("Configure RESEND_API_KEY, EMAIL_FROM e APP_BASE_URL para liberar o cadastro.");
 const url=new URL("/?verify="+encodeURIComponent(rawToken),process.env.APP_BASE_URL).toString();
 const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[email],subject:"Confirme seu e-mail - Kennedy Vota",html:'<p>Confirme seu e-mail para acessar o Kennedy Vota:</p><p><a href="'+url+'">Confirmar e-mail</a></p><p>O link expira em 24 horas.</p>'})});
 if(!r.ok) throw new Error("Falha no envio do e-mail de confirmação.");
}
const activeAuth=async(req,res,next)=>{try{const claims=jwt.verify((req.headers.authorization||"").replace(/^Bearer /,""),process.env.JWT_SECRET);const {rows}=await db.query("SELECT * FROM demo_users WHERE id=$1",[claims.id]);const u=rows[0];if(!u)return res.status(401).json({error:"Conta não encontrada."});if(u.banned)return res.status(403).json({code:"BANNED",error:"Sua conta foi bloqueada.",reason:u.ban_reason||"Violação das regras do portal."});if(!u.email_verified)return res.status(403).json({error:"Confirme seu e-mail para continuar."});req.user={id:u.id,role:u.role};next()}catch(e){if(e?.name==="JsonWebTokenError"||e?.name==="TokenExpiredError")return res.status(401).json({error:"Sessão inválida ou expirada."});next(e)}};
const requireAdmin=(req,res,next)=>req.user.role==="Administrador"?next():res.status(403).json({error:"Acesso exclusivo do administrador."});
async function init(){await db.query(`
CREATE TABLE IF NOT EXISTS demo_users(id UUID PRIMARY KEY,full_name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,role TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS demo_elections(id UUID PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL,city TEXT NOT NULL,state TEXT NOT NULL,starts_at TIMESTAMPTZ NOT NULL,ends_at TIMESTAMPTZ NOT NULL,description TEXT DEFAULT '',status TEXT DEFAULT 'Planejada',created_by UUID REFERENCES demo_users(id),created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS demo_candidates(id UUID PRIMARY KEY,election_id UUID REFERENCES demo_elections(id) ON DELETE CASCADE,name TEXT NOT NULL,role TEXT NOT NULL,proposals JSONB DEFAULT '[]');
CREATE TABLE IF NOT EXISTS demo_email_verifications(user_id UUID PRIMARY KEY REFERENCES demo_users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS demo_votes(id UUID PRIMARY KEY,election_id UUID REFERENCES demo_elections(id) ON DELETE CASCADE,candidate_id UUID REFERENCES demo_candidates(id) ON DELETE CASCADE,voter_id UUID REFERENCES demo_users(id) ON DELETE CASCADE,created_at TIMESTAMPTZ DEFAULT now(),UNIQUE(election_id,voter_id));`);
 await db.query("ALTER TABLE demo_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE");
 await db.query("ALTER TABLE demo_users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT FALSE");
 await db.query("ALTER TABLE demo_users ADD COLUMN IF NOT EXISTS ban_reason TEXT");
 await db.query("ALTER TABLE demo_users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ");
}
app.get("/api/health",run(async(_q,s)=>{await db.query("SELECT 1");s.json({status:"ok",mode:"educational-demo"})}));
app.post("/api/auth/register",run(async(q,s)=>{
 let {fullName,email,password}=q.body||{};fullName=String(fullName||"").trim().replace(/\s+/g," ");email=String(email||"").trim().toLowerCase();password=String(password||"");
 if(fullName.length<3||fullName.length>60||inappropriate(fullName)||/[^\p{L}\p{M} .'-]/u.test(fullName))return s.status(400).json({error:"Informe um nome adequado de 3 a 60 caracteres."});
 if(!validEmail(email))return s.status(400).json({error:"Informe um endereço de e-mail válido e não temporário."});
 if(password.length<8||password.length>64||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return s.status(400).json({error:"A senha deve ter de 8 a 64 caracteres, com letras e números."});
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM||!process.env.APP_BASE_URL)return s.status(503).json({error:"Confirmação de e-mail ainda não configurada pelo administrador."});
 const id=randomUUID(),rawToken=randomBytes(32).toString("hex"),hash=await bcrypt.hash(password,12),role=email===adminEmail?"Administrador":"Participante";
 try{await db.query("INSERT INTO demo_users(id,full_name,email,role,password_hash) VALUES($1,$2,$3,$4,$5)",[id,fullName,email,role,hash]);await db.query("INSERT INTO demo_email_verifications(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '24 hours')",[id,hashToken(rawToken)]);try{await sendVerification(email,rawToken)}catch(e){await db.query("DELETE FROM demo_users WHERE id=$1",[id]);throw e} s.status(201).json({message:"Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada."})}catch(e){if(e.code==="23505")return s.status(409).json({error:"E-mail já cadastrado."});throw e}
}));
app.post("/api/auth/verify",run(async(q,s)=>{
 const value=String(q.body?.token||"");if(!/^[a-f0-9]{64}$/.test(value))return s.status(400).json({error:"Link de confirmação inválido."});
 const result=await db.query("SELECT user_id FROM demo_email_verifications WHERE token_hash=$1 AND expires_at>now()",[hashToken(value)]);
 if(!result.rowCount)return s.status(400).json({error:"Link inválido ou expirado."});
 await db.query("UPDATE demo_users SET email_verified=TRUE WHERE id=$1",[result.rows[0].user_id]);await db.query("DELETE FROM demo_email_verifications WHERE user_id=$1",[result.rows[0].user_id]);
 s.json({message:"E-mail confirmado. Entre com sua senha."});
}));
app.post("/api/auth/login",run(async(q,s)=>{
 const email=String(q.body?.email||"").trim().toLowerCase(),pw=String(q.body?.password||"");
 const {rows}=await db.query("SELECT * FROM demo_users WHERE email=$1",[email]);const u=rows[0];
 if(!u||!(await bcrypt.compare(pw,u.password_hash)))return s.status(401).json({error:"E-mail ou senha incorretos."});
 if(u.banned)return s.status(403).json({code:"BANNED",error:"Sua conta foi bloqueada.",reason:u.ban_reason||"Violação das regras do portal."});
 if(!u.email_verified)return s.status(403).json({error:"Confirme o link enviado para o seu e-mail antes de entrar."});
 s.json({user:user(u),token:token(u.id)});
}));
app.get("/api/auth/me",activeAuth,run(async(q,s)=>{const {rows}=await db.query("SELECT * FROM demo_users WHERE id=$1",[q.user.id]);s.json({user:user(rows[0])})}));
app.get("/api/admin/users",activeAuth,requireAdmin,run(async(q,s)=>{const {rows}=await db.query("SELECT id,full_name,email,role,email_verified,banned,ban_reason FROM demo_users ORDER BY created_at DESC LIMIT 500");s.json({users:rows})}));
app.post("/api/admin/users/:id/ban",activeAuth,requireAdmin,run(async(q,s)=>{
 const reason=String(q.body?.reason||"").trim();if(reason.length<5||reason.length>500)return s.status(400).json({error:"Informe um motivo de 5 a 500 caracteres."});
 if(q.params.id===q.user.id)return s.status(400).json({error:"Você não pode bloquear a própria conta."});
 const r=await db.query("UPDATE demo_users SET banned=TRUE,ban_reason=$1,banned_at=now() WHERE id=$2 AND role<>'Administrador' RETURNING id",[reason,q.params.id]);if(!r.rowCount)return s.status(404).json({error:"Usuário não encontrado ou protegido."});s.json({ok:true});
}));
app.post("/api/admin/users/:id/unban",activeAuth,requireAdmin,run(async(q,s)=>{
 const r=await db.query("UPDATE demo_users SET banned=FALSE,ban_reason=NULL,banned_at=NULL WHERE id=$1 AND role<>'Administrador' RETURNING id",[q.params.id]);if(!r.rowCount)return s.status(404).json({error:"Usuário não encontrado ou protegido."});s.json({ok:true});
}));
app.get("/api/elections",run(async(_q,s)=>{const {rows}=await db.query("SELECT * FROM demo_elections ORDER BY created_at DESC");s.json({elections:rows})}));
app.post("/api/elections",activeAuth,run(async(q,s)=>{const b=q.body||{};if(!String(b.title||"").trim()||!String(b.city||"").trim()||!b.startsAt||!b.endsAt||new Date(b.endsAt)<=new Date(b.startsAt)||!Array.isArray(b.candidates)||b.candidates.length>100)return s.status(400).json({error:"Dados da eleição inválidos."});const id=randomUUID(),c=await db.connect();try{await c.query("BEGIN");await c.query("INSERT INTO demo_elections(id,title,kind,city,state,starts_at,ends_at,description,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[id,String(b.title).slice(0,180),String(b.kind||"Simulação").slice(0,100),String(b.city).slice(0,120),String(b.state||"").slice(0,50),b.startsAt,b.endsAt,String(b.description||"").slice(0,4000),q.user.id]);for(const x of b.candidates){if(String(x.name||"").trim())await c.query("INSERT INTO demo_candidates(id,election_id,name,role,proposals) VALUES($1,$2,$3,$4,$5)",[randomUUID(),id,String(x.name).slice(0,160),String(x.role||b.kind||"Candidato").slice(0,100),JSON.stringify(Array.isArray(x.proposals)?x.proposals.slice(0,30):[])])}await c.query("COMMIT");s.status(201).json({id})}catch(e){await c.query("ROLLBACK");throw e}finally{c.release()}}));
app.patch("/api/elections/:id/status",activeAuth,run(async(q,s)=>{const status=String(q.body.status||"");if(!["Planejada","Ativa","Pausada","Encerrada"].includes(status))return s.status(400).json({error:"Situação inválida"});const r=await db.query("UPDATE demo_elections SET status=$1 WHERE id=$2 AND created_by=$3",[status,q.params.id,q.user.id]);if(!r.rowCount)return s.status(404).json({error:"Eleição não encontrada"});s.json({ok:true})}));
app.delete("/api/elections/:id",activeAuth,run(async(q,s)=>{const r=await db.query("DELETE FROM demo_elections WHERE id=$1 AND created_by=$2",[q.params.id,q.user.id]);if(!r.rowCount)return s.status(404).json({error:"Eleição não encontrada"});s.json({ok:true})}));
app.get("/api/elections/:id/results",run(async(q,s)=>{const {rows}=await db.query("SELECT c.id,c.name,c.role,c.proposals,count(v.id)::int votes FROM demo_candidates c LEFT JOIN demo_votes v ON v.candidate_id=c.id WHERE c.election_id=$1 GROUP BY c.id ORDER BY votes DESC,c.name",[q.params.id]);s.json({results:rows})}));
app.post("/api/elections/:id/vote",activeAuth,run(async(q,s)=>{const c=await db.connect();try{await c.query("BEGIN");const {rows}=await c.query("SELECT * FROM demo_elections WHERE id=$1 FOR UPDATE",[q.params.id]);const e=rows[0],now=new Date();if(!e||e.status!=="Ativa"||now<new Date(e.starts_at)||now>new Date(e.ends_at)){await c.query("ROLLBACK");return s.status(409).json({error:"Eleição não está aberta"})}const cand=await c.query("SELECT id FROM demo_candidates WHERE id=$1 AND election_id=$2",[q.body.candidateId,e.id]);if(!cand.rowCount){await c.query("ROLLBACK");return s.status(400).json({error:"Candidatura inválida"})}await c.query("INSERT INTO demo_votes(id,election_id,candidate_id,voter_id) VALUES($1,$2,$3,$4)",[randomUUID(),e.id,q.body.candidateId,q.user.id]);await c.query("COMMIT");s.status(201).json({ok:true})}catch(e){await c.query("ROLLBACK");if(e.code==="23505")return s.status(409).json({error:"Conta já votou nesta eleição"});throw e}finally{c.release()}}));
app.use((e,_q,s,_n)=>{console.error(e);s.status(500).json({error:"Falha interna da API"})});
init().then(()=>app.listen(port,"0.0.0.0",()=>console.log("API demo on",port))).catch(e=>{console.error(e);process.exit(1)});

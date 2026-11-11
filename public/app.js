"use strict";
(()=>{
 const $=id=>document.getElementById(id);
 const S={user:null,elections:[],candidates:[],voted:new Set(),editingElection:null,editingCandidate:null,selectedCandidate:null,authMode:"login",results:null,resultsElection:null,activePage:"dashboard",installPrompt:null,googleClientId:"",adminSetupAvailable:false};
 const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const date=v=>v?new Date(v).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"}):"—";
 const toLocal=v=>{const d=new Date(v);if(!Number.isFinite(+d))return"";return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
 function message(s){const x=$("toast");x.textContent=s;x.classList.add("show");clearTimeout(message.t);message.t=setTimeout(()=>x.classList.remove("show"),2600)}
 async function api(url,method="GET",data){
  const opt={method,credentials:"same-origin",headers:{}};
  if(method!=="GET"){opt.headers["Content-Type"]="application/json";opt.headers["X-Kennedy-Request"]="1";opt.body=JSON.stringify(data||{});}
  let r;try{r=await fetch(url,opt)}catch{throw Error("Sem conexão com o servidor. Verifique a internet.");}
  const val=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(val.error||"O servidor não concluiu a operação.");
  return val;
 }
 function isAdmin(){return S.user?.role==="admin"&&S.user?.approved===true}
 function isOpen(e){return e.status==="Aberta"&&Date.now()>=new Date(e.starts_at).getTime()&&Date.now()<new Date(e.ends_at).getTime()}
 function eligibleToVote(e){const roles=e?.eligible_roles||[];return roles.includes(S.user?.role)||(S.user?.role==="admin"&&roles.includes("professor"));}
 function candidatesFor(id){return S.candidates.filter(c=>c.election_id===id)}
 function byElection(id){return S.elections.find(e=>e.id===id)}
 function byCandidate(id){return S.candidates.find(c=>c.id===id)}
 function options(rows,empty="Nenhuma eleição disponível"){return rows.length?rows.map(e=>'<option value="'+escape(e.id)+'">'+escape(e.title)+'</option>').join(""):'<option value="">'+escape(empty)+'</option>'}
 function theme(dark){document.body.classList.toggle("dark",dark);$("darkSwitch").checked=dark;$("themeBtn").textContent=dark?"☀":"◐";const loginTheme=$("authThemeBtn");if(loginTheme){loginTheme.textContent=dark?"☀ Modo claro":"◐ Modo escuro";loginTheme.setAttribute("aria-pressed",String(dark));}localStorage.setItem("kennedy.theme",dark?"dark":"light");}
 theme(localStorage.getItem("kennedy.theme")==="dark"||(localStorage.getItem("kennedy.theme")===null&&window.matchMedia("(prefers-color-scheme: dark)").matches));
 $("themeBtn").onclick=()=>theme(!document.body.classList.contains("dark"));$("authThemeBtn").onclick=()=>theme(!document.body.classList.contains("dark"));
 $("darkSwitch").onchange=()=>theme($("darkSwitch").checked);
 function go(page){
  if(!S.user)return;
  closeProfileMenu();
  if(page==="users"&&!isAdmin())return;
  if(page==="vote"&&!S.user.approved){message("Seu cadastro precisa da aprovação da escola para votar.");return;}
  const target=$("page-"+page);if(!target)return;
  document.querySelectorAll(".page").forEach(p=>{p.classList.remove("active");p.setAttribute("aria-hidden","true")});
  target.classList.add("active");target.setAttribute("aria-hidden","false");
  document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const names={dashboard:"Visão geral",elections:"Eleições",candidates:"Candidatos",vote:"Área de votação",results:"Apuração",settings:"Configurações",users:"Cadastros"};
  $("topTitle").textContent=names[page]||"Kennedy Vota";S.activePage=page;
  if(page==="vote"){renderVote();refresh().catch(e=>{$("voteFeedback").hidden=false;$("voteFeedback").textContent=e.message;});}
  if(page==="results")renderResults();if(page==="users")renderUsers();
  const side=document.querySelector(".side");side.classList.remove("mobile-open");side.style.cssText="";
  window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
 }
 document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
 window.go=go;
 $("hamb").onclick=()=>{
  const side=document.querySelector(".side");side.classList.toggle("mobile-open");
  side.style.cssText=side.classList.contains("mobile-open")?"display:flex;position:fixed;inset:0 auto 0 0;width:min(290px,85vw);z-index:15;box-shadow:0 0 0 100vmax #10261970;overflow:auto":"";
 };
 function showAuth(status){
  closeProfileMenu();
  closeLogoutModal();
  $("appShell").hidden=true;$("authScreen").classList.add("open");
  $("loginControls").hidden=!!S.user;
  $("authLogout").hidden=!S.user;
  $("pendingActions").hidden=!S.user||S.user.approved;
  const n=$("authStatus");n.hidden=!status;n.textContent=status||"";
  $("authHeading").textContent=S.user?"Olá, "+S.user.name+"!":"Bem-vindo ao Kennedy Vota";
  $("authIntro").textContent=S.user?"Você entrou com "+S.user.email+". Sua conta está aguardando a autorização da escola para votar.":"Se você já tem cadastro, selecione Entrar e informe seu e-mail e senha. Se é a primeira vez, escolha Criar conta.";
 }
 function showApp(){
  $("authScreen").classList.remove("open");$("appShell").hidden=false;
  $("userName").textContent=S.user.name;
  $("userAvatar").textContent=(S.user.name||"U").charAt(0).toUpperCase();
  $("userRole").textContent=!S.user.approved?"Aguardando aprovação":S.user.role==="admin"?"Administração":S.user.role==="professor"?"Professor":"Aluno";
  updateProfileDisplay();
  $("adminNav").hidden=!isAdmin();
  $("electionForm").closest(".panel").hidden=!isAdmin();
  $("candidateForm").closest(".panel").hidden=!isAdmin();
  document.querySelectorAll('[data-page="vote"]').forEach(b=>b.hidden=!S.user.approved);
  document.querySelectorAll('[data-page="elections"],[data-page="candidates"]').forEach(b=>b.hidden=false);
  $("linkGoogleWrap").hidden=!S.googleClientId;
  $("accountName").textContent=S.user.name;
  $("accountEmail").textContent=S.user.email;
  $("accountApproval").textContent=S.user.approved?"Cadastro aprovado":"Cadastro aguardando aprovação";
  $("accountApproval").className="status"+(S.user.approved?"":" planned");
  $("accountInfoHelp").textContent=S.user.approved
    ?"Sua entrada foi confirmada. Consulte as eleições da escola."
    :"Sua entrada foi confirmada. Você pode consultar o painel, mas somente o administrador poderá liberar seu cadastro para votar.";
  $("dashboardCheckApproval").hidden=!!S.user.approved;
  renderAll();go(S.activePage==="users"&&!isAdmin()?"dashboard":S.activePage);
 }
 async function refresh(){
  if(!S.user)return;
  const data=await api("/api/elections");
  S.elections=data.elections||[];S.candidates=data.candidates||[];S.voted=new Set(data.votedElectionIds||[]);
  renderAll();
 }
 function renderAll(){renderDashboard();renderElections();renderCandidates();renderVote();renderResults();if(isAdmin()&&S.activePage==="users")renderUsers();}
 function renderDashboard(){
  $("statElections").textContent=S.elections.length;
  $("statCandidates").textContent=S.candidates.length;
  $("statVotes").textContent="—";
  $("statVotes").nextElementSibling.textContent="Apuração liberada após o encerramento";
  $("statOpen").textContent=S.elections.filter(isOpen).length;
  const rows=S.elections.slice(0,5);
  $("dashboardElections").innerHTML=rows.length?rows.map(e=>'<div class="election-card"><span class="election-symbol">◉</span><div class="election-info"><b>'+escape(e.title)+'</b><small>'+escape(e.kind)+' · '+date(e.starts_at)+'</small></div><span class="status">'+escape(e.status)+'</span></div>').join(""):'<div class="empty"><strong>Nenhuma eleição cadastrada</strong>O painel exibirá as eleições criadas pela administração.</div>';
  $("activityList").innerHTML='<div class="activity-item"><span class="activity-dot"></span><div><b>Proteção de dados ativada</b><small>Os votos não são armazenados no navegador. Resultados somente após encerramento.</small></div></div>';
  const create=document.querySelector(".welcome button");if(create)create.hidden=!isAdmin();
 }
 function renderElections(){
  $("electionCount").textContent=S.elections.length+" processo(s)";
  $("electionList").innerHTML=S.elections.length?S.elections.map(e=>{
   const controls=isAdmin()?'<div class="actions">'+(e.status==="Planejada"?'<button class="mini-btn" data-edit-election="'+e.id+'">Editar</button><button class="mini-btn" data-status-election="'+e.id+'" data-next="Aberta">Abrir</button><button class="mini-btn" data-delete-election="'+e.id+'">Excluir</button>':e.status==="Aberta"?'<button class="mini-btn" data-status-election="'+e.id+'" data-next="Encerrada">Encerrar</button>':"")+'</div>':"";
   return '<div class="election-card"><span class="election-symbol">◉</span><div class="election-info"><b>'+escape(e.title)+'</b><small>'+escape(e.kind)+' · '+date(e.starts_at)+' até '+date(e.ends_at)+'</small><small>'+candidatesFor(e.id).length+' candidatura(s) · Eleitores: '+e.eligible_roles.map(escape).join(", ")+'</small></div><span class="status '+(e.status==="Planejada"?"planned":e.status==="Encerrada"?"closed":"")+'">'+escape(e.status)+'</span>'+controls+'</div>';
  }).join(""):'<div class="empty"><strong>Nenhuma eleição</strong>Os processos da escola aparecerão aqui.</div>';
  $("electionList").querySelectorAll("[data-edit-election]").forEach(b=>b.onclick=()=>editElection(b.dataset.editElection));
  $("electionList").querySelectorAll("[data-status-election]").forEach(b=>b.onclick=()=>changeStatus(b.dataset.statusElection,b.dataset.next));
  $("electionList").querySelectorAll("[data-delete-election]").forEach(b=>b.onclick=()=>deleteElection(b.dataset.deleteElection));
  const c=$("cElection").value,r=$("resultsElection").value;
  $("cElection").innerHTML=options(S.elections.filter(e=>e.status==="Planejada"),"Crie uma eleição planejada");
  $("candidateFilter").innerHTML='<option value="">Todas as eleições</option>'+S.elections.map(e=>'<option value="'+e.id+'">'+escape(e.title)+'</option>').join("");
  $("resultsElection").innerHTML=options(S.elections,"Nenhuma eleição");
  if(S.elections.some(e=>e.id===c&&e.status==="Planejada"))$("cElection").value=c;
  if(S.elections.some(e=>e.id===r))$("resultsElection").value=r;
  $("candidateFilter").value="";
 }
 function resetElection(){
  S.editingElection=null;$("electionForm").reset();$("electionFormTitle").textContent="Nova eleição";$("eSave").textContent="Salvar eleição";$("eCancel").hidden=true;
 }
 $("electionForm").onsubmit=async e=>{
  e.preventDefault();if(!isAdmin())return;
  try{
   const input={title:$("eTitle").value,kind:$("eType").value,description:$("eDesc").value,
    start:new Date($("eStart").value).toISOString(),end:new Date($("eEnd").value).toISOString(),
    eligibleRoles:["aluno","professor"]};
   if(S.editingElection)await api("/api/elections/"+S.editingElection,"PATCH",input);else await api("/api/elections","POST",input);
   resetElection();await refresh();message("Eleição salva como Planejada. Cadastre dois candidatos e clique Abrir.");
  }catch(err){message(err.message);}
 };
 $("eCancel").onclick=resetElection;
 function editElection(id){
  const e=byElection(id);if(!e)return;S.editingElection=id;
  $("eTitle").value=e.title;$("eType").value=e.kind;$("eDesc").value=e.description||"";$("eStart").value=toLocal(e.starts_at);$("eEnd").value=toLocal(e.ends_at);
  $("electionFormTitle").textContent="Editar eleição";$("eSave").textContent="Salvar alterações";$("eCancel").hidden=false;
  window.scrollTo(0,0);
 }
 async function changeStatus(id,status){
  if(!confirm(status==="Aberta"?"Abrir esta eleição para votação?":"Encerrar esta eleição?"))return;
  try{await api("/api/elections/"+id+"/status","POST",{status});await refresh();message("Situação atualizada.");}
  catch(e){message(e.message);}
 }
 async function deleteElection(id){
  if(!confirm("Excluir o rascunho e suas candidaturas?"))return;
  try{await api("/api/elections/"+id,"DELETE");await refresh();message("Rascunho excluído.");}catch(e){message(e.message);}
 }
 function renderCandidates(){
  const q=$("candidateSearch").value.toLowerCase(),filter=$("candidateFilter").value;
  const rows=S.candidates.filter(c=>(!filter||c.election_id===filter)&&(c.name+" "+c.number+" "+c.office).toLowerCase().includes(q));
  $("candidateCount").textContent=rows.length+" candidato(s)";
  $("candidateList").innerHTML=rows.length?rows.map(c=>{
   const e=byElection(c.election_id);
   const controls=isAdmin()&&e?.status==="Planejada"?'<div class="actions"><button class="mini-btn" data-edit-candidate="'+c.id+'">Editar</button><button class="mini-btn" data-delete-candidate="'+c.id+'">Excluir</button></div>':"";
   return '<div class="candidate-row"><span class="candidate-number">'+escape(c.number)+'</span><div class="details"><b>'+escape(c.name)+'</b><small>'+escape(c.office)+' · '+escape(e?.title||"")+'</small></div>'+controls+'</div>';
  }).join(""):'<div class="empty"><strong>Sem candidatos</strong>Nenhuma candidatura corresponde ao filtro.</div>';
  $("candidateList").querySelectorAll("[data-edit-candidate]").forEach(b=>b.onclick=()=>editCandidate(b.dataset.editCandidate));
  $("candidateList").querySelectorAll("[data-delete-candidate]").forEach(b=>b.onclick=()=>deleteCandidate(b.dataset.deleteCandidate));
 }
 function resetCandidate(){S.editingCandidate=null;$("candidateForm").reset();$("candidateFormTitle").textContent="Nova candidatura";$("cSave").textContent="Salvar candidatura";$("cCancel").hidden=true;}
 $("candidateForm").onsubmit=async e=>{
  e.preventDefault();if(!isAdmin())return;
  const input={name:$("cName").value,number:$("cNumber").value,office:$("cRole").value,proposals:$("cProposals").value,electionId:$("cElection").value};
  try{if(S.editingCandidate)await api("/api/candidates/"+S.editingCandidate,"PATCH",input);else await api("/api/candidates","POST",input);
   resetCandidate();await refresh();message("Candidatura salva.");}
  catch(e){message(e.message);}
 };
 $("cCancel").onclick=resetCandidate;
 function editCandidate(id){
  const c=byCandidate(id);if(!c)return;S.editingCandidate=id;
  $("cName").value=c.name;$("cNumber").value=c.number;$("cElection").value=c.election_id;$("cRole").value=c.office;$("cProposals").value=c.proposals;
  $("candidateFormTitle").textContent="Editar candidatura";$("cSave").textContent="Salvar alterações";$("cCancel").hidden=false;window.scrollTo(0,0);
 }
 async function deleteCandidate(id){
  if(!confirm("Excluir esta candidatura do rascunho?"))return;
  try{await api("/api/candidates/"+id,"DELETE");await refresh();message("Candidatura excluída.");}catch(e){message(e.message);}
 }
 $("candidateSearch").oninput=renderCandidates;$("candidateFilter").onchange=renderCandidates;
 function renderVote(){
  if(!S.user?.approved){
   $("voteRefresh").hidden=false;
   $("confirmVote").disabled=true;
   $("voteElection").innerHTML='<option value="">Aguardando aprovação</option>';
   $("voteCandidates").innerHTML='<div class="empty"><strong>Aguardando aprovação da escola</strong>O administrador precisa autorizar sua conta antes de você votar.</div>';
   $("voteSummary").textContent="Votação disponível somente após aprovação.";
   return;
  }
  const available=S.elections.filter(isOpen).filter(eligibleToVote);
  const current=$("voteElection").value;$("voteElection").innerHTML=options(available,"Não há eleições abertas para seu perfil");
  if(available.some(e=>e.id===current))$("voteElection").value=current;
  const id=$("voteElection").value;
  S.selectedCandidate=null;$("confirmVote").disabled=true;
  $("voteSummary").textContent="Selecione uma candidatura para continuar.";
  $("voteRefresh").hidden=false;
  if(!id){
   let heading="Nenhuma votação disponível",reason="Aguarde uma eleição aberta para seu perfil.";
   if(!S.elections.length){heading="Nenhuma eleição cadastrada";reason="A administração precisa criar uma eleição e cadastrar pelo menos dois candidatos.";}
   else if(S.elections.some(e=>e.status==="Planejada")){heading="Eleição ainda não aberta";reason="A administração precisa cadastrar pelo menos dois candidatos e clicar em Abrir na página Eleições.";}
   else if(S.elections.some(e=>e.status==="Aberta"&&Date.now()<new Date(e.starts_at).getTime())){heading="Votação ainda não iniciada";reason="A eleição foi aberta, mas o horário de início ainda não chegou.";}
   else if(S.elections.some(e=>e.status==="Aberta"&&isOpen(e))){heading="Perfil sem permissão";reason="Há uma eleição aberta, mas este perfil não está habilitado para votar nela.";}
   else {heading="Nenhuma votação em andamento";reason="O período de votação terminou ou não há processos ativos.";}
   $("voteCandidates").innerHTML='<div class="empty"><strong>'+escape(heading)+'</strong>'+escape(reason)+'</div>';
   $("voteSummary").textContent=reason;
   return;
  }
  if(S.voted.has(id)){$("voteCandidates").innerHTML='<div class="empty"><strong>Sua participação já foi registrada</strong>Esta conta não pode votar novamente na mesma eleição.</div>';$("voteSummary").textContent="Você já votou nesta eleição.";return;}
  const candidates=candidatesFor(id);
  $("voteCandidates").innerHTML=candidates.length?candidates.map(c=>
   '<label class="vote-option" data-choice="'+c.id+'"><input type="radio" name="voteChoice" value="'+c.id+'"><span class="candidate-number">'+escape(c.number)+'</span><span><b>'+escape(c.name)+'</b><small>'+escape(c.office)+'</small></span></label>').join(""):'<div class="empty">Esta eleição ainda não tem candidaturas.</div>';
  $("voteCandidates").querySelectorAll("[data-choice]").forEach(el=>{
   el.onclick=()=>{S.selectedCandidate=el.dataset.choice;
    $("voteCandidates").querySelectorAll("[data-choice]").forEach(y=>y.classList.toggle("selected",y===el));
    const c=byCandidate(S.selectedCandidate);$("voteSummary").textContent=c?c.number+" · "+c.name:"";
    $("confirmVote").disabled=!c;
   };
  });
 }
 $("voteElection").onchange=()=>{$("voteFeedback").hidden=true;renderVote();};
 $("voteRefresh").onclick=async()=>{
  const button=$("voteRefresh");button.disabled=true;
  try{await refresh();$("voteFeedback").hidden=true;message("Eleições atualizadas.");}
  catch(e){$("voteFeedback").hidden=false;$("voteFeedback").textContent=e.message;message(e.message);}
  finally{button.disabled=false;}
 };
 $("confirmVote").onclick=()=>{
  const c=byCandidate(S.selectedCandidate),e=byElection($("voteElection").value);if(!c||!e)return;
  $("modalText").textContent="Confirmar a candidatura "+c.name+" (nº "+c.number+") na eleição "+e.title+"?";
  $("voteModal").classList.add("open");
 };
 $("modalCancel").onclick=()=>$("voteModal").classList.remove("open");
 $("modalConfirm").onclick=async()=>{
  const id=$("voteElection").value,button=$("modalConfirm");
  if(!S.user?.approved||!id||!S.selectedCandidate)return;
  button.disabled=true;
  try{
   await api("/api/elections/"+id+"/vote","POST",{candidateId:S.selectedCandidate});
   S.voted.add(id);
   $("voteModal").classList.remove("open");
   $("voteFeedback").hidden=false;
   $("voteFeedback").textContent="Voto registrado com sucesso. Sua escolha é sigilosa e não pode ser alterada.";
   renderVote();
   try{await refresh();}catch{message("Voto registrado. Atualize a página para consultar as eleições.");}
  }catch(e){
   $("voteModal").classList.remove("open");
   $("voteFeedback").hidden=false;
   $("voteFeedback").textContent=e.message;
   await refresh().catch(()=>{});
   message(e.message);
  }finally{button.disabled=false;}
 };
 async function renderResults(){
  const el=$("resultsElection"),id=el.value,box=$("resultsContent");
  if(!id){box.innerHTML='<div class="empty">Nenhuma eleição para consultar.</div>';return;}
  const e=byElection(id);
  if(e.status!=="Encerrada"&&Date.now()<new Date(e.ends_at).getTime()){
   S.results=null;box.innerHTML='<div class="empty"><strong>Apuração indisponível</strong>Os resultados serão publicados após o encerramento da eleição.</div>';return;
  }
  box.innerHTML='<div class="empty">Carregando apuração...</div>';
  try{
   const data=await api("/api/elections/"+id+"/results");
   if(el.value!==id)return;S.results=data;S.resultsElection=id;
   const max=Math.max(1,...data.results.map(c=>c.votes));
   box.innerHTML='<div class="panel-head"><h3>'+escape(e.title)+'</h3><span class="status closed">Encerrada</span></div>'
    +'<div class="candidate-chart"><h3>Comparativo de candidaturas</h3><p>'+data.total+' voto(s) registrados</p>'
    +data.results.map(c=>{const pct=data.total?Math.round(c.votes/data.total*100):0;
     return '<div class="chart-item"><div class="chart-label"><b>'+escape(c.number)+' · '+escape(c.name)+'</b><span>'+c.votes+' voto(s) · '+pct+'%</span></div><div class="chart-track"><div class="chart-bar" style="width:'+(c.votes/max*100)+'%"></div></div></div>';
    }).join("")+'</div>'
    +'<div class="candidate-info-grid">'+data.results.map(c=>'<div class="candidate-info"><div class="candidate-info-head"><span class="candidate-number">'+escape(c.number)+'</span><h4>'+escape(c.name)+'</h4></div><div class="candidate-info-data"><b>'+c.votes+'</b> voto(s)</div><div class="candidate-proposals"><b>Propostas</b><p>'+escape(c.proposals)+'</p></div></div>').join("")+'</div>';
  }catch(err){box.innerHTML='<div class="notice">'+escape(err.message)+'</div>';}
 }
 $("resultsElection").onchange=renderResults;
 $("exportResults").onclick=()=>{
  if(!S.results||S.resultsElection!==$("resultsElection").value){message("A apuração não está disponível.");return;}
  const rows=[["Número","Candidato","Votos"],...S.results.results.map(c=>[c.number,c.name,c.votes])];
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n");
  const u=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a");a.href=u;a.download="apuracao-kennedy-vota.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),500);
 };
 async function renderUsers(){
  if(!isAdmin())return;
  const box=$("pendingUsers");box.innerHTML='<div class="empty">Carregando solicitações...</div>';
  try{
   const data=await api("/api/users/pending");
   box.innerHTML=data.users.length?data.users.map(u=>
    '<div class="candidate-row"><div class="details"><b>'+escape(u.full_name)+'</b><small>'+escape(u.email)+' · Solicitou: '+escape(u.requested_role)+'</small></div><select aria-label="Perfil a liberar" id="role-'+u.id+'"><option value="aluno" '+(u.requested_role==="aluno"?"selected":"")+'>Aluno</option><option value="professor" '+(u.requested_role==="professor"?"selected":"")+'>Professor</option></select><button class="btn btn-primary" data-approve="'+u.id+'">Aprovar</button></div>').join(""):'<div class="empty"><strong>Nenhum pedido pendente</strong>Os novos cadastros aparecerão aqui.</div>';
   box.querySelectorAll("[data-approve]").forEach(b=>b.onclick=async()=>{
    if(!confirm("Confirmar este vínculo escolar após conferência da pessoa?"))return;
    try{await api("/api/users/"+b.dataset.approve+"/approve","POST",{role:$("role-"+b.dataset.approve).value});message("Cadastro aprovado.");renderUsers();}
    catch(e){message(e.message);}
   });
  }catch(e){box.innerHTML='<div class="notice">'+escape(e.message)+'</div>';}
 }
 $("refreshUsers").onclick=renderUsers;
 function setAuth(mode){
  S.authMode=mode;document.querySelectorAll("[data-auth]").forEach(b=>b.classList.toggle("active",b.dataset.auth===mode));
  // Voltar à entrada convencional ao alternar as abas.
  $("authForm").hidden=false;
  $("adminSetupForm").hidden=true;
  $("showAdminSetup").hidden=false;
  if($("authRole").value==="admin")$("authRole").value="aluno";
  if($("googleRole").value==="admin")$("googleRole").value="aluno";
  const signup=mode==="signup";
  $("authNameWrap").hidden=!signup;$("authRoleWrap").hidden=!signup;$("authName").required=signup;
  // O mínimo de 10 caracteres vale somente para SENHAS NOVAS.
  // Senhas de contas já existentes devem poder autenticar sem validação HTML de cadastro.
  $("authPass").minLength=signup?10:1;
  $("authPass").autocomplete=signup?"new-password":"current-password";
  $("authPass").placeholder=signup?"Crie uma senha (mínimo 10 caracteres)":"Digite a senha da sua conta";
  $("authSubmit").textContent=signup?"Criar meu cadastro":"Entrar na minha conta";
  $("authSwitchText").textContent=signup?"Já tem cadastro?":"Ainda não tem conta?";
  $("authSwitchButton").textContent=signup?"Entrar com minha conta":"Criar cadastro";
  $("authEmail").autocomplete=signup?"email":"username";
 }
 document.querySelectorAll("[data-auth]").forEach(b=>b.onclick=()=>setAuth(b.dataset.auth));
 $("authSwitchButton").onclick=()=>{setAuth(S.authMode==="signup"?"login":"signup");$("authPass").value="";$("authEmail").focus();};

 // Controles de visibilidade: os campos começam ocultos e o botão nunca envia o formulário.
 document.querySelectorAll("[data-password-toggle]").forEach(button=>{
  const field=$(button.dataset.passwordToggle);
  if(!field)return;
  button.addEventListener("click",()=>{
   const visible=field.type!=="password";
   field.type=visible?"password":"text";
   button.setAttribute("aria-pressed",String(!visible));
   const action=visible?"Mostrar":"Ocultar";
   const what=field.id==="setupAdminCode"?"código":"senha";
   button.setAttribute("aria-label",action+" "+what);
   button.title=action+" "+what;
   button.querySelector(".password-eye-open").hidden=!visible;
   button.querySelector(".password-eye-closed").hidden=visible;
   field.focus({preventScroll:true});
  });
 });
 $("authForm").onsubmit=async event=>{
  event.preventDefault();
  if(S.authMode==="signup"&&$("authRole").value==="admin"){openAdminSetup();return;}
  const btn=$("authSubmit");btn.disabled=true;
  try{
   const input={name:$("authName").value,email:$("authEmail").value,password:$("authPass").value,requestedRole:$("authRole").value};
   const data=await api(S.authMode==="signup"?"/api/register":"/api/login","POST",input);
   S.user=data.user;$("authPass").value="";await afterLogin();
  }catch(e){
   if(S.authMode==="signup"&&/já cadastrado|já existe/i.test(e.message)){
    setAuth("login");
    $("authPass").value="";
    message("Este e-mail já tem cadastro. Entre com sua senha.");
    $("authPass").focus();
   }else message(e.message);
  }finally{btn.disabled=false;}
 };
 // O servidor não revela senhas; o menu mostra apenas status e alteração protegida.
 function updateProfileDisplay(){
  if(!S.user)return;
  $("profileName").textContent=S.user.name||"—";
  $("profileEmail").textContent=S.user.email||"—";
  $("profileAge").textContent=Number.isInteger(S.user.ageYears)?S.user.ageYears+" ano(s)":"Não informada";
  $("profileAgeInput").value=Number.isInteger(S.user.ageYears)?String(S.user.ageYears):"";
 }
 function closeProfileMenu(){
  const menu=$("profileMenu"),trigger=$("profileTrigger");
  if(menu)menu.hidden=true;
  if(trigger)trigger.setAttribute("aria-expanded","false");
 }
 function openProfileMenu(){
  if(!S.user)return;
  updateProfileDisplay();
  $("profileMenu").hidden=false;
  $("profileTrigger").setAttribute("aria-expanded","true");
  $("profileClose").focus({preventScroll:true});
 }
 function closeLogoutModal(){
  const modal=$("logoutModal");
  if(modal)modal.classList.remove("open");
  if(modal)modal.setAttribute("aria-hidden","true");
 }
 function openLogoutModal(){
  closeProfileMenu();
  const modal=$("logoutModal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  $("cancelLogout").focus({preventScroll:true});
 }
 $("profileTrigger").onclick=()=>{
  if($("profileMenu").hidden)openProfileMenu();
  else closeProfileMenu();
 };
 $("profileClose").onclick=()=>{closeProfileMenu();$("profileTrigger").focus({preventScroll:true});};
 document.addEventListener("click",event=>{
  if(!$("profileMenu").hidden&&!event.target.closest(".profile-anchor"))closeProfileMenu();
 });
 document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;
  if($("logoutModal").classList.contains("open")){closeLogoutModal();$("profileTrigger").focus({preventScroll:true});}
  else if(!$("profileMenu").hidden){closeProfileMenu();$("profileTrigger").focus({preventScroll:true});}
 });
 $("profileAgeForm").onsubmit=async event=>{
  event.preventDefault();
  const button=$("profileAgeSave");button.disabled=true;
  try{
   const raw=$("profileAgeInput").value.trim();
   const result=await api("/api/profile/age","POST",{age:raw===""?null:Number(raw)});
   S.user=result.user;
   updateProfileDisplay();
   $("profileAgeDetails").open=false;
   message("Idade atualizada com sucesso.");
  }catch(e){message(e.message);}finally{button.disabled=false;}
 };
 $("profilePasswordForm").onsubmit=async event=>{
  event.preventDefault();
  const button=$("profilePasswordSave");button.disabled=true;
  try{
   await api("/api/profile/password","POST",{
    currentPassword:$("profileCurrentPass").value,
    newPassword:$("profileNewPass").value
   });
   $("profilePasswordForm").reset();
   for(const id of ["profileCurrentPass","profileNewPass"]){
    const input=$(id),toggle=document.querySelector('[data-password-toggle="'+id+'"]');
    input.type="password";
    if(toggle){
     toggle.setAttribute("aria-pressed","false");
     toggle.setAttribute("aria-label","Mostrar senha");
     toggle.title="Mostrar senha";
     toggle.querySelector(".password-eye-open").hidden=false;
     toggle.querySelector(".password-eye-closed").hidden=true;
    }
   }
   $("profilePasswordDetails").open=false;
   message("Senha alterada com sucesso.");
  }catch(e){message(e.message);}finally{button.disabled=false;}
 };
 $("profileLogout").onclick=openLogoutModal;
 $("logoutBtn").onclick=openLogoutModal;
 $("authLogout").onclick=openLogoutModal;
 $("cancelLogout").onclick=()=>{closeLogoutModal();$("profileTrigger").focus({preventScroll:true});};
 $("logoutModal").onclick=event=>{if(event.target===$("logoutModal"))closeLogoutModal();};
 async function logout(){
  const button=$("confirmLogout");button.disabled=true;
  try{
   await api("/api/logout","POST");
   closeLogoutModal();
   closeProfileMenu();
   S.user=null;S.elections=[];S.candidates=[];S.voted.clear();
   $("profilePasswordForm").reset();
   showAuth("");
   setAuth("login");
   message("Você saiu da conta com segurança.");
  }catch(e){message("Não foi possível encerrar a sessão: "+e.message);}
  finally{button.disabled=false;}
 }
 $("confirmLogout").onclick=logout;
 async function afterLogin(){
  // Depois de confirmar a senha e encontrar a conta, abrir o painel.
  // O backend continua bloqueando votos sem aprovação escolar.
  S.activePage="dashboard";
  showApp();
  try{
   await refresh();
   message(S.user.approved?"Entrada realizada! Bem-vindo ao painel.":"Entrada realizada! Seu cadastro aguarda a aprovação do administrador.");
  }catch(e){message(e.message);}
 }
 async function checkApproval(){
  const buttons=[$("checkApproval"),$("dashboardCheckApproval")];
  buttons.forEach(b=>b.disabled=true);
  try{
   const result=await api("/api/me");
   S.user=result.user;
   showApp();
   await refresh();
   message(S.user.approved?"Cadastro aprovado!":"Cadastro ainda pendente. Você pode consultar o painel.");
  }catch(e){message(e.message);}
  finally{buttons.forEach(b=>b.disabled=false);}
 }
 $("checkApproval").onclick=checkApproval;
 $("dashboardCheckApproval").onclick=checkApproval;
 function loadGoogle(clientId){
  const start=Date.now();const interval=setInterval(()=>{
   if(!window.google?.accounts?.id){if(Date.now()-start>12000){clearInterval(interval);$("googleAuthMount").textContent="Não foi possível carregar o login Google."; }return;}
   clearInterval(interval);
   window.google.accounts.id.initialize({client_id:clientId,callback:async({credential})=>{
    try{
     if(S.user){
      await api("/api/link-google","POST",{credential});message("Conta Google vinculada ao seu cadastro.");return;
     }
     if($("googleRole").value==="admin"){
      openAdminSetup();
      message("Administrador: utilize a ativação protegida ou entre com sua conta já existente.");
      return;
     }
     const data=await api("/api/google","POST",{credential,requestedRole:$("googleRole").value});
     S.user=data.user;await afterLogin();
    }catch(e){message(e.message);}
   }});
   window.google.accounts.id.renderButton($("googleAuthMount"),{theme:"outline",size:"large",text:"continue_with",width:280});
   window.google.accounts.id.renderButton($("googleLinkButton"),{theme:"outline",size:"medium",width:230});
  },180);
 }

 async function checkAdminSetupAvailability(){
  try{
   const result=await api("/api/admin/setup-status");
   S.adminSetupAvailable=!!result.available;
   $("adminSetupEntry").hidden=!S.adminSetupAvailable;
  }catch{
   S.adminSetupAvailable=false;
   $("adminSetupEntry").hidden=true;
  }
 }
 function openAdminSetup(){
  if(!S.adminSetupAvailable){
   $("authRole").value="aluno";
   $("googleRole").value="aluno";
   message("Ativação de administrador indisponível. Se a conta já existe, use a opção Entrar.");
   return;
  }
  const name=$("authName").value,email=$("authEmail").value;
  setAuth("signup");
  $("authRole").value="admin";
  $("authForm").hidden=true;
  $("adminSetupEntry").hidden=false;
  $("adminSetupForm").hidden=false;
  $("showAdminSetup").hidden=true;
  if(name&&!$("setupAdminName").value)$("setupAdminName").value=name;
  if(email&&!$("setupAdminEmail").value)$("setupAdminEmail").value=email;
  $("adminSetupForm").scrollIntoView({behavior:"smooth",block:"center"});
  $("setupAdminName").focus({preventScroll:true});
 }
 $("authRole").onchange=()=>{if($("authRole").value==="admin")openAdminSetup();};
 $("googleRole").onchange=()=>{if($("googleRole").value==="admin")openAdminSetup();};
 $("showAdminSetup").onclick=openAdminSetup;
 $("cancelAdminSetup").onclick=()=>{
  $("adminSetupForm").reset();
  $("authRole").value="aluno";
  setAuth("login");
  $("authEmail").focus();
 };
 $("adminSetupForm").onsubmit=async event=>{
  event.preventDefault();
  const button=$("createAdminBtn");button.disabled=true;
  try{
   const data=await api("/api/admin/setup","POST",{
    name:$("setupAdminName").value,
    email:$("setupAdminEmail").value,
    password:$("setupAdminPassword").value,
    setupToken:$("setupAdminCode").value
   });
   $("adminSetupForm").reset();
   $("adminSetupEntry").hidden=true;
   S.user=data.user;
   await afterLogin();
   message("Administração ativada. Agora você pode aprovar os cadastros.");
  }catch(e){message(e.message);}
  finally{button.disabled=false;}
 };
 async function start(){
  setAuth("login");showAuth("");
  await checkAdminSetupAvailability();
  try{
   const config=await api("/api/config");S.googleClientId=config.googleClientId;
   if(S.googleClientId)loadGoogle(S.googleClientId);
   else $("googleAuthMount").textContent="Google: aguardando credenciais da escola.";
  }catch{$("googleAuthMount").textContent="Login Google indisponível.";}
  try{const data=await api("/api/me");S.user=data.user;await afterLogin();}
  catch(e){
   if(!e.message.includes("Entre na sua conta")&&!e.message.includes("Sua sessão expirou")){
    showAuth("A conexão do banco ou do servidor ainda precisa ser configurada no Render.");
   }
  }
 }
 let deferredInstall=null;
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;});
 window.addEventListener("appinstalled",()=>{deferredInstall=null;message("Kennedy Vota instalado!");});
 async function install(){
  if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;return;}
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
  const instruction=ios?"No iPhone: toque em Compartilhar e escolha Adicionar à Tela de Início.":"No computador: use Instalar aplicativo no menu do Chrome/Edge. No Android: use Adicionar à tela inicial no menu do navegador.";
  $("installHelp").hidden=false;$("installHelp").textContent=instruction;message(instruction);
 }
 $("installApp").onclick=install;$("installInSettings").onclick=install;
 if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
 start();
})();
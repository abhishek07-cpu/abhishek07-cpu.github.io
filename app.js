const cfg = window.PORTFOLIO_CONFIG || {};
const configured = cfg.supabaseUrl && !cfg.supabaseUrl.includes("YOUR-PROJECT")
  && cfg.supabaseAnonKey && !cfg.supabaseAnonKey.includes("YOUR_SUPABASE");
const db = configured && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

const defaults = {
  profile: {
    full_name:"Abhishek Saharan", tagline:"First-year CSE (AI & ML) student",
    bio:"I’m a curious computer science student exploring programming, artificial intelligence and creative technology. I enjoy learning by building, experimenting with ideas and working with a team.",
    education:"BTech CSE (AI & ML), Chitkara University", location:"Rajpura, Punjab, India",
    email:"", linkedin:"", github:"", instagram:"", avatar_url:"", resume_url:""
  },
  items:[
    {id:"d1",type:"skill",title:"C Programming",description:"Programming fundamentals, logic and problem-solving.",category:"Programming"},
    {id:"d2",type:"skill",title:"Python",description:"Learning Python syntax and beginner programming projects.",category:"Programming"},
    {id:"d3",type:"skill",title:"Java",description:"Foundational Java knowledge from school-level training.",category:"Programming"},
    {id:"d4",type:"skill",title:"AI & Machine Learning",description:"Exploring concepts and tools behind intelligent systems.",category:"Technology"},
    {id:"d5",type:"skill",title:"Video Editing & GFX",description:"Creative editing, visual design and digital content.",category:"Creative"},
    {id:"d6",type:"skill",title:"Teamwork & Esports",description:"Communication, coordination and a competitive mindset.",category:"Other"},
    {id:"d7",type:"project",title:"Rainfall Analysis in India",description:"A beginner-friendly data analysis project idea to explore rainfall data, visualize patterns and practice Python.",url:"https://github.com/",category:"Python"},
    {id:"d8",type:"project",title:"Personal Portfolio Website",description:"A responsive website — a home for my projects, skills, certificates and learning journey.",url:"",category:"Web Development"},
    {id:"d9",type:"project",title:"Face Attendance System",description:"A planned computer-vision project to learn about face detection and attendance workflows.",url:"",category:"AI/ML",date_label:"In planning"},
    {id:"d10",type:"certificate",title:"NIELIT Java Training",description:"Six-week summer training camp in Java programming.",url:"",category:"Training",date_label:"Add your certificate file in the dashboard"},
    {id:"d11",type:"achievement",title:"Academic milestone",description:"Completed Class 12 and began my BTech journey in CSE (AI & ML).",category:"Education"},
    {id:"d12",type:"experience",title:"BTech — CSE (AI & ML)",description:"Chitkara University, Rajpura. Building a foundation in computer science, programming and AI/ML.",category:"Education",date_label:"First year"},
    {id:"d13",type:"experience",title:"Java Programming Training",description:"NIELIT — six-week summer training at the 10+2 level.",category:"Training"},
    {id:"d14",type:"experience",title:"DGIT Squad — Free Fire roster involvement",description:"Esports team participation; interested in coordination, discipline and team development.",category:"Esports"}
  ]
};

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeUrl(value) {
  try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
}
function linkNode(label, href) {
  const url = safeUrl(href);
  if (!url) return null;
  const a = el("a","item-link",label + " ↗"); a.href=url; a.target="_blank"; a.rel="noopener noreferrer"; return a;
}
function showToast(message) {
  const t=document.getElementById("toast"); t.textContent=message; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2800);
}
async function loadData() {
  if (!db) return {profile:defaults.profile,items:defaults.items};
  const [p,i] = await Promise.all([
    db.from("portfolio_profile").select("*").eq("id",1).maybeSingle(),
    db.from("portfolio_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false})
  ]);
  if (p.error || i.error) { console.error(p.error||i.error); showToast("Could not load cloud data. Showing starter content."); return {profile:defaults.profile,items:defaults.items}; }
  return {profile:p.data||defaults.profile,items:i.data||[]};
}
function renderProfile(p) {
  document.title=(p.full_name||"Portfolio")+" | Developer Portfolio";
  document.getElementById("heroTagline").textContent=p.tagline||"Developer";
  const first=(p.full_name||"Abhishek").trim().split(/\s+/)[0];
  document.getElementById("heroName").textContent=first;
  document.querySelector("h1").lastChild.textContent=(p.full_name||"Abhishek Saharan").trim().split(/\s+/).slice(1).join(" ") ? "\n"+(p.full_name||"").trim().split(/\s+/).slice(1).join(" ")+"." : "";
  document.getElementById("heroBio").textContent=p.bio||"";
  document.getElementById("aboutBio").textContent=p.bio||"";
  document.getElementById("cardName").textContent=p.full_name||"";
  document.getElementById("cardTagline").textContent=p.tagline||"";
  document.getElementById("educationText").textContent=p.education||"";
  document.getElementById("locationText").textContent=p.location||"";
  const avatar=document.getElementById("avatar");
  if(p.avatar_url && safeUrl(p.avatar_url)){const img=el("img");img.src=safeUrl(p.avatar_url);img.alt="Profile photo";avatar.textContent="";avatar.append(img);}
  else avatar.textContent=(p.full_name||"AS").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
  const resume=document.getElementById("resumeBtn");
  if(p.resume_url && safeUrl(p.resume_url)){resume.href=safeUrl(p.resume_url);resume.classList.remove("hidden");}
  const social=document.getElementById("socialLinks"); social.replaceChildren();
  [["LinkedIn",p.linkedin],["GitHub",p.github],["Instagram",p.instagram],["Email",p.email?`mailto:${p.email}`:""]].forEach(([name,url])=>{
    if(!url)return; const a=el("a","",name); a.href=url.startsWith("mailto:")?url:(safeUrl(url)||"#"); a.target=url.startsWith("mailto:")?"":"_blank"; a.rel="noopener noreferrer"; a.append(el("span","",url)); social.append(a);
  });
  document.getElementById("contactForm").dataset.email=p.email||"";
}
function renderGroup(items,type,target) {
  const root=document.getElementById(target); root.replaceChildren();
  const filtered=items.filter(x=>x.type===type);
  if(!filtered.length){root.append(el("p","muted","Nothing added here yet. Check back soon."));return;}
  filtered.forEach(item=>{
    if(type==="skill"){
      const card=el("article","skill");card.append(el("div","symbol","✦"),el("h3","",item.title),el("p","",item.description||item.category||""));
      root.append(card);return;
    }
    const card=el("article","item"),top=el("div","item-top");
    top.append(el("span","tag",item.category||type),el("span","muted",item.date_label||""));
    card.append(top,el("h3","",item.title),el("p","",item.description||""));
    let href=item.url;
    if(type==="certificate" && item.file_path && db){href=db.storage.from("portfolio-files").getPublicUrl(item.file_path).data.publicUrl;}
    const link=linkNode(type==="certificate"?"View certificate":"View details",href);
    if(link)card.append(link);
    root.append(card);
  });
}
function renderExperience(items) {
  const root=document.getElementById("experienceGrid");root.replaceChildren();
  const list=items.filter(x=>x.type==="experience");
  if(!list.length){root.append(el("p","muted","Experience and education entries will appear here."));return;}
  list.forEach(item=>{const row=el("div","timeline-item"),icon=el("div","timeline-icon","✦"),body=el("div");
    body.append(el("h3","",item.title),el("p","",item.date_label||item.category||""),el("p","",item.description||""));row.append(icon,body);root.append(row);});
}
async function init() {
  document.getElementById("year").textContent=new Date().getFullYear();
  const menu=document.getElementById("menuBtn"),links=document.getElementById("navLinks");
  menu.addEventListener("click",()=>links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")));
  const data=await loadData();renderProfile(data.profile);
  renderGroup(data.items,"skill","skillsGrid");renderGroup(data.items,"project","projectsGrid");
  renderGroup(data.items,"certificate","certificatesGrid");renderGroup(data.items,"achievement","achievementsGrid");
  renderExperience(data.items);
  document.getElementById("contactForm").addEventListener("submit",e=>{
    e.preventDefault();const email=e.currentTarget.dataset.email;
    if(!email){showToast("Add your email in the admin dashboard first.");return;}
    const name=document.getElementById("senderName").value.trim(),sender=document.getElementById("senderEmail").value.trim(),message=document.getElementById("senderMessage").value.trim();
    location.href=`mailto:${email}?subject=${encodeURIComponent("Portfolio message from "+name)}&body=${encodeURIComponent(message+"\n\nFrom: "+name+"\nEmail: "+sender)}`;
  });
  if(!db)showToast("Starter preview: connect Supabase to enable live dashboard updates.");
}
init();

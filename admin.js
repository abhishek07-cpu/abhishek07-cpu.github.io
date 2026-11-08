const cfg=window.PORTFOLIO_CONFIG||{};
const configured=cfg.supabaseUrl&&!cfg.supabaseUrl.includes("YOUR-PROJECT")&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes("YOUR_SUPABASE");
const client=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
const $=s=>document.querySelector(s);
const labels={project:"Projects",certificate:"Certificates",skill:"Skills",achievement:"Achievements",experience:"Experience"};
let activeType="profile",allItems=[],profile=null,currentUser=null;
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function formObject(form){return Object.fromEntries(new FormData(form).entries())}
async function refreshSession(){
 if(!client){$("#loginMessage").textContent="Setup needed: add your Supabase URL and anon key in config.js, then refresh.";return;}
 const {data:{session}}=await client.auth.getSession();
 if(session){currentUser=session.user;await showDashboard();}else showLogin();
}
function showLogin(){$("#loginPanel").classList.remove("hidden");$("#dashboard").classList.add("hidden")}
async function showDashboard(){
 $("#loginPanel").classList.add("hidden");$("#dashboard").classList.remove("hidden");
 await loadProfile();await loadItems();showTab("profile");
}
async function loadProfile(){
 const {data,error}=await client.from("portfolio_profile").select("*").eq("id",1).single();
 if(error){toast("Could not load profile: "+error.message);return;}
 profile=data;const f=$("#profileForm");Object.keys(data).forEach(k=>{if(f.elements[k])f.elements[k].value=data[k]??"";});
}
async function loadItems(){
 const {data,error}=await client.from("portfolio_items").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
 if(error){toast("Could not load items: "+error.message);return;}allItems=data||[];renderList();
}
function showTab(type){
 activeType=type;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===type));
 const isProfile=type==="profile";$("#profileForm").classList.toggle("hidden",!isProfile);$("#itemForm").classList.toggle("hidden",isProfile);
 $("#formTitle").textContent=isProfile?"Edit profile":"Add "+labels[type].slice(0,-1);$("#listTitle").textContent=isProfile?"Your saved profile":"Your "+labels[type].toLowerCase();
 $("#urlLabel").classList.toggle("hidden",type==="skill");$("#fileLabel").classList.toggle("hidden",type!=="certificate");
 $("#fileHelp").textContent=type==="certificate"?"Upload a PDF/image (up to 10 MB), or paste a public verification URL.":"Add a relevant link if this item has one.";
 resetItemForm();renderList();
}
function resetItemForm(){const f=$("#itemForm");f.reset();f.elements.id.value="";f.elements.type.value=activeType;$("#cancelEditBtn").classList.add("hidden");$("#saveItemBtn").textContent="Save item";}
function renderList(){
 const root=$("#itemsList");root.replaceChildren();
 if(activeType==="profile"){const p=profile||{};const div=document.createElement("div");div.className="managed-item";div.innerHTML=`<h3>${esc(p.full_name||"Profile")}</h3><p>${esc(p.tagline||"")}</p><p>Profile details are edited in the form.</p>`;root.append(div);$("#countBadge").textContent="1 profile";return;}
 const rows=allItems.filter(x=>x.type===activeType);$("#countBadge").textContent=rows.length+" items";
 if(!rows.length){root.append(Object.assign(document.createElement("p"),{className:"empty",textContent:"Nothing added yet. Use the form to add your first item."}));return;}
 rows.forEach(item=>{const card=document.createElement("div");card.className="managed-item";card.innerHTML=`<h3>${esc(item.title)}</h3><p>${esc(item.category||labels[item.type])}${item.date_label?" · "+esc(item.date_label):""}</p><p>${esc(item.description||"")}</p><div class="item-actions"><button class="small-btn" data-edit="${item.id}">Edit</button><button class="small-btn delete" data-delete="${item.id}">Delete</button></div>`;root.append(card);});
 root.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editItem(b.dataset.edit)));
 root.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteItem(b.dataset.delete)));
}
function editItem(id){
 const item=allItems.find(x=>x.id===id);if(!item)return;const f=$("#itemForm");
 ["id","type","title","description","url","category","date_label"].forEach(k=>{if(f.elements[k])f.elements[k].value=item[k]||"";});
 $("#formTitle").textContent="Edit "+labels[activeType].slice(0,-1);$("#saveItemBtn").textContent="Update item";$("#cancelEditBtn").classList.remove("hidden");
}
async function deleteItem(id){
 const item=allItems.find(x=>x.id===id);if(!item||!confirm(`Delete "${item.title}"?`))return;
 const {error}=await client.from("portfolio_items").delete().eq("id",id);
 if(error){toast("Delete failed: "+error.message);return;}
 if(item.file_path)await client.storage.from("portfolio-files").remove([item.file_path]);
 toast("Item deleted.");await loadItems();
}
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!client){toast("Configure Supabase first.");return;}
 const email=$("#loginEmail").value.trim(),password=$("#loginPassword").value;
 const {error}=await client.auth.signInWithPassword({email,password});
 if(error){$("#loginMessage").textContent=error.message;return;}currentUser=(await client.auth.getUser()).data.user;await showDashboard();
});
$("#logoutBtn").addEventListener("click",async()=>{await client.auth.signOut();currentUser=null;showLogin()});
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)showTab(b.dataset.tab)});
$("#profileForm").addEventListener("submit",async e=>{
 e.preventDefault();const values=formObject(e.currentTarget);delete values.id;delete values.updated_at;
 const {error}=await client.from("portfolio_profile").update({...values,updated_at:new Date().toISOString()}).eq("id",1);
 if(error){toast("Save failed: "+error.message);return;}toast("Profile saved!");await loadProfile();
});
$("#itemForm").addEventListener("submit",async e=>{
 e.preventDefault();const f=e.currentTarget,values=formObject(f),file=f.elements.file.files[0],id=values.id;
 let file_path="";
 if(id){const old=allItems.find(x=>x.id===id);file_path=old?.file_path||"";}
 if(file){
   if(file.size>10*1024*1024){toast("File is larger than 10 MB.");return;}
   const ext=(file.name.split(".").pop()||"file").toLowerCase();
   const path=`${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
   const {error:upErr}=await client.storage.from("portfolio-files").upload(path,file,{upsert:false,contentType:file.type});
   if(upErr){toast("Upload failed: "+upErr.message);return;}file_path=path;
 }
 const record={type:activeType,title:values.title.trim(),description:values.description.trim(),url:values.url||"",category:values.category||"",date_label:values.date_label||"",file_path};
 let result;
 if(id){result=await client.from("portfolio_items").update(record).eq("id",id);if(file){const old=allItems.find(x=>x.id===id);if(old?.file_path)await client.storage.from("portfolio-files").remove([old.file_path]);}}
 else result=await client.from("portfolio_items").insert(record);
 if(result.error){toast("Save failed: "+result.error.message);return;}
 toast(id?"Changes saved!":"Added to your portfolio!");resetItemForm();await loadItems();
});
$("#cancelEditBtn").addEventListener("click",resetItemForm);
refreshSession();

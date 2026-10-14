const DATA_URL = 'data.json';
const DAYS = ['SAT','SUN','MON','TUE','WED','THU','FRI'];
const MONTH_NAMES = {AUG:'August',SEP:'September',OCT:'October'};
const $ = (id) => document.getElementById(id);
let data, activeMonth='OCT', activeDate='2026-10-14', activeDay='WED';
let importedState = {};
let liveState = {};

function keyFor(month, day, index){ return `${month}:${day.date}:${index}`; }
function monthDays(month){ return data.months[month]?.days || []; }
function monthStats(month){
  const days=monthDays(month); let total=0,done=0;
  days.forEach(day=>day.tasks.forEach((t,i)=>{total++; if(getDone(month,day,i,t))done++;}));
  return {total,done,pct:total?Math.round(done/total*100):0,dates:days.length};
}
function getDone(month,day,index,task){const k=keyFor(month,day,index);return Object.prototype.hasOwnProperty.call(liveState,k)?liveState[k]:!!task.done;}
function setDone(month,day,index,task,value){liveState[keyFor(month,day,index)]=value;saveState();renderMonth();renderHero();renderAnnual();}
function saveState(){try{localStorage.setItem('lp-routine-state-v1',JSON.stringify(liveState));}catch(e){}}
function loadState(){try{liveState=JSON.parse(localStorage.getItem('lp-routine-state-v1')||'{}');}catch(e){liveState={};}}
function renderHero(){
 const day=monthDays(activeMonth).find(d=>d.date===activeDate)||monthDays(activeMonth)[0];
 if(!day)return;
 const done=day.tasks.reduce((n,t,i)=>n+(getDone(activeMonth,day,i,t)?1:0),0), pct=day.tasks.length?Math.round(done/day.tasks.length*100):0;
 $('todayLabel').textContent=new Date(day.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}).toUpperCase();
 $('heroTitle').textContent=pct===100?'You did it! ✨':pct>=50?'You’re making progress.':'Small steps count.';
 $('heroSub').textContent=`${done} of ${day.tasks.length} tasks complete for ${day.day}. Keep going at your own pace.`;
 $('progressText').textContent=`${pct}%`; $('progressBar').style.width=pct+'%';
}
function renderMonthOptions(){
 $('monthSelect').innerHTML=Object.keys(data.months).map(m=>`<option value="${m}" ${m===activeMonth?'selected':''}>${MONTH_NAMES[m]||m}</option>`).join('');
}
function renderMonth(){
 const days=monthDays(activeMonth); if(!days.length)return;
 if(!days.some(d=>d.date===activeDate))activeDate=days[0].date;
 const selected=days.find(d=>d.date===activeDate)||days[0];
 $('dayStrip').innerHTML=days.map(d=>{
  const n=d.tasks.reduce((a,t,i)=>a+(getDone(activeMonth,d,i,t)?1:0),0), complete=d.tasks.length>0&&n===d.tasks.length;
  const dt=new Date(d.date+'T12:00:00');
  return `<button class="date-chip ${d.date===selected.date?'selected':''} ${complete?'complete':''}" data-date="${d.date}"><span class="dow">${d.day.slice(0,3)}</span><span class="dom">${dt.getDate()}</span><span class="dot"></span></button>`;
 }).join('');
 $('dayStrip').querySelectorAll('[data-date]').forEach(btn=>btn.addEventListener('click',()=>{activeDate=btn.dataset.date;renderMonth();renderHero();}));
 $('selectedDate').textContent=new Date(selected.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
 $('selectedDayTitle').textContent=`${selected.day} checklist`;
 const done=selected.tasks.reduce((a,t,i)=>a+(getDone(activeMonth,selected,i,t)?1:0),0); $('dayCount').textContent=`${done}/${selected.tasks.length} done`;
 $('taskList').innerHTML=selected.tasks.map((t,i)=>{const checked=getDone(activeMonth,selected,i,t);return `<label class="task-row ${checked?'done':''}"><input class="task-check" type="checkbox" data-task-index="${i}" ${checked?'checked':''} aria-label="Mark ${escapeHtml(t.task)} complete"><span class="task-name">${escapeHtml(t.task)}</span><span class="task-index">${String(i+1).padStart(2,'0')}</span></label>`}).join('')||'<div class="empty">No tasks listed for this day.</div>';
 $('taskList').querySelectorAll('[data-task-index]').forEach(el=>el.addEventListener('change',()=>setDone(activeMonth,selected,Number(el.dataset.taskIndex),selected.tasks[Number(el.dataset.taskIndex)],el.checked)));
}
function renderSetup(){
 const day=$('weekdaySelect').value||'SAT';const tasks=data.schedule[day]||[];
 $('setupCount').textContent=tasks.length; $('setupFirst').textContent=tasks[0]?.time||'—'; $('setupLast').textContent=tasks[tasks.length-1]?.time||'—';
 $('scheduleList').innerHTML=tasks.map((t,i)=>`<div class="schedule-row"><span class="schedule-time">${escapeHtml(t.time)}</span><span class="schedule-task">${escapeHtml(t.task)}</span></div>`).join('')||'<div class="empty">No routine entries found.</div>';
}
function renderAnnual(){
 const months=Object.keys(data.months);let total=0,done=0,dates=0;
 $('annualCards').innerHTML=months.map(m=>{const s=monthStats(m);total+=s.total;done+=s.done;dates+=s.dates;return `<article class="annual-card"><div class="annual-card-head"><strong>${MONTH_NAMES[m]||m} 2026</strong><span>${s.pct}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.pct}%"></div></div><div class="annual-card-meta"><span>${s.done} / ${s.total} tasks</span><span>${s.dates} dates</span></div></article>`}).join('');
 $('annualDates').textContent=dates; $('annualDone').textContent=done; $('annualPercent').textContent=(total?Math.round(done/total*100):0)+'%';
}
function renderCare(){
 const stats=monthStats(activeMonth); const pct=stats.pct;
 $('carePercent').textContent=pct+'%'; $('careBar').style.width=pct+'%'; $('careTotal').textContent=stats.total; $('careCompleted').textContent=stats.done; $('careRemaining').textContent=stats.total-stats.done;
 const thresholds=data.care.thresholds||[];
 $('milestoneList').innerHTML=thresholds.map(t=>`<div class="milestone"><span class="milestone-percent">${Math.round(Number(t.percentage)*100)}%</span><span class="milestone-action">${escapeHtml(String(t.action||'Milestone'))}</span><span class="milestone-minutes">${t.minutes==null?'':escapeHtml(String(t.minutes))+' min'}</span></div>`).join('');
 $('careCategories').innerHTML=(data.care.categories||[]).map(c=>{const p=Math.round(Number(c.percentage||0)*100);return `<div class="category-row"><div class="category-top"><strong>${escapeHtml(c.name)}</strong><span>${c.completed??0} / ${c.total??0} complete · ${p}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div></div>`}).join('');
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function activateView(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===name));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));if(name==='setup')renderSetup();if(name==='annual')renderAnnual();if(name==='care')renderCare();}
async function init(){
 try{const res=await fetch(DATA_URL);data=await res.json();}catch(e){document.querySelector('main').innerHTML='<div class="empty">Could not load the imported routine data. Keep data.json beside index.html and reopen the app through a local web server.</div>';return;}
 // Start on today's date if that date exists; otherwise use the latest month in the workbook.
 const now=new Date();const iso=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 for(const m of Object.keys(data.months)){if(monthDays(m).some(d=>d.date===iso)){activeMonth=m;activeDate=iso;break;}}
 if(!monthDays(activeMonth).some(d=>d.date===activeDate))activeDate=monthDays(activeMonth).find(d=>d.day==='WED')?.date||monthDays(activeMonth)[0].date;
 loadState();renderMonthOptions();$('monthSelect').addEventListener('change',e=>{activeMonth=e.target.value;activeDate=monthDays(activeMonth)[0]?.date;renderMonth();renderHero();renderAnnual();});
 $('weekdaySelect').innerHTML=DAYS.map(d=>`<option value="${d}">${({SAT:'Saturday',SUN:'Sunday',MON:'Monday',TUE:'Tuesday',WED:'Wednesday',THU:'Thursday',FRI:'Friday'})[d]}</option>`).join('');
 const selectedDay=monthDays(activeMonth).find(d=>d.date===activeDate)?.day||'SAT';$('weekdaySelect').value=selectedDay;$('weekdaySelect').addEventListener('change',renderSetup);
 document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>activateView(b.dataset.view)));
 $('resetBtn').addEventListener('click',()=>$('resetDialog').showModal());$('cancelReset').addEventListener('click',()=>$('resetDialog').close());$('confirmReset').addEventListener('click',()=>{liveState={};try{localStorage.removeItem('lp-routine-state-v1')}catch(e){}$('resetDialog').close();renderMonth();renderHero();renderAnnual();renderCare();});
 renderMonth();renderHero();renderSetup();renderAnnual();renderCare();
 if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
init();

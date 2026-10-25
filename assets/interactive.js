// Optional experiences only. The professional portfolio is always the default.
// No eval, remote terminal, analytics, API key or extra framework is used.
(() => {
  "use strict";
  const toggle = document.getElementById("modeSwitch");
  const modeState = toggle.querySelector(".mode-switch-state");
  const professional = [...document.querySelectorAll(".mode-professional")];
  const interactive = [...document.querySelectorAll(".mode-interactive")];
  const terminal = document.getElementById("terminalInput");

  function setMode(active) {
    if (document.activeElement && document.activeElement !== toggle && interactive.some(node => node.contains(document.activeElement))) toggle.focus();
    document.body.dataset.mode = active ? "interactive" : "professional";
    professional.forEach(node => { node.hidden = active; });
    interactive.forEach(node => { node.hidden = !active; });
    toggle.setAttribute("aria-checked", String(active));
    toggle.setAttribute("aria-label", active ? "Disable interactive mode" : "Enable interactive mode");
    modeState.textContent = active ? "ON" : "OFF";
    if (active) requestAnimationFrame(() => window.starGlobe?.resize());
    else window.starGlobe?.pause();
  }
  toggle.addEventListener("click", () => setMode(toggle.getAttribute("aria-checked") !== "true"));
  setMode(false);

  // Asteriva Interactive scene lives in sky-globe.js. The sky is an artistic 3D model,
  // deliberately not a scientific reconstruction of any real date/location.
  const city = document.getElementById('starCity');
  document.getElementById('starForm').addEventListener('submit', event => {
    event.preventDefault();
    window.starGlobe?.regenerate();
  });
  document.getElementById('labStory').addEventListener('click', () => window.openProject('asteriva'));
  window.openAsterivaLab = () => {
    setMode(true);
    document.getElementById('asterivaLab').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
    window.setTimeout(() => city.focus({preventScroll: true}), 150);
  };

  const output=document.getElementById("terminalOutput");
  const input=document.getElementById("terminalInput");
  const history=[];
  let historyIndex=0;
  const replies={
    help:["Supported: help, whoami, projects, skills, education, security, contact, github, open asteriva, open ludo, clear, exit."],
    whoami:["Eldin Nurkic — Bacc. inf. tech. focused on software, web applications and database systems.","Currently learning cybersecurity. Open to remote IT opportunities."],
    projects:["01 / Asteriva — Android personalized night sky poster app.","02 / Ludo Club — playable browser-based game.","Try: open asteriva | open ludo"],
    skills:["Web: HTML, CSS, JavaScript | Data: SQL and relational modelling | Other: C/C++, Kotlin, Python, FastAPI.","Skills shown are interests and project technologies, not certifications."],
    education:["Bacc. inf. tech. — Information Technology, IPI Akademija Tuzla. Background in automation and robotics."],
    security:["Cybersecurity is a learning focus, not a professional specialization claimed here.","Interests: web security, access control and secure application design."],
    contact:["GitHub: github.com/nurkaje","Email and LinkedIn links are available in the Contact section below."],
    github:["GitHub: https://github.com/nurkaje"]
  };
  function line(text,kind='reply') {
    const p=document.createElement('p'); p.className='terminal-line '+(kind==='command'?'terminal-echo':'terminal-reply'); p.textContent=text;output.appendChild(p);
    while(output.children.length>35) output.children[1].remove();
    output.scrollTop=output.scrollHeight;
  }
  function run(raw) {
    const cmd=raw.trim().toLowerCase().replace(/\s+/g,' ');
    if(!cmd) return;
    line('visitor@eldin ~ $ '+raw.trim(),'command');
    history.push(raw.trim()); if(history.length>30) history.shift(); historyIndex=history.length;
    if(cmd==='clear') { output.replaceChildren();line('Terminal cleared. Type help for commands.'); return; }
    if(cmd==='exit') { setMode(false);return; }
    if(cmd==='open asteriva') { line('Opening Asteriva concept lab above…');window.openAsterivaLab();return; }
    if(cmd==='open ludo') {line('Opening Ludo Club in a new tab…');window.open('games/my_ludo_club.html','_blank','noopener,noreferrer'); return;}
    // Read the SAME PDF URL as the Contact section; keep private contact settings in main.js.
    const answer=replies[cmd];
    (answer||['Unknown command. Type help to see supported commands.']).forEach(text=>line(text));
  }
  document.getElementById('terminalForm').addEventListener('submit',event=>{event.preventDefault(); const value=input.value;input.value='';run(value);});
  document.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>{run(button.dataset.command);input.focus();}));
  input.addEventListener('keydown',event=>{
    if(event.key==='ArrowUp') {event.preventDefault(); historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}
    if(event.key==='ArrowDown') {event.preventDefault(); historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||'';}
  });

  const steps=[
    {label:'01 — UNDERSTAND',title:'Start with a real problem.',body:'I define what the software should do and which constraints matter before choosing the tools.'},
    {label:'02 — BUILD',title:'Create a working version.',body:'I connect the UI, data and application logic, then iterate on the details. Asteriva combines an Android interface with a Python/FastAPI service.'},
    {label:'03 — VERIFY',title:'Test the actual experience.',body:'I check edge cases, fix problems and make the interface clearer, including mobile usability and input validation.'}
  ];
  const detail=document.getElementById('workflowDetail');
  document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.step),s=steps[index];
    document.querySelectorAll('[data-step]').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    detail.replaceChildren();
    const label=document.createElement('span'),title=document.createElement('h3'),body=document.createElement('p');
    label.textContent=s.label;title.textContent=s.title;body.textContent=s.body;detail.append(label,title,body);
  }));
})();


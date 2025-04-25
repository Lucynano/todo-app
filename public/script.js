// script.js

// Brancher le formulaire

const form = document.getElementById('task-form');
const listEl = document.getElementById('task-list');

form.addEventListener('submit', e => {
    e.preventDefault(); // empeche le rechargement
    const task = {
        id: Date.now(), // identifiant unique
        title: form['task-title'].value.trim(),
        desc: form['task-desc'].value.trim(),
        cat: form['task-category'].value.trim() || 'Sans catégorie',
        date: form['task-date'].value || null,
        done: false
    };
    saveTask(task);
    form.reset();
    renderTasks();
});

// Stocker / charger depuis localStorage

function loadTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTask(task) {
    const tasks = loadTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveAll(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

let state = {
    search: '',
    cat: '',
    sort: 'dateDesc'
};

const searchInput = document.getElementById('search');
const catSelect = document.getElementById('filter-cat');
const sortSelect = document.getElementById('sort');

searchInput.addEventListener('input', e => { state.search = e.target.value.toLowerCase(); renderTasks(); });
catSelect.addEventListener('change', e => { state.cat = e.target.value; renderTasks(); });
sortSelect.addEventListener('change', e => { state.sort = e.target.value; renderTasks(); });

// Afficher la liste

function renderTasks(filter = {}) {
    const tasks = loadTasks();
    listEl.innerHTML = ''; // reset

    // maj du selecteur de categories
    catSelect.innerHTML = '<option value="">Toutes catégories</option>';
    [...new Set(tasks.map(t => t.cat))].forEach(c=>{
        const opt=document.createElement('option');
        opt.value=opt.textContent=c;
        if(c===state.cat) opt.selected=true;
        catSelect.appendChild(opt);
    });

    // Appliquer les filtres
    let filtered = tasks
    .filter(t => (!state.cat || t.cat===state.cat))
    .filter(t => t.title.toLowerCase().includes(state.search));

    // appliquer le tri
    switch(state.sort) {
        case 'alpha': filtered.sort((a, b)=>a.title.localeCompare(b.title)); break;
        case 'dateAsc': filtered.sort((a, b)=>(a.date||'').localeCompare(b.date||'')); break;
        case 'dateDesc': filtered.sort((a, b)=>(b.date||'').localeCompare(a.date||'')); break;
        case 'status': filtered.sort((a, b)=>a.done-b.done); break;
    }

    filtered.forEach(t => {
        if(filter.cat && t.cat !== filter.cat) return;
        const card = document.createElement('div');
        card.className = 'task-card' + (t.done ? ' done' : '');
        card.innerHTML = `
        <h3>${t.title}</h3>
        <p>${t.desc || ''}</p>
        <small>${t.cat} • ${t.date ?? ''}</small>
        <button data-id="${t.id}" class="toggle">✅</button>
        <button data-id="${t.id}" class="delete">🗑️</button>`;
        listEl.appendChild(card);
    });
}

renderTasks(); // appel initial a l'ouverture

// Gérer “terminée” / supprimer

listEl.addEventListener('click', e => {
    if(!e.target.dataset.id) return;
    const id = Number(e.target.dataset.id);
    let tasks = loadTasks();

    if(e.target.classList.contains('toggle')) {
        tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    }
    if(e.target.classList.contains('delete')) {
        tasks = tasks.filter(t => t.id !== id);
    }
    saveAll(tasks);
    renderTasks();
});








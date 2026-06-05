/**
 * FreeCAD IPS - Kanban Board (Multi-Sprint)
 * ============================================
 * Drag & Drop nativo + localStorage + edición de tarjetas
 * Soporta múltiples sprints con switcher
 */

const FreeCAD_Kanban = (() => {
    'use strict';

    // ============================================
    // TASK TYPES
    // ============================================
    const TASK_TYPES = [
        { id: 'task',     label: 'Task',     color: '#95a5a6' },
        { id: 'feature',  label: 'Feature',  color: '#f39c12' },
        { id: 'bug',      label: 'Bug',      color: '#e74c3c' },
        { id: 'docs',     label: 'Docs',     color: '#8e44ad' },
        { id: 'research', label: 'Research', color: '#3498db' }
    ];

    // ============================================
    // DEFAULT SPRINT BOARDS
    // ============================================
    const DEFAULT_BOARDS = {
        sprint0: {
            label: 'Sprint 0',
            icon: 'fa-check-circle',
            'product-backlog': [],
            'sprint-backlog': [],
            inprogress: [],
            review: [],
            done: [
                { id: 's0-1', title: 'Configuración del repositorio GitHub', assignee: 'KevinCallo', tag: 'task', tagColor: '#95a5a6' },
                { id: 's0-2', title: 'Análisis de arquitectura FreeCAD (OpenCASCADE, Coin3D, Qt)', assignee: 'Equipo', tag: 'research', tagColor: '#3498db' },
                { id: 's0-3', title: 'Configuración de GitHub Projects', assignee: 'KevinCallo, darich1010', tag: 'feature', tagColor: '#f39c12' },
                { id: 's0-4', title: 'Planificación inicial del proyecto', assignee: 'Andhyb', tag: 'task', tagColor: '#95a5a6' },
                { id: 's0-5', title: 'Definición de historias de usuario', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' }
            ]
        },
        sprint1: {
            label: 'Sprint 1',
            icon: 'fa-check-circle',
            'product-backlog': [
                { id: 's1-6', title: 'Schedule planning', assignee: 'Andhyb', tag: 'task', tagColor: '#95a5a6' },
                { id: 's1-7', title: 'Documentación técnica inicial', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' }
            ],
            'sprint-backlog': [],
            inprogress: [],
            review: [],
            done: [
                { id: 's1-1', title: 'Creación de GitHub Pages', assignee: 'KevinCallo, darich1010', tag: 'feature', tagColor: '#f39c12' },
                { id: 's1-2', title: 'Configuración de GitHub Actions CI/CD', assignee: 'PauloQuen', tag: 'feature', tagColor: '#f39c12' },
                { id: 's1-3', title: 'Dashboard del proyecto v1', assignee: 'mathiasddf, PauloQuen', tag: 'feature', tagColor: '#f39c12' },
                { id: 's1-4', title: 'Testing de Issues & Actions', assignee: 'mathiasddf, PauloQuen', tag: 'task', tagColor: '#95a5a6' },
                { id: 's1-5', title: 'Pipeline CI/CD funcional', assignee: 'PauloQuen', tag: 'feature', tagColor: '#f39c12' }
            ]
        },
        sprint2: {
            label: 'Sprint 2',
            icon: 'fa-bolt',
            'product-backlog': [
                { id: 's2-1', title: 'Investigación de restricciones paramétricas', assignee: 'PauloQuen', tag: 'research', tagColor: '#3498db' }
            ],
            'sprint-backlog': [
                { id: 's2-2', title: 'Pruebas de integración módulo BIM', assignee: 'darich1010', tag: 'bug', tagColor: '#e74c3c' },
                { id: 's2-3', title: 'Documentación de módulos BIM', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' }
            ],
            inprogress: [
                { id: 's2-4', title: 'Implementación de funcionalidades BIM', assignee: 'mathiasddf', tag: 'feature', tagColor: '#f39c12' },
                { id: 's2-5', title: 'Herramientas paramétricas Part', assignee: 'KevinCallo', tag: 'feature', tagColor: '#f39c12' }
            ],
            review: [],
            done: [
                { id: 's2-6', title: 'Setup del entorno de desarrollo BIM', assignee: 'KevinCallo', tag: 'task', tagColor: '#95a5a6' }
            ]
        }
    };

    const STORAGE_KEY = 'fc_kanban_boards';
    const ACTIVE_KEY = 'fc_kanban_active';

    // ============================================
    // STATE
    // ============================================
    let boards = {};
    let activeSprint = 'sprint2';
    let dragSource = null;

    // ============================================
    // PERSISTENCE
    // ============================================
    function loadBoards() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Migration: ensure all 5 columns exist for every sprint
                // Old column names: backlog → product-backlog, todo → sprint-backlog
                const COLUMN_MIGRATE = { backlog: 'product-backlog', todo: 'sprint-backlog' };
                const ALL_COLUMNS = ['product-backlog', 'sprint-backlog', 'inprogress', 'review', 'done'];
                ['sprint0', 'sprint1', 'sprint2'].forEach(sk => {
                    if (!parsed[sk]) parsed[sk] = {};
                    // Step 1: migrate old column names if they exist
                    Object.keys(COLUMN_MIGRATE).forEach(oldCol => {
                        if (parsed[sk][oldCol]) {
                            const newCol = COLUMN_MIGRATE[oldCol];
                            if (!parsed[sk][newCol]) parsed[sk][newCol] = [];
                            // Merge old items into new column (avoid duplicates by id)
                            const existingIds = new Set(parsed[sk][newCol].map(t => t.id));
                            parsed[sk][oldCol].forEach(t => {
                                if (!existingIds.has(t.id)) {
                                    parsed[sk][newCol].push(t);
                                }
                            });
                            delete parsed[sk][oldCol];
                        }
                    });
                    // Step 2: ensure all 5 columns exist
                    ALL_COLUMNS.forEach(col => {
                        if (!parsed[sk][col]) parsed[sk][col] = [];
                        // Ensure tagColor migrates on each task
                        parsed[sk][col].forEach(t => {
                            if (!t.tagColor && t.tag) {
                                const found = TASK_TYPES.find(tt => tt.id === t.tag);
                                t.tagColor = found ? found.color : '#95a5a6';
                            }
                        });
                    });
                });
                return parsed;
            }
        } catch (e) { /* ignore */ }
        return JSON.parse(JSON.stringify(DEFAULT_BOARDS));
    }

    function saveBoards() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
        } catch (e) { /* ignore */ }
    }

    function loadActiveSprint() {
        try {
            const saved = localStorage.getItem(ACTIVE_KEY);
            if (saved && ['sprint0', 'sprint1', 'sprint2'].includes(saved)) return saved;
        } catch (e) { /* ignore */ }
        return 'sprint2';
    }

    function saveActiveSprint() {
        try {
            localStorage.setItem(ACTIVE_KEY, activeSprint);
        } catch (e) { /* ignore */ }
    }

    function getCurrentTasks() {
        return boards[activeSprint] || {};
    }

    // ============================================
    // ASSIGNEE OPTIONS
    // ============================================
    function getAssigneeOptions() {
        const members = (FreeCAD_IPS && FreeCAD_IPS.TEAM_MEMBERS) || [];
        const names = members.map(m => ({
            value: m.name, label: m.name, initials: m.initials, color: m.color
        }));
        names.push({ value: 'Equipo', label: 'Equipo', initials: 'EQ', color: '#95a5a6' });
        names.push({ value: 'KevinCallo, darich1010', label: 'KevinC + darich', initials: 'K+D', color: '#8e44ad' });
        names.push({ value: 'mathiasddf, PauloQuen', label: 'mathias + Paulo', initials: 'M+P', color: '#3498db' });
        return names;
    }

    // ============================================
    // RENDER
    // ============================================
    function isSprintEditable() {
        return activeSprint === 'sprint2';
    }

    function renderBoard() {
        const tasks = getCurrentTasks();
        const columns = ['product-backlog', 'sprint-backlog', 'inprogress', 'review', 'done'];
        const editable = isSprintEditable();

        // Update kanban title
        const sprintInfo = boards[activeSprint] || {};
        const header = document.querySelector('#board .section-header h2');
        if (header) {
            header.textContent = editable
                ? `Tablero Kanban · ${sprintInfo.label || activeSprint}`
                : `Tablero Kanban · ${sprintInfo.label || activeSprint} (solo lectura)`;
        }
        // Update sub-text
        const subEl = document.querySelector('#board .section-header .section-sub');
        if (subEl) {
            subEl.innerHTML = editable
                ? `Arrastrá las tarjetas · <a href="https://github.com/users/KevinCallo/projects/4/" target="_blank" style="color:var(--fc-blue-600);text-decoration:underline;">Sincronizado con GitHub Projects</a>`
                : `<i class="fa-regular fa-eye"></i> Vista histórica — solo lectura`;
        }
        // Update description paragraph
        const descEl = document.getElementById('kanban-desc');
        if (descEl) {
            descEl.innerHTML = editable
                ? `Las tareas del equipo se gestionan a través de <strong>GitHub Projects</strong> con un flujo Kanban. <strong>Arrastrá las tarjetas</strong> entre columnas para actualizar el estado. También podés hacer <strong>clic en las cards del dashboard</strong> para cambiar de sprint histórico.`
                : `<i class="fa-regular fa-clock"></i> Mostrando datos históricos del <strong>${sprintInfo.label || activeSprint}</strong>. Las tareas de este sprint ya fueron completadas y están disponibles solo como referencia.`;
        }

        // Update sprint tabs with read-only indicator
        document.querySelectorAll('.kanban-sprint-tab').forEach(tab => {
            const isActive = tab.dataset.kanbanSprint === activeSprint;
            tab.classList.toggle('kanban-sprint-tab--active', isActive);
            tab.classList.toggle('kanban-sprint-tab--readonly', !isActive && tab.dataset.kanbanSprint !== 'sprint2');
        });

        columns.forEach(colId => {
            const container = document.querySelector(`.kanban-items[data-column="${colId}"]`);
            const countEl = document.querySelector(`.kanban-column-header[data-column="${colId}"] .count`);
            if (!container) return;

            const addCard = container.querySelector('.kanban-add-card');
            const cardForm = container.querySelector('.kanban-card-form');
            container.innerHTML = '';

            const items = tasks[colId] || [];
            items.forEach(item => {
                const el = createTaskElement(item, colId, editable);
                container.appendChild(el);
            });

            // Only show add-card/card-form for editable sprints
            if (editable) {
                if (addCard) container.appendChild(addCard);
                if (cardForm) container.appendChild(cardForm);
            }

            if (countEl) countEl.textContent = items.length;
        });
    }

    function createTaskElement(item, columnId, editable) {
        const div = document.createElement('div');
        const cssCol = columnId === 'inprogress' ? 'progress' : columnId;
        div.className = `kanban-item kanban-item--${cssCol}`;
        div.draggable = editable;
        div.dataset.id = item.id;

        const tagColor = item.tagColor || '#95a5a6';
        const tagObj = TASK_TYPES.find(t => t.id === item.tag);
        const tagLabel = tagObj ? tagObj.label : (item.tag || '');

        // Actions: show edit/delete only for editable sprints
        const actionsHtml = editable ? `
            <div class="kanban-item-actions">
                <button class="kanban-item-edit" data-id="${item.id}" title="Editar tarea" aria-label="Editar tarea">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="kanban-item-delete" data-id="${item.id}" title="Eliminar tarea" aria-label="Eliminar tarea">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        ` : '';

        div.innerHTML = `
            <div class="kanban-item-header">
                <div class="item-title">${escapeHtml(item.title)}</div>
                ${actionsHtml}
            </div>
            <div class="item-meta">
                ${item.assignee ? `<span class="assignee"><i class="fa-regular fa-user"></i> ${escapeHtml(item.assignee)}</span>` : ''}
                ${item.tag ? `<span class="item-tag" style="background:${tagColor}22; color:${tagColor}">${escapeHtml(tagLabel)}</span>` : ''}
            </div>
        `;

        // Only add drag & drop and editor for editable sprints
        if (editable) {
            div.innerHTML += `
                <div class="kanban-item-editor" style="display:none;" data-id="${item.id}">
                    <input type="text" class="kanban-edit-title" value="${escapeHtml(item.title)}" placeholder="Título" maxlength="80">
                    <select class="kanban-edit-assignee">${buildAssigneeOptions(item.assignee)}</select>
                    <select class="kanban-edit-type">${buildTypeOptions(item.tag)}</select>
                    <div class="kanban-edit-actions">
                        <button class="kanban-edit-save" data-id="${item.id}">Guardar</button>
                        <button class="kanban-edit-cancel" data-id="${item.id}">Cancelar</button>
                    </div>
                </div>
            `;

            div.addEventListener('dragstart', (e) => {
                if (div.querySelector('.kanban-item-editor').style.display !== 'none') { e.preventDefault(); return; }
                div.classList.add('kanban-item--dragging');
                dragSource = { element: div, column: columnId, id: item.id };
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.id);
            });
            div.addEventListener('dragend', () => {
                div.classList.remove('kanban-item--dragging');
                document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('kanban-column--drag-over'));
                dragSource = null;
            });

            const editBtn = div.querySelector('.kanban-item-edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleEditMode(div, item, columnId, true);
                });
            }
            div.addEventListener('dblclick', (e) => {
                if (!e.target.closest('.kanban-item-edit') && !e.target.closest('.kanban-item-editor')) {
                    toggleEditMode(div, item, columnId, true);
                }
            });
        }

        return div;
    }

    // ============================================
    // EDIT MODE
    // ============================================
    function toggleEditMode(cardEl, item, columnId, show) {
        const display = cardEl.querySelector('.kanban-item-header');
        const editor = cardEl.querySelector('.kanban-item-editor');
        if (!editor) return;
        if (show) {
            document.querySelectorAll('.kanban-item-editor[style*="display: block"]').forEach(el => {
                if (el.dataset.id !== item.id) {
                    const pc = el.closest('.kanban-item');
                    if (pc) {
                        const h = pc.querySelector('.kanban-item-header');
                        if (h) h.style.display = '';
                        el.style.display = 'none';
                    }
                }
            });
            display.style.display = 'none';
            editor.style.display = 'block';
            cardEl.draggable = false;
            const ti = editor.querySelector('.kanban-edit-title');
            if (ti) setTimeout(() => ti.focus(), 50);
        } else {
            display.style.display = '';
            editor.style.display = 'none';
            cardEl.draggable = true;
        }
    }

    function setupEditorEvents() {
        document.addEventListener('click', (e) => {
            const saveBtn = e.target.closest('.kanban-edit-save');
            if (!saveBtn) return;
            if (!isSprintEditable()) return;
            const id = saveBtn.dataset.id;
            const editor = document.querySelector(`.kanban-item-editor[data-id="${id}"]`);
            const card = editor ? editor.closest('.kanban-item') : null;
            if (!card || !editor) return;
            const newTitle = editor.querySelector('.kanban-edit-title').value.trim();
            const newAssignee = editor.querySelector('.kanban-edit-assignee').value;
            const newTag = editor.querySelector('.kanban-edit-type').value;
            if (!newTitle) return;
            const tasks = getCurrentTasks();
            for (const colId of Object.keys(tasks)) {
                const idx = tasks[colId].findIndex(t => t.id === id);
                if (idx !== -1) {
                    tasks[colId][idx].title = newTitle;
                    tasks[colId][idx].assignee = newAssignee;
                    tasks[colId][idx].tag = newTag;
                    tasks[colId][idx].tagColor = getTagColor(newTag);
                    break;
                }
            }
            saveBoards();
            renderBoard();
            FreeCAD_IPS.showToast('Tarea actualizada', 'success');
        });

        document.addEventListener('click', (e) => {
            const cancelBtn = e.target.closest('.kanban-edit-cancel');
            if (!cancelBtn) return;
            if (!isSprintEditable()) return;
            const id = cancelBtn.dataset.id;
            const card = document.querySelector(`.kanban-item[data-id="${id}"]`);
            if (card) {
                const h = card.querySelector('.kanban-item-header');
                if (h) h.style.display = '';
                const editor = card.querySelector('.kanban-item-editor');
                if (editor) {
                    editor.style.display = 'none';
                    const item = findTaskById(id);
                    if (item) {
                        editor.querySelector('.kanban-edit-title').value = item.title;
                        editor.querySelector('.kanban-edit-assignee').value = item.assignee || '';
                        editor.querySelector('.kanban-edit-type').value = item.tag || 'task';
                    }
                }
                card.draggable = true;
            }
        });

        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.kanban-item-delete');
            if (!deleteBtn) return;
            if (!isSprintEditable()) return;
            const id = deleteBtn.dataset.id;
            if (!confirm('¿Eliminar esta tarea?')) return;
            const tasks = getCurrentTasks();
            for (const colId of Object.keys(tasks)) {
                const idx = tasks[colId].findIndex(t => t.id === id);
                if (idx !== -1) {
                    tasks[colId].splice(idx, 1);
                    break;
                }
            }
            saveBoards();
            renderBoard();
            FreeCAD_IPS.showToast('Tarea eliminada', 'info');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.closest('.kanban-edit-title')) {
                const editor = e.target.closest('.kanban-item-editor');
                if (editor) { const sb = editor.querySelector('.kanban-edit-save'); if (sb) sb.click(); }
            }
            if (e.key === 'Escape' && e.target.closest('.kanban-item-editor')) {
                const editor = e.target.closest('.kanban-item-editor');
                if (editor) { const cb = editor.querySelector('.kanban-edit-cancel'); if (cb) cb.click(); }
            }
        });
    }

    function findTaskById(id) {
        const tasks = getCurrentTasks();
        for (const colId of Object.keys(tasks)) {
            const found = tasks[colId].find(t => t.id === id);
            if (found) return found;
        }
        return null;
    }

    // ============================================
    // OPTION BUILDERS
    // ============================================
    function buildAssigneeOptions(current) {
        const options = getAssigneeOptions();
        let html = '<option value="">Sin asignar</option>';
        options.forEach(opt => {
            html += `<option value="${escapeHtml(opt.value)}" ${opt.value === current ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`;
        });
        return html;
    }
    function buildTypeOptions(current) {
        return TASK_TYPES.map(t =>
            `<option value="${t.id}" ${t.id === current ? 'selected' : ''}>${t.label}</option>`
        ).join('');
    }
    function getTagColor(tagId) {
        const found = TASK_TYPES.find(t => t.id === tagId);
        return found ? found.color : '#95a5a6';
    }

    // ============================================
    // POPULATE ADD-FORM ASSIGNEE SELECTS
    // ============================================
    function populateFormAssignees() {
        const options = getAssigneeOptions();
        document.querySelectorAll('.kanban-form-assignee').forEach(select => {
            // Only populate if empty (preserves state across renderBoard)
            if (select.options.length <= 1) {
                select.innerHTML = '<option value="">Sin asignar</option>';
                options.forEach(opt => {
                    const optEl = document.createElement('option');
                    optEl.value = opt.value;
                    optEl.textContent = opt.label;
                    select.appendChild(optEl);
                });
            }
        });
    }

    // ============================================
    // COLUMN DROP ZONES
    // ============================================
    function setupColumns() {
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; column.classList.add('kanban-column--drag-over'); });
            column.addEventListener('dragleave', () => { column.classList.remove('kanban-column--drag-over'); });
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('kanban-column--drag-over');
                if (!isSprintEditable()) return;
                if (!dragSource) return;
                const targetColumn = column.dataset.column;
                if (!targetColumn || targetColumn === dragSource.column) return;
                const tasks = getCurrentTasks();
                const sourceItems = tasks[dragSource.column] || [];
                const taskIndex = sourceItems.findIndex(t => t.id === dragSource.id);
                if (taskIndex === -1) return;
                const [movedTask] = sourceItems.splice(taskIndex, 1);
                if (!tasks[targetColumn]) tasks[targetColumn] = [];
                tasks[targetColumn].push(movedTask);
                saveBoards();
                renderBoard();
                FreeCAD_IPS.showToast(`Tarea movida a ${getColumnLabel(targetColumn)}`, 'success');
            });
        });
        document.querySelectorAll('.kanban-items').forEach(container => {
            container.addEventListener('dragover', (e) => e.preventDefault());
            container.addEventListener('drop', (e) => e.preventDefault());
        });
    }

    // ============================================
    // ADD CARD
    // ============================================
    function setupAddCard() {
        document.querySelectorAll('.kanban-add-card').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!isSprintEditable()) return;
                const col = btn.closest('.kanban-column');
                const form = col.querySelector('.kanban-card-form');
                if (form) {
                    form.classList.add('kanban-card-form--visible');
                    const inp = form.querySelector('input');
                    if (inp) inp.focus();
                }
            });
        });
        document.querySelectorAll('.kanban-card-form-add').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!isSprintEditable()) return;
                const form = btn.closest('.kanban-card-form');
                const input = form.querySelector('input');
                const assigneeSelect = form.querySelector('.kanban-form-assignee');
                const typeSelect = form.querySelector('.kanban-form-type');
                const col = form.closest('.kanban-column');
                const colId = col.dataset.column;
                const title = input.value.trim();
                if (!title) return;
                const tasks = getCurrentTasks();
                if (!tasks[colId]) tasks[colId] = [];
                tasks[colId].push({
                    id: 't' + Date.now(),
                    title,
                    assignee: assigneeSelect ? assigneeSelect.value : '',
                    tag: typeSelect ? typeSelect.value : 'task',
                    tagColor: getTagColor(typeSelect ? typeSelect.value : 'task')
                });
                input.value = '';
                if (assigneeSelect) assigneeSelect.value = '';
                if (typeSelect) typeSelect.value = 'task';
                form.classList.remove('kanban-card-form--visible');
                saveBoards();
                renderBoard();
                FreeCAD_IPS.showToast('Tarea agregada', 'success');
            });
        });
        document.querySelectorAll('.kanban-card-form-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                const form = btn.closest('.kanban-card-form');
                const inp = form.querySelector('input');
                if (inp) inp.value = '';
                form.classList.remove('kanban-card-form--visible');
            });
        });
        document.querySelectorAll('.kanban-card-form input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { const f = input.closest('.kanban-card-form'); const a = f.querySelector('.kanban-card-form-add'); if (a) a.click(); }
                if (e.key === 'Escape') { const f = input.closest('.kanban-card-form'); const c = f.querySelector('.kanban-card-form-cancel'); if (c) c.click(); }
            });
        });
    }

    // ============================================
    // SPRINT SWITCHING
    // ============================================
    function setActiveSprint(sprintKey) {
        if (!boards[sprintKey]) return;
        if (sprintKey === activeSprint) return;
        activeSprint = sprintKey;
        saveActiveSprint();
        renderBoard();

        const sprintInfo = boards[activeSprint] || {};

        // Update sprint selector cards
        document.querySelectorAll('.sprint-selectable').forEach(card => {
            const isSelected = card.dataset.sprint === sprintKey;
            card.classList.toggle('sprint-selected', isSelected);
            const hint = card.querySelector('.sprint-click-hint');
            if (hint) {
                hint.innerHTML = isSelected
                    ? '<i class="fa-solid fa-eye"></i> Viendo ahora'
                    : '<i class="fa-solid fa-mouse-pointer"></i> Ver tablero';
            }
        });

        // Update sprint tabs
        document.querySelectorAll('.kanban-sprint-tab').forEach(tab => {
            tab.classList.toggle('kanban-sprint-tab--active', tab.dataset.kanbanSprint === sprintKey);
        });

        // Update nav sprint dropdown text
        if (window.FreeCAD_IPS && typeof FreeCAD_IPS.updateNavSprintText === 'function') {
            FreeCAD_IPS.updateNavSprintText(sprintKey);
        }
        // Hero indicator
        const heroEl = document.getElementById('hero-current-sprint');
        if (heroEl) {
            const isCurrent = sprintKey === 'sprint2';
            heroEl.textContent = isCurrent
                ? `${sprintInfo.label || sprintKey} Activo`
                : `${sprintInfo.label || sprintKey} (historial)`;
        }

        // ===== SYNC BURNDOWN =====
        if (window.FreeCAD_Burndown && typeof FreeCAD_Burndown.setActiveTab === 'function') {
            FreeCAD_Burndown.setActiveTab(sprintKey);
        }
        document.querySelectorAll('.burndown-tab').forEach(tab => {
            tab.classList.toggle('burndown-tab--active', tab.dataset.sprint === sprintKey);
        });

        // ===== UPDATE METRICS =====
        const activeCountEl = document.getElementById('active-sprint-count');
        if (activeCountEl) {
            activeCountEl.textContent = sprintKey === 'sprint2' ? '1' : '0';
        }

        // ===== SYNC SPRINT DETAIL =====
        document.querySelectorAll('.sprint-detail-content').forEach(el => {
            el.style.display = 'none';
        });
        const detailTarget = document.getElementById(sprintKey + '-detail');
        if (detailTarget) detailTarget.style.display = 'block';

        // Update detail section subtitle
        const detailSub = document.getElementById('sprint-detail-sub');
        if (detailSub) {
            const labels = {
                sprint0: 'Setup y Planificación',
                sprint1: 'CI/CD y Prototipado',
                sprint2: 'BIM y Herramientas Paramétricas'
            };
            detailSub.textContent = `${sprintInfo.label || sprintKey} · ${labels[sprintKey] || ''}`;
        }

        // ===== SYNC ROLES (per-sprint) via custom event =====
        document.dispatchEvent(new CustomEvent('sprint:changed', {
            detail: { sprintKey, sprintLabel: sprintInfo.label || sprintKey }
        }));

        FreeCAD_IPS.showToast(`Mostrando ${sprintInfo.label || sprintKey}`, 'info');
    }

    function setupSprintSwitching() {
        // From dashboard cards
        document.querySelectorAll('.sprint-selectable').forEach(card => {
            card.addEventListener('click', () => {
                setActiveSprint(card.dataset.sprint);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSprint(card.dataset.sprint);
                }
            });
        });

        // From kanban tabs
        document.querySelectorAll('.kanban-sprint-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                setActiveSprint(tab.dataset.kanbanSprint);
            });
        });
    }

    // ============================================
    // RESET
    // ============================================
    function resetToDefaults() {
        boards = JSON.parse(JSON.stringify(DEFAULT_BOARDS));
        activeSprint = 'sprint2';
        saveBoards();
        saveActiveSprint();
        renderBoard();
        FreeCAD_IPS.showToast('Kanban restablecido a valores iniciales', 'info');
    }

    function getColumnLabel(colId) {
        return {
            'product-backlog': 'Product Backlog',
            'sprint-backlog': 'Sprint Backlog',
            inprogress: 'In Progress',
            review: 'Review/QA (Testing)',
            done: 'Done'
        }[colId] || colId;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================
    // INIT
    // ============================================
    let _initialized = false;
    function init() {
        if (_initialized) return;
        _initialized = true;
        boards = loadBoards();
        activeSprint = loadActiveSprint();
        renderBoard();
        populateFormAssignees();
        setupColumns();
        setupAddCard();
        setupEditorEvents();
        setupSprintSwitching();

        // Sync sprint selector cards with saved active sprint
        document.querySelectorAll('.sprint-selectable').forEach(card => {
            const isSelected = card.dataset.sprint === activeSprint;
            card.classList.toggle('sprint-selected', isSelected);
            const hint = card.querySelector('.sprint-click-hint');
            if (hint) {
                hint.innerHTML = isSelected
                    ? '<i class="fa-solid fa-eye"></i> Viendo ahora'
                    : '<i class="fa-solid fa-mouse-pointer"></i> Ver tablero';
            }
        });
    }

    document.addEventListener('fc:init', init);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }

    return {
        resetToDefaults,
        getBoards: () => boards,
        getActiveSprint: () => activeSprint,
        setActiveSprint,
        renderBoard,
        TASK_TYPES
    };
})();

// Expose to window so other modules can use it (const does NOT set window.X)
window.FreeCAD_Kanban = FreeCAD_Kanban;

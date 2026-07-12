/**
 * FreeCAD IPS - Team Roles Drag & Drop (Per-Sprint)
 * ===================================================
 * Roles: Scrum Master, Product Owner, Developer
 * Cada sprint tiene su propia asignación de roles
 * Persistencia en localStorage + diagrama visual
 */

const FreeCAD_Roles = (() => {
    'use strict';

    // ============================================
    // CONFIG
    // ============================================
    const ROLES = [
        { id: 'sm', label: 'Scrum Master', icon: 'fa-helmet-safety', color: '#e67e22', desc: 'Facilita el proceso Scrum, elimina impedimentos y asegura que el equipo siga las prácticas ágiles.' },
        { id: 'po', label: 'Product Owner', icon: 'fa-clipboard-list', color: '#8e44ad', desc: 'Define y prioriza el backlog del producto, maximiza el valor del trabajo del equipo.' },
        { id: 'dev', label: 'Developer', icon: 'fa-code', color: '#27ae60', desc: 'Desarrolla, prueba y entrega incrementos de producto con calidad.' }
    ];

    const ALL_MEMBER_IDS = ['kevin', 'mathias', 'paulo', 'darich', 'andhy'];
    const STORAGE_KEY = 'fc_roles_assignments';

    // Default roles per sprint
    const DEFAULT_SPRINT_ASSIGNMENTS = {
        sprint0: {
            label: 'Sprint 0',
            sm: ['kevin'],
            po: ['paulo'],
            dev: ['mathias', 'darich', 'andhy'],
            pool: []
        },
        sprint1: {
            label: 'Sprint 1',
            sm: ['mathias'],
            po: ['darich'],
            dev: ['kevin', 'paulo', 'andhy'],
            pool: []
        },
        sprint2: {
            label: 'Sprint 2',
            sm: ['paulo'],
            po: ['kevin'],
            dev: ['mathias', 'darich', 'andhy'],
            pool: []
        }
    };

    // ============================================
    // STATE
    // ============================================
    let allAssignments = {};     // { sprint0: {...}, sprint1: {...}, ... }
    let currentSprintKey = 'sprint2';
    let assignment = {};        // current sprint's assignment (reference)
    let dragRoleMember = null;

    // ============================================
    // PERSISTENCE
    // ============================================
    function loadAllAssignments() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);

                // MIGRATION: old flat format { sm: [...], po: [...], ... }
                // → new per-sprint format { sprint0: {...}, sprint1: {...}, ... }
                if (parsed.sm || parsed.po || parsed.dev) {
                    const oldData = { ...parsed };
                    const migrated = JSON.parse(JSON.stringify(DEFAULT_SPRINT_ASSIGNMENTS));
                    // Apply old data to sprint2 (was the only sprint back then)
                    migrated.sprint2 = { ...migrated.sprint2, ...oldData };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                    return migrated;
                }

                // New format: ensure all 3 sprints have data
                ['sprint0', 'sprint1', 'sprint2'].forEach(sk => {
                    if (!parsed[sk]) {
                        parsed[sk] = JSON.parse(JSON.stringify(DEFAULT_SPRINT_ASSIGNMENTS[sk]));
                    }
                });
                return parsed;
            }
        } catch (e) { /* ignore */ }
        return JSON.parse(JSON.stringify(DEFAULT_SPRINT_ASSIGNMENTS));
    }

    function saveAllAssignments() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allAssignments));
        } catch (e) { /* ignore */ }
    }

    // ============================================
    // SPRINT SWITCHING
    // ============================================
    function switchToSprint(sprintKey) {
        if (!allAssignments[sprintKey]) return;
        if (sprintKey === currentSprintKey) return;

        // Save current sprint's assignments (assignment IS allAssignments[currentSprintKey])
        saveAllAssignments();

        // Load new sprint
        currentSprintKey = sprintKey;
        assignment = allAssignments[sprintKey];

        // Ensure role arrays exist (defensive)
        ROLES.forEach(role => {
            if (!Array.isArray(assignment[role.id])) {
                assignment[role.id] = [];
            }
        });
        if (!Array.isArray(assignment.pool)) {
            assignment.pool = [];
        }

        // Update section title to reflect current sprint
        const sectionTitle = document.querySelector('#team .section-header h2');
        if (sectionTitle) {
            const sprintLabel = allAssignments[currentSprintKey]?.label || currentSprintKey;
            sectionTitle.textContent = `Equipo · Roles Scrum · ${sprintLabel}`;
        }

        renderRoles();
        renderRolesDiagram();
    }

    // ============================================
    // GET MEMBER DATA
    // ============================================
    function getMember(id) {
        return FreeCAD_IPS.TEAM_MEMBERS.find(m => m.id === id);
    }

    function ensurePool() {
        // Collect all assigned member IDs
        const assigned = new Set();
        ROLES.forEach(role => {
            (assignment[role.id] || []).forEach(id => assigned.add(id));
        });
        // Reset pool to all members minus assigned
        assignment.pool = ALL_MEMBER_IDS.filter(id => !assigned.has(id));
    }

    // ============================================
    // RENDER
    // ============================================
    function renderRoles() {
        // Update section subtitle to show current sprint
        const headerSub = document.querySelector('#team .section-sub');
        if (headerSub) {
            const sprintLabel = allAssignments[currentSprintKey]?.label || currentSprintKey;
            headerSub.textContent = `Arrastrá los integrantes a su rol · ${sprintLabel}`;
        }

        // Render dropzones
        ROLES.forEach(role => {
            const zone = document.querySelector(`.role-dropzone[data-role="${role.id}"]`);
            if (!zone) return;

            const membersContainer = zone.querySelector('.role-dropzone-members');
            const countEl = zone.querySelector('.role-count');
            if (!membersContainer) return;

            const members = assignment[role.id] || [];
            membersContainer.innerHTML = '';

            members.forEach(memberId => {
                const el = createMemberCard(memberId, role.id);
                membersContainer.appendChild(el);
            });

            // Update filled state
            zone.classList.toggle('role-dropzone--filled', members.length > 0);

            if (countEl) {
                countEl.textContent = members.length > 0
                    ? `${members.length} miembro${members.length !== 1 ? 's' : ''}`
                    : 'Vacío';
            }
        });

        // Render pool
        const poolContainer = document.querySelector('.team-pool-members');
        if (poolContainer) {
            ensurePool();
            const poolMembers = assignment.pool || [];
            poolContainer.innerHTML = '';

            poolMembers.forEach(memberId => {
                const el = createMemberCard(memberId, null);
                poolContainer.appendChild(el);
            });
        }
    }

    function createMemberCard(memberId, sourceRole) {
        const member = getMember(memberId);
        if (!member) {
            const dummy = document.createElement('span');
            dummy.style.display = 'none';
            return dummy;
        }

        const card = document.createElement('div');
        card.className = 'team-member-card';
        card.draggable = true;
        card.dataset.memberId = memberId;
        card.dataset.sourceRole = sourceRole || '';

        card.innerHTML = `
            <span class="team-member-avatar" style="background: ${member.color}">
                ${member.initials}
            </span>
            <span class="team-member-name">${member.name}</span>
        `;

        // Drag events
        card.addEventListener('dragstart', (e) => {
            card.classList.add('team-member-card--dragging');
            dragRoleMember = { element: card, memberId, sourceRole: sourceRole || 'pool' };
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', memberId);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('team-member-card--dragging');
            document.querySelectorAll('.role-dropzone, .team-pool-members').forEach(el => {
                el.classList.remove('role-dropzone--drag-over', 'team-pool-members--drag-over');
            });
            dragRoleMember = null;
        });

        return card;
    }

    // ============================================
    // SETUP DROP ZONES
    // ============================================
    function setupDropZones() {
        // Role dropzones
        document.querySelectorAll('.role-dropzone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('role-dropzone--drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('role-dropzone--drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('role-dropzone--drag-over');
                handleDrop(zone.dataset.role);
            });
        });

        // Pool dropzone
        const poolContainer = document.querySelector('.team-pool-members');
        if (poolContainer) {
            poolContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                poolContainer.classList.add('team-pool-members--drag-over');
            });

            poolContainer.addEventListener('dragleave', () => {
                poolContainer.classList.remove('team-pool-members--drag-over');
            });

            poolContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                poolContainer.classList.remove('team-pool-members--drag-over');
                handleDrop('pool');
            });
        }
    }

    // ============================================
    // HANDLE DROP
    // ============================================
    function handleDrop(targetRole) {
        if (!dragRoleMember) return;
        const { memberId, sourceRole } = dragRoleMember;

        // If dropping in same place, do nothing
        if (sourceRole === targetRole) return;

        // Remove from source
        if (sourceRole === 'pool') {
            assignment.pool = (assignment.pool || []).filter(id => id !== memberId);
        } else {
            assignment[sourceRole] = (assignment[sourceRole] || []).filter(id => id !== memberId);
        }

        // Add to target
        if (targetRole === 'pool') {
            if (!assignment.pool) assignment.pool = [];
            assignment.pool.push(memberId);
        } else {
            if (!assignment[targetRole]) assignment[targetRole] = [];
            assignment[targetRole].push(memberId);
        }

        // Recalculate pool BEFORE saving
        ensurePool();
        // Save sprint-specific assignment + reconnect reference
        allAssignments[currentSprintKey] = JSON.parse(JSON.stringify(assignment));
        assignment = allAssignments[currentSprintKey]; // prevent dangling ref
        saveAllAssignments();

        renderRoles();
        renderRolesDiagram();

        const member = getMember(memberId);
        const roleLabel = targetRole === 'pool' ? 'Equipo' : ROLES.find(r => r.id === targetRole)?.label || targetRole;
        FreeCAD_IPS.showToast(`${member ? member.name : memberId} → ${roleLabel}`, 'success');
    }

    // ============================================
    // ROLES DIAGRAM (visual)
    // ============================================
    function renderRolesDiagram() {
        const container = document.querySelector('.roles-diagram-content');
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = 280;
        const centerX = width / 2;

        // Count assigned members
        const allAssigned = {};
        ROLES.forEach(role => {
            (assignment[role.id] || []).forEach(mId => {
                allAssigned[mId] = role.id;
            });
        });

        const sprintLabel = allAssignments[currentSprintKey]?.label || currentSprintKey;
        let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:280px;">`;

        // Title with sprint label
        svg += `<text x="${centerX}" y="24" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="700" fill="#003366">Equipo Scrum · ${sprintLabel}</text>`;

        // Draw Scrum Master (top center)
        const smRole = ROLES[0];
        const smMembers = assignment.sm || [];
        svg += drawRoleNode(centerX, 60, smRole, smMembers, allAssigned);

        // Draw PO (left)
        const poRole = ROLES[1];
        const poMembers = assignment.po || [];
        svg += drawRoleNode(centerX - 140, 160, poRole, poMembers, allAssigned);

        // Draw Developer (right)
        const devRole = ROLES[2];
        const devMembers = assignment.dev || [];
        svg += drawRoleNode(centerX + 140, 160, devRole, devMembers, allAssigned);

        // Draw unassigned
        const poolMembers = assignment.pool || [];
        if (poolMembers.length > 0) {
            const poolY = 250;
            const poolX = centerX;
            svg += `<rect x="${poolX - 80}" y="${poolY - 14}" width="160" height="28" rx="14" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="1"/>`;
            svg += `<text x="${poolX}" y="${poolY + 4}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#8888a0">Sin asignar: ${poolMembers.map(id => {
                const m = getMember(id);
                return m ? m.initials : id;
            }).join(', ')}</text>`;
        }

        svg += '</svg>';
        container.innerHTML = svg;
    }

    function drawRoleNode(x, y, role, members, allAssigned) {
        let svg = '';

        // Role circle
        const circleRadius = 28;
        svg += `<circle cx="${x}" cy="${y}" r="${circleRadius}" fill="${role.color}22" stroke="${role.color}" stroke-width="2"/>`;

        // Icon fallback
        const iconMap = {
            'fa-helmet-safety': '🛡',
            'fa-clipboard-list': '📋',
            'fa-code': '💻'
        };
        svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Inter,sans-serif" font-size="16">${iconMap[role.icon] || '?'}</text>`;

        // Label below circle
        svg += `<text x="${x}" y="${y + circleRadius + 16}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="${role.color}">${role.label}</text>`;

        // Members connected to this role
        const assignedMembers = members.length > 0 ? members : ['(vacío)'];
        const memberY = y + circleRadius + 38;

        assignedMembers.forEach((memberId, i) => {
            const isReal = memberId !== '(vacío)';
            const member = isReal ? getMember(memberId) : null;
            const my = memberY + i * 22;

            if (isReal && member) {
                svg += `<rect x="${x - 50}" y="${my - 10}" width="100" height="20" rx="10" fill="${member.color}" opacity="0.9"/>`;
                svg += `<text x="${x}" y="${my + 4}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="white">${member.initials} · ${member.name.split(' ')[0]}</text>`;
                svg += `<line x1="${x}" y1="${y + circleRadius}" x2="${x}" y2="${my - 10}" stroke="${role.color}" stroke-width="1" stroke-dasharray="3 2" opacity="0.4"/>`;
            } else if (!isReal) {
                svg += `<text x="${x}" y="${my + 3}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6" font-style="italic">Sin asignar</text>`;
            }
        });

        return svg;
    }

    // ============================================
    // RESET
    // ============================================
    function resetToDefaults() {
        allAssignments = JSON.parse(JSON.stringify(DEFAULT_SPRINT_ASSIGNMENTS));
        assignment = allAssignments[currentSprintKey];
        saveAllAssignments();
        // Update title
        const sectionTitle = document.querySelector('#team .section-header h2');
        if (sectionTitle) {
            const sprintLabel = allAssignments[currentSprintKey]?.label || currentSprintKey;
            sectionTitle.textContent = `Equipo · Roles Scrum · ${sprintLabel}`;
        }
        renderRoles();
        renderRolesDiagram();
        FreeCAD_IPS.showToast('Roles restablecidos para todos los sprints', 'info');
    }

    // ============================================
    // INIT
    // ============================================
    let _initialized = false;
    function init() {
        if (_initialized) return;
        _initialized = true;

        allAssignments = loadAllAssignments();
        // Sync with kanban's saved active sprint
        try {
            const savedActive = localStorage.getItem('fc_kanban_active');
            if (savedActive && ['sprint0', 'sprint1', 'sprint2'].includes(savedActive) && allAssignments[savedActive]) {
                currentSprintKey = savedActive;
            }
        } catch (e) { /* ignore */ }
        assignment = allAssignments[currentSprintKey] || allAssignments.sprint0;

        // Ensure role arrays exist
        ROLES.forEach(role => {
            if (!Array.isArray(assignment[role.id])) {
                assignment[role.id] = [];
            }
        });
        if (!Array.isArray(assignment.pool)) {
            assignment.pool = [];
        }

        // Set section title to show current sprint
        const sectionTitle = document.querySelector('#team .section-header h2');
        if (sectionTitle) {
            const sprintLabel = allAssignments[currentSprintKey]?.label || currentSprintKey;
            sectionTitle.textContent = `Equipo · Roles Scrum · ${sprintLabel}`;
        }

        renderRoles();
        setupDropZones();
        renderRolesDiagram();

        // Re-render diagram on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(renderRolesDiagram, 200);
        });
    }

    document.addEventListener('fc:init', init);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }

    // Listen for sprint changes (event-driven, decoupled from kanban)
    document.addEventListener('sprint:changed', (e) => {
        if (e.detail && e.detail.sprintKey) {
            switchToSprint(e.detail.sprintKey);
        }
    });

    return {
        resetToDefaults,
        getAssignment: () => assignment,
        getAllAssignments: () => allAssignments,
        getCurrentSprint: () => currentSprintKey,
        renderRolesDiagram,
        switchToSprint
    };
})();

// Expose to window so other modules can use it
window.FreeCAD_Roles = FreeCAD_Roles;

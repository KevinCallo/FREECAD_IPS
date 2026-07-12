/**
 * FreeCAD IPS - Main Application
 * ============================================
 * Inicialización, helpers, navegación, utilidades
 */

const FreeCAD_IPS = (() => {
    'use strict';

    // ============================================
    // SPRINT CONFIG
    // ============================================
    const SPRINTS = {
        sprint0: {
            start: new Date(2026, 4, 1),
            end: new Date(2026, 4, 13),
            label: 'Sprint 0'
        },
        sprint1: {
            start: new Date(2026, 4, 14),
            end: new Date(2026, 4, 28),
            label: 'Sprint 1'
        },
        sprint2: {
            start: new Date(2026, 4, 29),
            end: new Date(2026, 5, 10),
            label: 'Sprint 2'
        },
        sprint3: {
            start: new Date(2026, 5, 11),
            end: new Date(2026, 5, 25),
            label: 'Sprint 3'
        },
        sprint4: {
            start: new Date(2026, 5, 26),
            end: new Date(2026, 6, 13),
            label: 'Sprint 4'
        }
    };

    // ============================================
    // TEAM MEMBERS
    // ============================================
    const TEAM_MEMBERS = [
        { id: 'kevin',   name: 'Kevin Callo',    initials: 'KC', color: '#004a99' },
        { id: 'mathias', name: 'Mathias Davila', initials: 'MD', color: '#27ae60' },
        { id: 'paulo',   name: 'Paulo Quenta',   initials: 'PQ', color: '#e67e22' },
        { id: 'darich',  name: 'Dario Cornejo',  initials: 'DC', color: '#8e44ad' },
        { id: 'andhy',   name: 'Andhy Chipana',  initials: 'AC', color: '#e74c3c' }
    ];

    // ============================================
    // TOAST NOTIFICATION SYSTEM
    // ============================================
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
    }

    // ============================================
    // SPRINT PROGRESS CALC
    // ============================================
    function calcSprintProgress(sprintKey) {
        const sprint = SPRINTS[sprintKey];
        if (!sprint) return 0;

        const today = new Date();
        const totalDays = Math.round((sprint.end - sprint.start) / (1000 * 60 * 60 * 24));

        if (today < sprint.start) return 0;
        if (today > sprint.end) return 100;

        const elapsedDays = Math.round((today - sprint.start) / (1000 * 60 * 60 * 24));
        return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
    }

    function updateSprintProgress() {
        const progress = calcSprintProgress('sprint2');
        const bar = document.getElementById('sprint2-bar');
        const label = document.getElementById('sprint2-progress');

        if (bar) bar.style.width = progress + '%';
        if (label) label.textContent = progress + '%';
    }

    // ============================================
    // NAV ACTIVE SECTION HIGHLIGHT
    // ============================================
    function initNavScrollSpy() {
        const sections = document.querySelectorAll('.section[id]');
        const navLinks = document.querySelectorAll('.top-nav-links a');

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('back-to-top--visible', window.scrollY > 400);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // CURRENT SPRINT STATUS
    // ============================================
    function getCurrentSprint() {
        const today = new Date();
        for (const [key, sprint] of Object.entries(SPRINTS)) {
            if (today >= sprint.start && today <= sprint.end) {
                return { key, ...sprint };
            }
        }
        return null;
    }

    function initNavSprintDropdown() {
        const btn = document.querySelector('.nav-sprint-btn');
        const dropdown = document.querySelector('.nav-sprint-dropdown');
        if (!btn || !dropdown) return;

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            dropdown.classList.toggle('nav-sprint-dropdown--open');
        });

        // Click options → switch sprint
        dropdown.addEventListener('click', (e) => {
            const opt = e.target.closest('.nav-sprint-option');
            if (!opt) return;
            const sprintKey = opt.dataset.sprint;
            dropdown.classList.remove('nav-sprint-dropdown--open');
            btn.setAttribute('aria-expanded', 'false');
            if (window.FreeCAD_Kanban && typeof FreeCAD_Kanban.setActiveSprint === 'function') {
                FreeCAD_Kanban.setActiveSprint(sprintKey);
            }
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdown.classList.remove('nav-sprint-dropdown--open');
            btn.setAttribute('aria-expanded', 'false');
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('nav-sprint-dropdown--open')) {
                dropdown.classList.remove('nav-sprint-dropdown--open');
                btn.setAttribute('aria-expanded', 'false');
                btn.focus();
            }
        });

        // Sync initial active state from localStorage
        const saved = localStorage.getItem('fc_kanban_active') || 'sprint2';
        updateNavSprintText(saved);
    }

    function updateNavSprintText(sprintKey) {
        const textEl = document.querySelector('.nav-sprint-text');
        const pulseDot = document.querySelector('.top-nav-sprint .pulse-dot');
        if (!textEl) return;
        const sprints = { sprint0: 'Sprint 0', sprint1: 'Sprint 1', sprint2: 'Sprint 2' };
        const isCurrent = sprintKey === 'sprint2';
        textEl.textContent = isCurrent
            ? `${sprints[sprintKey] || sprintKey} · En curso`
            : `${sprints[sprintKey] || sprintKey} · Historial`;
        if (pulseDot) pulseDot.style.display = isCurrent ? '' : 'none';

        // Update active option in dropdown
        document.querySelectorAll('.nav-sprint-option').forEach(opt => {
            const isActive = opt.dataset.sprint === sprintKey;
            opt.classList.toggle('nav-sprint-option--active', isActive);
        });
    }

   // ============================================
    // PIPELINE DEVOPS CONSOLA INTERACTIVA REAL
    // ============================================
    function initDevOpsConsole() {
        const toggleConsoleBtn = document.getElementById('toggle-console-btn');
        const consoleSection = document.getElementById('dynamic-console-section');
        const consoleLog = document.getElementById('console-live-log');
        const pipelineBadge = document.getElementById('pipeline-badge');

        if (!toggleConsoleBtn || !consoleSection || !consoleLog || !pipelineBadge) return;

        let owner = 'KevinCallo'; 
        let repo = 'FREECAD_IPS';

        const hostname = window.location.hostname;
        const pathname = window.location.pathname;

        if (hostname.includes('.github.io')) {
            owner = hostname.split('.')[0]; 
            repo = pathname.split('/').filter(part => part.length > 0)[0] || repo;
        }

        const DYNAMIC_URL = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`;

        async function fetchGitHubWorkflowStatus() {
            try {
                consoleLog.innerHTML = `<span style="color: #64748b;">[API] Conectando a infraestructura Actions remota...</span>`;
                
                const responseRuns = await fetch(DYNAMIC_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });
                
                if (!responseRuns.ok) throw new Error(`HTTP Runs Error: ${responseRuns.status}`);
                const dataRuns = await responseRuns.json();
                if (!dataRuns.workflow_runs || dataRuns.workflow_runs.length === 0) return;

                const run = dataRuns.workflow_runs[0];
                const commitSHA = run.head_sha.substring(0, 7);
                const commitMsg = run.display_title || 'Push';
                const updatedAt = new Date(run.updated_at).toLocaleString();
                const targetActionsUrl = `https://github.com/${owner}/${repo}/actions/runs/${run.id}`;

                // Render de Badge Superior Síncrono
                if (run.status === 'completed' && run.conclusion === 'success') {
                    pipelineBadge.style.background = '#15803d'; pipelineBadge.style.color = '#bbf7d0';
                    pipelineBadge.innerHTML = `<i class="fa-solid fa-check"></i> SUCCESS`;
                } else if (run.status === 'in_progress' || run.status === 'queued') {
                    pipelineBadge.style.background = '#b45309'; pipelineBadge.style.color = '#fef3c7';
                    pipelineBadge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> RUNNING`;
                } else {
                    pipelineBadge.style.background = '#b91c1c'; pipelineBadge.style.color = '#fee2e2';
                    pipelineBadge.innerHTML = `<i class="fa-solid fa-xmark"></i> FAILED`;
                }

                // 2. SEGUNDO FETCH: Descargar la arquitectura de Jobs del Payload original
                const responseJobs = await fetch(run.jobs_url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });
                
                let dynamicStepsHTML = '';

                if (responseJobs.ok) {
                    const dataJobs = await responseJobs.json();
                    if (dataJobs.jobs && dataJobs.jobs.length > 0) {
                        const currentJob = dataJobs.jobs[0];
                        
                        // MAPEADO Y RENDERIZADO REACTIVO DESDE EL ARRAY DE GITHUB
                        currentJob.steps.forEach(step => {
                            let statusColor = '#cbd5e1';
                            let indicatorIcon = '▪';
                            
                            // Evaluación en tiempo real del estado de cada paso del Workflow
                            if (step.status === 'completed' && step.conclusion === 'success') {
                                statusColor = '#34d399'; // Verde
                                indicatorIcon = '✔';
                            } else if (step.status === 'completed' && step.conclusion === 'failure') {
                                statusColor = '#f87171'; // Rojo
                                indicatorIcon = '❌';
                            } else if (step.status === 'in_progress') {
                                statusColor = '#38bdf8'; // Azul
                                indicatorIcon = '<i class="fa-solid fa-spinner fa-spin"></i>';
                            }

                            // Cálculo del tiempo de ejecución dinámico por cada paso individual
                            let stepDuration = '';
                            if (step.started_at && step.completed_at) {
                                const start = new Date(step.started_at);
                                const end = new Date(step.completed_at);
                                const diff = Math.round((end - start) / 1000);
                                stepDuration = ` <span style="color: #64748b; font-size: 0.85rem;">(${diff}s)</span>`;
                            }

                            dynamicStepsHTML += `
                                <div style="margin-bottom: 4px; padding-left: 10px;">
                                    <span style="color: ${statusColor}; font-weight: 600;">${indicatorIcon}</span> 
                                    <span style="color: #e2e8f0;">[STEP]</span> 
                                    <span style="color: ${statusColor};">${step.name}</span>
                                    <span style="color: #64748b;">-> status: <b>${step.status}</b>${step.conclusion ? ' ('+step.conclusion+')' : ''}</span>${stepDuration}
                                </div>
                            `;
                        });
                    }
                }

                if (!dynamicStepsHTML) {
                    dynamicStepsHTML = `<span style="color: #f87171;">[WARN] No se pudieron mapear sub-pasos del contenedor en tiempo real.</span>`;
                }

                // 3. IMPRESIÓN SIN TEXTOS QUEMADOS EN EL DOM
                consoleLog.innerHTML = `
                    <span style="color: #34d399;">[SUCCESS] Pipeline conectado dinámicamente en dos niveles con GitHub API v3.</span><br>
                    <span style="color: #38bdf8;">[API ENDPOINT] ${run.jobs_url}</span><br>
                    <span style="color: #cbd5e1;">[SERVER] Workflow: '${run.name}' | N° Corrida: #${run.run_number}</span><br>
                    <span style="color: #cbd5e1;">[TARGET] Rama: '${run.head_branch}' | Trigger: ${run.event.toUpperCase()}</span><br>
                    <span style="color: #38bdf8;">[COMMIT] SHA: <b>${commitSHA}</b> ("${commitMsg}")</span><br>
                    <span style="color: #64748b;">[DATE] Sincronización Remota: ${updatedAt}</span><br>
                    <br>
                    <span style="color: #38bdf8; font-weight: 600;">$ github-actions --stream-live-container-status</span><br>
                    <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 4px; border-left: 3px solid #38bdf8; font-family: monospace; line-height: 1.5;">
                        ${dynamicStepsHTML}
                    </div>
                    <br>
                    <span style="color: #cbd5e1;">[DEPLOY] Estado del ciclo global DevOps: <b style="color: #34d399;">${run.status.toUpperCase()} (${run.conclusion ? run.conclusion.toUpperCase() : 'PROCESANDO'})</b></span><br><br>
                    <span style="color: #38bdf8; font-size: 0.75rem;"><a href="${targetActionsUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ver la salida raw e hilos de pytest directo en la terminal de GitHub</a></span>
                `;

            } catch (error) {
                consoleLog.innerHTML = `<span style="color: #f87171;">[ERROR] Caída de conexión asíncrona: ${error.message}</span>`;
            }
        }

        toggleConsoleBtn.addEventListener('click', () => {
            if (consoleSection.style.display === 'none') {
                consoleSection.style.display = 'block';
                toggleConsoleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ocultar Log del Servidor';
                toggleConsoleBtn.style.background = '#475569';
                fetchGitHubWorkflowStatus();
            } else {
                consoleSection.style.display = 'none';
                toggleConsoleBtn.innerHTML = '<i class="fa-solid fa-terminal"></i> Inspeccionar Log del Servidor (CI/CD)';
                toggleConsoleBtn.style.background = 'var(--fc-blue-600)';
            }
        });
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        updateSprintProgress();
        initNavSprintDropdown();
        initNavScrollSpy();
        initBackToTop();
        initDevOpsConsole(); // <- Acoplado al flujo nativo de inicialización

        // fire custom event so modules know DOM is ready
        document.dispatchEvent(new Event('fc:init'));
    }

    // Always wait for DOMContentLoaded to ensure all modules are loaded
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        SPRINTS,
        TEAM_MEMBERS,
        showToast,
        calcSprintProgress,
        getCurrentSprint,
        updateNavSprintText
    };
})();

// Expose to window so other modules can use it
window.FreeCAD_IPS = FreeCAD_IPS;

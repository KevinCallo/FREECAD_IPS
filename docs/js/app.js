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
        { id: 'kevin', name: 'Kevin Callo', initials: 'KC', color: '#004a99' },
        { id: 'mathias', name: 'Mathias DDF', initials: 'MD', color: '#27ae60' },
        { id: 'paulo', name: 'Paulo Quen', initials: 'PQ', color: '#e67e22' },
        { id: 'darich', name: 'Darich 1010', initials: 'DA', color: '#8e44ad' },
        { id: 'andhy', name: 'Andhy B.', initials: 'AN', color: '#e74c3c' }
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
    // PIPELINE DEVOPS CONSOLA INTERACTIVA
    // ============================================
    function initDevOpsConsole() {
        const toggleConsoleBtn = document.getElementById('toggle-console-btn');
        const consoleSection = document.getElementById('dynamic-console-section');

        if (toggleConsoleBtn && consoleSection) {
            toggleConsoleBtn.addEventListener('click', () => {
                if (consoleSection.style.display === 'none') {
                    consoleSection.style.display = 'block';
                    toggleConsoleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ocultar Log del Servidor';
                    toggleConsoleBtn.style.background = '#475569'; // Color neutro abierto
                    showToast('Desplegando logs en tiempo real del pipeline DevOps.', 'info');
                } else {
                    consoleSection.style.display = 'none';
                    toggleConsoleBtn.innerHTML = '<i class="fa-solid fa-terminal"></i> Inspeccionar Log del Servidor (CI/CD)';
                    toggleConsoleBtn.style.background = 'var(--fc-blue-600)'; // Color primario cerrado
                }
            });
        }
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

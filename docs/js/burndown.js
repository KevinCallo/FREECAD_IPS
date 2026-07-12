/**
 * FreeCAD IPS - Burndown Charts (Multi-Sprint)
 * ============================================
 * SVG dinámico para Sprint 0, 1, 2 con tabs
 */

const FreeCAD_Burndown = (() => {
    'use strict';

    // ============================================
    // SPRINT DATA
    // ============================================
    const SPRINT_DATA = {
        sprint0: {
            label: 'Sprint 0',
            totalPoints: 12,
            idealPerDay: 12 / 10,
            actual: [
                { day: 1, remaining: 12 },
                { day: 2, remaining: 11 },
                { day: 3, remaining: 10 },
                { day: 4, remaining: 8 },
                { day: 5, remaining: 6 },
                { day: 6, remaining: 4 },
                { day: 7, remaining: 3 },
                { day: 8, remaining: 2 },
                { day: 9, remaining: 1 },
                { day: 10, remaining: 0 }
            ],
            status: 'Completado',
            color: '#3a8fd4',
            achievement: 'Sprint 0 completado con 12/12 story points (100%). Repositorio configurado, análisis de arquitectura FreeCAD finalizado y GitHub Projects operativo.',
            description: '<strong>Sprint de Planificación Inicial</strong><br>Este sprint se dedicó a la <strong>planificación y configuración</strong> del proyecto. Se analizó la arquitectura de FreeCAD (OpenCASCADE, Coin3D, Qt, Python), se configuró el repositorio GitHub con ramas, se creó el tablero GitHub Projects con columnas Kanban, y se definieron las historias de usuario y épicas del proyecto. Fue la base sobre la que se construyó todo el proceso ágil.'
        },
        sprint1: {
            label: 'Sprint 1',
            totalPoints: 20,
            idealPerDay: 20 / 10,
            actual: [
                { day: 1, remaining: 20 },
                { day: 2, remaining: 18 },
                { day: 3, remaining: 16 },
                { day: 4, remaining: 14 },
                { day: 5, remaining: 12 },
                { day: 6, remaining: 10 },
                { day: 7, remaining: 9 },
                { day: 8, remaining: 7 },
                { day: 9, remaining: 5 },
                { day: 10, remaining: 3 }
            ],
            status: 'Completado',
            color: '#27ae60',
            achievement: 'Sprint 1 completado con 17/20 story points quemados (85%). Pipeline CI/CD funcional con GitHub Actions, dashboard v1 del proyecto desplegado en GitHub Pages.',
            description: '<strong>Sprint de CI/CD y Prototipado</strong><br>El objetivo fue establecer el <strong>pipeline DevOps</strong> del proyecto. Se configuró GitHub Actions con integración continua y despliegue automático a GitHub Pages, se diseñó y desplegó la primera versión del dashboard del proyecto, y se implementaron tests automatizados. También se comenzó con los primeros prototipos funcionales de módulos paramétricos en FreeCAD.'
        },
        sprint2: {
            label: 'Sprint 2',
            totalPoints: 25,
            idealPerDay: 25 / 10,
            actual: [
                { day: 1, remaining: 25 },
                { day: 2, remaining: 23 },
                { day: 3, remaining: 20 },
                { day: 4, remaining: 18 },
                { day: 5, remaining: 15 },
                { day: 6, remaining: 12 },
                { day: 7, remaining: 10 }
            ],
            status: 'En Curso',
            color: '#f39c12',
            achievement: 'Sprint 2 en curso — Implementación del módulo BIM y herramientas paramétricas. 15/25 story points completados al día 7.',
            description: '<strong>Sprint de BIM y Herramientas Paramétricas</strong><br>Estamos implementando las <strong>funcionalidades del módulo BIM</strong> de FreeCAD y desarrollando herramientas paramétricas con restricciones en Part. Se están realizando pruebas de integración entre los módulos BIM y las herramientas existentes. Es el sprint más intenso del proyecto en términos de desarrollo técnico.'
        }
    };

    let activeTab = 'sprint2';

    // ============================================
    // DRAW CHART
    // ============================================
    function drawChart(sprintKey) {
        const container = document.querySelector('.burndown-chart-container');
        if (!container) return;

        const data = SPRINT_DATA[sprintKey];
        if (!data) return;

        const width = Math.max(container.clientWidth || 500, 400);
        const height = 270;
        const pad = { top: 30, right: 30, bottom: 42, left: 50 };
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;

        const numDays = data.actual.length;
        const maxPoints = data.totalPoints;
        const idealPerDay = data.idealPerDay;

        // Ideal line
        const idealLine = [];
        for (let i = 0; i < numDays; i++) {
            idealLine.push({ day: i + 1, remaining: Math.round((maxPoints - i * idealPerDay) * 10) / 10 });
        }

        const scaleX = (day) => pad.left + ((day - 1) / Math.max(numDays - 1, 1)) * chartW;
        const scaleY = (val) => pad.top + chartH - (val / maxPoints) * chartH;

        let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-height:${height}px;">`;
        svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="white" rx="8"/>`;

        // Horizontal grid
        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
            const y = pad.top + (chartH / gridLines) * i;
            const val = Math.round(maxPoints - (maxPoints / gridLines) * i);
            svg += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#ecf0f1" stroke-width="1"/>`;
            svg += `<text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" font-family="Inter,sans-serif" font-size="10" fill="#95a5a6">${val}</text>`;
        }

        // Vertical grid
        const xStep = Math.max(1, Math.floor(numDays / 6));
        for (let i = 0; i < numDays; i += xStep) {
            const x = scaleX(i + 1);
            svg += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${height - pad.bottom}" stroke="#ecf0f1" stroke-width="1" stroke-dasharray="3 3"/>`;
            svg += `<text x="${x}" y="${height - pad.bottom + 18}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6">D${i + 1}</text>`;
        }

        // Axis titles
        svg += `<text x="14" y="${pad.top + chartH / 2}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6" transform="rotate(-90, 14, ${pad.top + chartH / 2})">Story Points</text>`;
        svg += `<text x="${pad.left + chartW / 2}" y="${height - 6}" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6">Días del Sprint</text>`;

        // Ideal line
        if (idealLine.length >= 2) {
            const pts = idealLine.map(p => `${scaleX(p.day)},${scaleY(p.remaining)}`).join(' ');
            svg += `<polyline points="${pts}" fill="none" stroke="#95a5a6" stroke-width="2" stroke-dasharray="6 4" opacity="0.6"/>`;
            const last = idealLine[idealLine.length - 1];
            svg += `<text x="${scaleX(last.day) + 6}" y="${scaleY(last.remaining) + 4}" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6">Ideal</text>`;
        }

        // Actual line
        if (data.actual.length >= 2) {
            const pts = data.actual.map(p => `${scaleX(p.day)},${scaleY(p.remaining)}`).join(' ');
            svg += `<polyline points="${pts}" fill="none" stroke="${data.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

            // Area
            const areaSegments = data.actual.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.day)},${scaleY(p.remaining)}`).join(' ');
            const lastIdx = data.actual.length - 1;
            svg += `<path d="${areaSegments} L${scaleX(data.actual[lastIdx].day)},${pad.top + chartH} L${scaleX(1)},${pad.top + chartH} Z" fill="${data.color}" opacity="0.06"/>`;

            // Dots
            data.actual.forEach((p, i) => {
                const cx = scaleX(p.day);
                const cy = scaleY(p.remaining);
                const isLast = i === lastIdx;
                svg += `<circle cx="${cx}" cy="${cy}" r="${isLast ? 5 : 3}" fill="${isLast ? data.color : 'white'}" stroke="${data.color}" stroke-width="2"/>`;
                if (isLast) {
                    svg += `<text x="${cx + 8}" y="${cy + 4}" font-family="Inter,sans-serif" font-size="10" font-weight="600" fill="${data.color}">${p.remaining} pts</text>`;
                }
            });
        }

        // Legend
        const legX = width - pad.right - 100;
        svg += `<line x1="${legX}" y1="18" x2="${legX + 20}" y2="18" stroke="#95a5a6" stroke-width="2" stroke-dasharray="4 2"/>`;
        svg += `<text x="${legX + 26}" y="22" font-family="Inter,sans-serif" font-size="9" fill="#95a5a6">Ideal</text>`;
        svg += `<line x1="${legX}" y1="36" x2="${legX + 20}" y2="36" stroke="${data.color}" stroke-width="2"/>`;
        svg += `<text x="${legX + 26}" y="40" font-family="Inter,sans-serif" font-size="9" fill="${data.color}">Real</text>`;

        svg += '</svg>';
        container.innerHTML = svg;

        // Update info stats
        const infoContainer = document.querySelector('.burndown-info');
        if (infoContainer) {
            const last = data.actual.length > 0 ? data.actual[data.actual.length - 1] : { remaining: 0 };
            const completed = data.totalPoints - last.remaining;
            const pct = data.totalPoints > 0 ? Math.round((completed / data.totalPoints) * 100) : 0;
            infoContainer.innerHTML = `
                <div style="display:flex; gap:24px; flex-wrap:wrap; justify-content:center; margin-top:16px;">
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:800; color:var(--text-primary);">${last.remaining}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Puntos Restantes</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:800; color:var(--fc-green);">${completed}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Completados</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:800; color:var(--fc-blue-600);">${pct}%</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Progreso</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:800; color:${data.color};">${data.status}</div>
                        <div style="font-size:0.72rem; color:var(--text-muted);">Estado</div>
                    </div>
                </div>
            `;
        }

        // Update achievement text
        const achievementEl = document.getElementById('burndown-achievement');
        if (achievementEl) {
            achievementEl.textContent = data.achievement || '';
        }

        // Update sprint-specific description
        const descText = document.querySelector('.burndown-desc-text');
        if (descText) {
            descText.innerHTML = data.description || '<strong>¿Qué es el Burndown Chart?</strong><br>Muestra el trabajo pendiente (<em>story points</em>) a lo largo del sprint.';
        }
    }

    // ============================================
    // SETUP TABS
    // ============================================
    function setupTabs() {
        document.querySelectorAll('.burndown-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const sprintKey = tab.dataset.sprint;
                if (!sprintKey) return;
                document.querySelectorAll('.burndown-tab').forEach(t => {
                    t.classList.toggle('burndown-tab--active', t.dataset.sprint === sprintKey);
                });
                activeTab = sprintKey;
                drawChart(sprintKey);
            });
        });
    }

    // ============================================
    // INIT
    // ============================================
    let _initialized = false;
    function init() {
        if (_initialized) return;
        _initialized = true;
        setupTabs();

        // Sync with kanban's saved active sprint
        let startSprint = 'sprint2';
        try {
            const savedActive = localStorage.getItem('fc_kanban_active');
            if (savedActive && SPRINT_DATA[savedActive]) {
                startSprint = savedActive;
            }
        } catch (e) { /* ignore */ }
        activeTab = startSprint;
        // Sync burndown tab classes with saved sprint
        document.querySelectorAll('.burndown-tab').forEach(tab => {
            tab.classList.toggle('burndown-tab--active', tab.dataset.sprint === startSprint);
        });
        drawChart(startSprint);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => drawChart(activeTab), 300);
        });
    }

    document.addEventListener('fc:init', init);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }

    // Listen for sprint changes (event-driven)
    document.addEventListener('sprint:changed', (e) => {
        if (e.detail && e.detail.sprintKey) {
            activeTab = e.detail.sprintKey;
            drawChart(e.detail.sprintKey);
        }
    });

    return { drawChart, setActiveTab: (key) => { activeTab = key; drawChart(key); } };
})();

// Expose to window so other modules can use it
window.FreeCAD_Burndown = FreeCAD_Burndown;

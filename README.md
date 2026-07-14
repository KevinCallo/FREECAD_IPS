# Aplicación de Metodologías Ágiles (Scrum) y DevOps en el Desarrollo de Módulos BIM para FreeCAD

Este repositorio alberga el código fuente del proyecto de desarrollo y modernización de **FreeCAD**, integrado bajo un ciclo de vida ágil y automatizado. El proyecto documenta la implementación conjunta de **Scrum** y **DevOps** para el diseño de interfaces modernas y la validación de flujos paramétricos de mallas 3D para impresión tridimensional.

* **Institución:** Universidad Nacional de San Agustín de Arequipa (UNSA)
* **Facultad:** Facultad de Ingeniería de Producción y Servicios
* **Escuela:** Escuela Profesional de Ingeniería de Sistemas (EPIS)
* **Curso:** Ingeniería y Procesos de Software / DevOps (Grupo B)
* **Docente:** Ing. Diego Alonso Iquira Becerra

---

## 📄 Resumen del Proyecto
El proyecto aborda la aplicación de Scrum combinado con prácticas DevOps sobre FreeCAD, un modelador 3D paramétrico de código abierto. El trabajo se estructuró en cuatro Sprints de 15 días cubriendo análisis de arquitectura, implementación de un pipeline CI/CD, desarrollo de módulos C++/Python de FreeCAD, y refactorización. Para la visibilidad del proyecto se desarrolló un Dashboard web en **Angular 20** (Standalone components, Signals) que despliega tableros Kanban interactivos y gráficos burndown. Los resultados exponen un pipeline completamente automatizado mediante GitHub Actions con despliegue en GitHub Pages, acumulando un total de **72 Story Points** planificados.

---

## 👥 Equipo de Trabajo e Integrantes
El equipo está compuesto por cinco estudiantes de la EPIS de la UNSA, rotando roles Scrum a lo largo de los hitos del proyecto:

| Integrante | Rol Sprint 0 | Rol Sprint 1 | Rol Sprint 2 | Rol Sprint 3 |
| :--- | :--- | :--- | :--- | :--- |
| **Kevin Joel Callo Ccagiavilca** | Scrum Master | Product Owner | Scrum Master | Scrum Master |
| **Mathias Davila Flores** | Developer | Developer | Developer | Developer |
| **Paulo Quenta Ahumada** | Developer | Developer | Developer | Developer |
| **Dario Rafael Cornejo Hurtado** | Developer | Scrum Master | Developer | Developer |
| **Andhy Brayan Chipana Mamani** | Product Owner | Developer | Product Owner | Product Owner |

---

## 📐 Arquitectura General del Sistema

La solución integral se compone de cuatro capas interconectadas:

```
[ Capa 1: Despliegue en la Nube (CD) ]
         │
         ▼
[ Capa 2: Frontend Angular 20 (Standalone & Signals) ]
         │
         ▼
[ Capa 3: Núcleo Py/C++ (Módulos de FreeCAD) ]  <─── (Ribbon Simulator / Mesh Design)
         │
         ▼
[ Capa 4: GitHub Actions (CI) ]  <─── (Checkout ──> Setup Python ──> Pytest)
```

---

## 🛠️ Tecnologías y Herramientas (Stack)
* **Modelador CAD Base:** FreeCAD 1.1 (C++17, Qt5/Qt6, OpenCASCADE, Coin3D).
* **Plataforma de Visibilidad:** Angular 20.3 (TypeScript 5.9, Karma/Jasmine).
* **Entorno de Programación:** Python 3.10 (Pytest para pruebas de lógica BIM).
* **Automatización DevOps:** GitHub Actions (Integración Continua) y GitHub Pages (Despliegue Continuo).
* **Gestión Ágil:** GitHub Projects (Tableros Kanban dinámicos).

---

## ⚙️ Modificaciones de Software en FreeCAD

### 1. Simulador de Interfaz Ribbon (C++)
Se inyecta dinámicamente un contenedor `QTabWidget` (`RibbonTabWidget`) sobre el área MDI en `MainWindow.cpp`. Durante el arranque, `ToolBarManager.cpp` filtra las barras estándar y carga las específicas del Workbench activo como pestañas de Ribbon, estilizadas a una altura de `95px` en `FreeCAD.qss`.

### 2. Formateador de Tooltips HTML (C++)
Transforma descripciones de comandos en tarjetas informativas con soporte de imágenes y formato enriquecido en `ToolBarManager.cpp`.

### 3. Integración de Mallas y Enfoque de Cámara (C++/Python)
Añade un botón de inicio en la pantalla de bienvenida que ejecuta comandos de Python para crear un sólido base (`Mesh.createSphere`) y programa un temporizador Qt para invocar `Std_ViewFitAll`, centrando la cámara del visor 3D instantáneamente.

---

## 🔄 Pipeline CI/CD Automatizado
El workflow ejecuta pruebas automáticas y compila la plataforma web ante cada confirmación:
1. **Checkout:** Descarga del código fuente.
2. **Setup Environment:** Instalación de Python y dependencias de prueba.
3. **Execution:** Ejecución de pruebas unitarias (`pytest tests/ -v`).
4. **Deploy:** Construcción y despliegue del dashboard en GitHub Pages.

---

## 📊 Métricas de Sprints (72 Story Points Totales)
* **Sprint 0 (12 SP):** Planificación, configuración de ramas y diseño arquitectónico (100% completado).
* **Sprint 1 (20 SP):** Configuración de GitHub Actions, GitHub Pages y prototipo del Dashboard (100% completado).
* **Sprint 2 (25 SP):** Desacoplamiento de clases puras de Python y suite de pruebas unitarias (100% completado).
* **Sprint 3 (15 SP):** Interfaz Ribbon e integración de flujos de mallas 3D en C++ (100% completado).

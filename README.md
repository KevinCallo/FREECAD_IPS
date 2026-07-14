# FreeCAD - Modernización de Interfaz e Integración de Mallas (Proyecto IPS)

Este repositorio contiene la versión modificada de **FreeCAD 1.1** desarrollada por el Equipo B para el curso de **Ingeniería y Procesos de Software / DevOps** de la Escuela Profesional de Ingeniería de Sistemas (EPIS) de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**.

El objetivo del proyecto es implementar mejoras visuales significativas (interfaz tipo Ribbon), asistencia al usuario mediante tooltips avanzados y un flujo integrado de impresión 3D mediante el modelado de mallas rápidas.

---

## 🚀 Características Implementadas

### 1. Simulador de Interfaz Ribbon (RF-01, RF-02)
* Agrupamiento de las herramientas del banco de trabajo activo en pestañas dinámicas mediante un componente contenedor `QTabWidget` (`RibbonTabWidget`).
* Altura de interfaz Ribbon fijada en `95px` mediante estilos QSS personalizados para una visualización fluida sin colapsar el visor 3D.
* Exclusión selectiva de las barras generales (File, Edit, View, etc.) para mantenerlas ancladas en la barra superior clásica, garantizando accesibilidad global y previniendo pestañas vacías.

### 2. Tooltips Interactivos en HTML (RF-03, RF-04)
* Generador dinámico de descripciones enriquecidas en C++ (`ToolBarManager.cpp`).
* Al pasar el ratón por encima de los iconos o las pestañas de herramientas, se muestra una tarjeta con formato HTML que despliega el icono de la herramienta, su nombre destacado en negrita y su descripción detallada de uso.

### 3. Acceso de Inicio a Mallas 3D y Auto-Enfoque (RF-05)
* Integración del botón **"Mesh Design"** en la sección de *Archivo nuevo* de la pantalla de bienvenida.
* Al ser pulsado, inicia un documento en blanco, activa el banco de trabajo `MeshWorkbench` y ejecuta de forma automatizada scripts de Python para insertar un sólido base (esfera teselada).
* Implementación de una llamada asíncrona mediante un temporizador Qt (`QTimer::singleShot`) para ajustar de forma automática la cámara del viewport 3D al objeto mediante el comando `Std_ViewFitAll`.

---

## 🛠️ Stack Tecnológico
* **Núcleo de Modelado/CAD:** C++17 (FreeCAD Core, Qt5/Qt6) y Python 3.10.
* **Gestión de Entornos y Compilación:** Pixi y CMake.
* **Dashboard del Proyecto:** Angular 20 (Standalone components & Signals) desplegado en GitHub Pages.
* **Integración Continua (CI/CD):** GitHub Actions (`freecad-bim-ci.yml`) y pruebas automatizadas con Pytest.

---

## 💻 Compilación e Instalación

Para compilar el código fuente con las modificaciones de la interfaz, asegúrate de tener instalado `pixi` y ejecuta el comando de compilación en la raíz del repositorio:

```powershell
pixi run build
```

Una vez finalizada la compilación, puedes ejecutar FreeCAD y seleccionar el tema **Proyecto IPS** desde las preferencias generales para habilitar el estilo moderno de la ventana MDI.

---

## 👥 Equipo de Trabajo (Grupo B)
* **Kevin Joel Callo Ccagiavilca** - *Scrum Master / Developer* (Correos: kcallo@unsa.edu.pe)
* **Paulo Quenta Ahumada** - *Developer* (Correos: pquentaa@unsa.edu.pe)
* **Dario Rafael Cornejo Hurtado** - *Developer* (Correos: dcornejohu@unsa.edu.pe)
* **Andhy Brayan Chipana Mamani** - *Product Owner* (Correos: achipana@unsa.edu.pe)
* **Mathias Davila Flores** - *Developer* (Correos: mdavilaf@unsa.edu.pe)

**Docente:** Ing. Diego Alonso Iquira Becerra

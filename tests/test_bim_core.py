# tests/test_bim_core.py
import sys
import os

# Parche de enrutamiento dinámico para que GitHub Actions reconozca la carpeta 'src'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from src.BimCoreModules import BIM_Help_Core, BIM_Welcome_Core, BIM_WPCommands_Core

# ===========================================================================
# VERIFICACIONES: 1. BimHelp
# ===========================================================================
def test_help_url_correcta():
    """Verifica que el resolvedor devuelva la URL oficial sin mutaciones."""
    help_sys = BIM_Help_Core()
    assert help_sys.obtener_url_documentacion() == "https://www.freecad.org/wiki/BIM_Workbench"

def test_help_recursos_metadata():
    """Valida la integridad de las etiquetas de interfaz exigidas por FreeCAD."""
    help_sys = BIM_Help_Core()
    recursos = help_sys.simular_comando_recursos()
    assert recursos["Pixmap"] == "BIM_Help"
    assert "Opens the BIM help page" in recursos["ToolTip"]


# ===========================================================================
# VERIFICACIONES: 2. BimWelcome
# ===========================================================================
def test_welcome_flujo_primera_vez():
    """Prueba que el sistema reconozca y configure el setup inicial del Workbench."""
    welcome_sys = BIM_Welcome_Core()
    assert welcome_sys.evaluar_estado_inicio(es_primera_vez=True) == "DISPARAR_SETUP"
    assert welcome_sys.primera_ejecucion is False

def test_welcome_enrutador_tutorial():
    """Verifica la detección exacta del comando de tutoría interna."""
    welcome_sys = BIM_Welcome_Core()
    resultado = welcome_sys.procesar_enlace_interactivo("BIM_Start_Tutorial")
    assert resultado == "EJECUTAR_COMANDO_TUTORIAL"

def test_welcome_enrutador_externo():
    """Asegura que los enlaces web externos no se confundan con macros internas."""
    welcome_sys = BIM_Welcome_Core()
    enlace_web = "https://forum.freecad.org/"
    resultado = welcome_sys.procesar_enlace_interactivo(enlace_web)
    assert "ABRIR_URL_EXTERNA" in resultado


# ===========================================================================
# VERIFICACIONES: 3. BimWPCommands
# ===========================================================================
def test_wp_cambio_orientacion_exitoso():
    """Valida las transiciones de estado hacia orientaciones estándar de planos."""
    wp_sys = BIM_WPCommands_Core()
    resultado = wp_sys.procesar_cambio_orientacion("Front")
    assert "OK_PLANO" in resultado
    assert wp_sys.ultimo_plano_establecido == "Front"

def test_wp_cambio_orientacion_invalido():
    """Comprueba el rechazo seguro ante parámetros de geometría corruptos o inexistentes."""
    wp_sys = BIM_WPCommands_Core()
    resultado = wp_sys.procesar_cambio_orientacion("Perspectiva_Invalida")
    assert "ERROR_PLANO" in resultado

def test_wp_auditoria_atajos_teclado():
    """Audita de forma estática que los atajos clave mapeados sigan las reglas del árbol real."""
    wp_sys = BIM_WPCommands_Core()
    # Atajo correcto extraído del archivo original de FreeCAD
    assert wp_sys.validar_atajo_teclado("BIM_SetWPFront", "W,P,1") is True
    # Atajo alterado o incorrecto
    assert wp_sys.validar_atajo_teclado("BIM_WPView", "Ctrl+Alt+X") is False
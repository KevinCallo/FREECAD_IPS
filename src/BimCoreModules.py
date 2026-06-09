# src/BimCoreModules.py

# ===========================================================================
# 1. ARCHIVO REAL 1: BimHelp.py (Lógica Core Desacoplada)
# ===========================================================================
class BIM_Help_Core:
    """
    Clase refactorizada de BimHelp.py. 
    Aísla la lógica de resolución de URLs de la interfaz gráfica de FreeCAD.
    """
    def __init__(self):
        # Mapeo de documentación oficial de FreeCAD BIM
        self.url_oficial = "https://www.freecad.org/wiki/BIM_Workbench"

    def obtener_url_documentacion(self):
        """Devuelve la URL interna verificada para la ayuda."""
        return self.url_oficial

    def simular_comando_recursos(self):
        """Devuelve los metadatos de configuración para validar que el comando existe."""
        return {
            "Pixmap": "BIM_Help",
            "MenuText": "BIM Help",
            "ToolTip": "Opens the BIM help page on the FreeCAD documentation website"
        }
    
# ===========================================================================
# 2. ARCHIVO REAL 2: BimWelcome.py (Lógica Core Desacoplada)
# ===========================================================================
class BIM_Welcome_Core:
    """
    Clase refactorizada de BimWelcome.py.
    Modula la lógica del asistente de bienvenida y el enrutamiento de enlaces
    sin depender de componentes visuales (dialogWelcome.ui) ni de PySide.
    """
    def __init__(self):
        self.primera_ejecucion = True

    def evaluar_estado_inicio(self, es_primera_vez):
        """
        Determina si se debe abrir la configuración inicial (BIM_Setup) 
        basado en el parámetro de FreeCAD.
        """
        if es_primera_vez:
            self.primera_ejecucion = False  # Cambia el estado internamente
            return "DISPARAR_SETUP"
        return "OMITIR_SETUP"

    def procesar_enlace_interactivo(self, enlace):
        """
        Analiza de forma analítica el link clickeado en la pantalla de bienvenida.
        Determina si es un comando interno de FreeCAD o una URL externa.
        """
        if not enlace:
            return "ENLACE_VACIO"
            
        if "BIM_Start_Tutorial" in enlace:
            return "EJECUTAR_COMANDO_TUTORIAL"
        else:
            return f"ABRIR_URL_EXTERNA: {enlace}"
        
# ===========================================================================
# 3. ARCHIVO REAL 3: BimWPCommands.py (Lógica Core Desacoplada)
# ===========================================================================
class BIM_WPCommands_Core:
    """
    Clase refactorizada de BimWPCommands.py.
    Valida y registra las peticiones de cambio en el plano de trabajo (Working Plane)
    y comprueba que las configuraciones de atajos de teclado sean íntegras.
    """
    def __init__(self):
        # Mapeo analítico de las orientaciones válidas del plano de trabajo
        self.orientaciones_validas = ["Front", "Side", "Top", "CustomView"]
        self.ultimo_plano_establecido = None

    def procesar_cambio_orientacion(self, vista_solicitada):
        """
        Simula y valida el cambio de plano geométrico sin necesidad de 
        invocar los comandos de consola en vivo de FreeCADGui.
        """
        if vista_solicitada not in self.orientaciones_validas:
            return "ERROR_PLANO: Orientación desconocida o fuera del alcance estándar."
        
        self.ultimo_plano_establecido = vista_solicitada
        return f"OK_PLANO: Plano de trabajo configurado con éxito en orientación '{vista_solicitada}'."

    def validar_atajo_teclado(self, comando_clase, atajo_esperado):
        """
        Audita de forma estática si los atajos de teclado (Accel) declarados
        en el árbol original de FreeCAD coinciden con los requerimientos técnicos.
        """
        # Verificación directa basada en los recursos del archivo original
        atajos_mapeados = {
            "BIM_SetWPFront": "W,P,1",
            "BIM_SetWPTop": "W,P,2",
            "BIM_SetWPSide": "W,P,3",
            "BIM_WPView": "9"
        }
        
        if comando_clase not in atajos_mapeados:
            return False
        return atajos_mapeados[comando_clase] == atajo_esperado
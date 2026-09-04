import os
import shutil

appdata = os.environ.get('APPDATA')
startup_folder = os.path.join(appdata, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')

source_vbs = os.path.join(os.path.dirname(__file__), 'launch_tray_icon.vbs')
target_vbs = os.path.join(startup_folder, 'DactylaTamanduaTray.vbs')

if os.path.exists(source_vbs):
    shutil.copy2(source_vbs, target_vbs)
    print(f"[OK] Atalho de auto-inicializacao instalado em: {target_vbs}")
else:
    print(f"[ERRO] Arquivo de origem nao encontrado: {source_vbs}")

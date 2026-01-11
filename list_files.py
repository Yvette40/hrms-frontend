import os

frontend_path = r"K:\YVETTE\BIT 4.2\2a project\hrms-frontend"

for root, dirs, files in os.walk(frontend_path):
    level = root.replace(frontend_path, '').count(os.sep)
    indent = ' ' * 4 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = ' ' * 4 * (level + 1)
    for f in files:
        print(f"{subindent}{f}")

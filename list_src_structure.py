import os

# Path to your frontend "src" folder
src_path = r"K:\YVETTE\BIT 4.2\2a project\hrms-frontend\src"

print(f"\n📁 Folder structure inside: {src_path}\n")

for root, dirs, files in os.walk(src_path):
    level = root.replace(src_path, '').count(os.sep)
    indent = ' ' * 4 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = ' ' * 4 * (level + 1)
    for f in files:
        print(f"{subindent}{f}")

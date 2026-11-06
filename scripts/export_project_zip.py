import os
import zipfile
from pathlib import Path

def create_project_zip():
    base_dir = Path("/app/applet")
    output_zip = base_dir / "public" / "project_source_code.zip"
    
    exclude_dirs = {
        "node_modules", ".git", "dist", ".cache", "__pycache__", ".vite"
    }
    exclude_files = {
        "bun.lock", ".DS_Store"
    }
    
    print(f"Creating zip at: {output_zip}")
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
            
            for file in files:
                if file in exclude_files or file.endswith(".zip"):
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(base_dir)
                zipf.write(file_path, arcname=str(rel_path))
                
    print(f"Zip created successfully! Size: {output_zip.stat().st_size} bytes")

if __name__ == "__main__":
    create_project_zip()

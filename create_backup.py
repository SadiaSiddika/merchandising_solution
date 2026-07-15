import os
import zipfile
import subprocess
from datetime import datetime

# Configurations
PROJECT_DIR = r"E:\merchandising_project"
BACKUP_NAME = f"merchandising_backup_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.zip"
BACKUP_PATH = os.path.join(PROJECT_DIR, BACKUP_NAME)
SQL_DUMP_PATH = os.path.join(PROJECT_DIR, "db_backup.sql")

def dump_postgres():
    print("Exporting PostgreSQL database 'metamorphosis'...")
    try:
        # Run pg_dump to export database
        # Password is set to 'admin' in db.js, we pass it via environment PGPASSWORD
        env = os.environ.copy()
        env["PGPASSWORD"] = "admin"
        
        command = [
            r"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
            "-h", "localhost",
            "-U", "postgres",
            "-d", "metamorphosis",
            "-f", SQL_DUMP_PATH
        ]
        
        subprocess.run(command, env=env, check=True)
        print(f"PostgreSQL database exported successfully to {SQL_DUMP_PATH}")
        return True
    except Exception as e:
        print(f"Warning: PostgreSQL export failed: {e}")
        print("Falling back: If you are using SQLite, the SQLite DB file (metamorphosis.db) will be included in the zip archive.")
        return False

def zip_project():
    print(f"Creating zip archive at {BACKUP_PATH}...")
    exclude_dirs = {"node_modules", "dist", ".git", ".next"}
    
    with zipfile.ZipFile(BACKUP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(PROJECT_DIR):
            # Exclude node_modules, dist, git folders
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Do not include the backup zip itself or python execution cache
                if file == BACKUP_NAME or file.endswith(".pyc"):
                    continue
                
                filepath = os.path.join(root, file)
                # Compute relative path for zip entry
                arcname = os.path.relpath(filepath, PROJECT_DIR)
                zipf.write(filepath, arcname)
                
    print(f"Successfully created zip archive: {BACKUP_NAME}")

def main():
    has_postgres = dump_postgres()
    zip_project()
    
    # Clean up SQL dump file to avoid polluting workspace
    if os.path.exists(SQL_DUMP_PATH):
        try:
            os.remove(SQL_DUMP_PATH)
        except Exception:
            pass
            
    print("\n" + "="*50)
    print("BACKUP PROCESS COMPLETED SUCCESSFULLY!")
    print(f"Backup file is saved at: {BACKUP_PATH}")
    print("="*50)
    print("Please upload this file manually to your Google Drive:")
    print("https://drive.google.com/drive/folders/15m1051zJvy062h2XfNqFHyHXluWeMRbJ?usp=sharing")
    print("="*50)

if __name__ == "__main__":
    main()

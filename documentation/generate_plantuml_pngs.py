import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# Path to the diagrams directory (relative to this script)
DIAGRAMS_DIR = os.path.join(os.path.dirname(__file__), 'new-docs', 'SDD')
# Path to plantuml.jar (relative to this script)
PLANTUML_JAR = os.path.join(os.path.dirname(__file__), 'plantuml.jar')

# Gather all .puml files
puml_files = []
for root, dirs, files in os.walk(DIAGRAMS_DIR):
    for file in files:
        if file.endswith('.puml'):
            puml_files.append(os.path.join(root, file))

def process_puml(puml_path):
    print(f"Processing: {puml_path}")
    try:
        subprocess.run([
            'java', '-jar', PLANTUML_JAR,
            '-tpng', puml_path
        ], check=True)
        return (puml_path, None)
    except subprocess.CalledProcessError as e:
        return (puml_path, str(e))

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(process_puml, puml): puml for puml in puml_files}
        for future in as_completed(futures):
            puml_path, error = future.result()
            if error:
                print(f"Error processing {puml_path}: {error}") 
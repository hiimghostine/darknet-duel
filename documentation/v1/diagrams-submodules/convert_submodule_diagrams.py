import os
import subprocess
import sys
from pathlib import Path

def find_puml_files(base_dir):
    """Find all PlantUML files in the given directory and its subdirectories."""
    puml_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.puml'):
                puml_files.append(os.path.join(root, file))
    return puml_files

def convert_to_png(puml_file, jar_path):
    """Convert a PlantUML file to PNG format."""
    try:
        cmd = ['java', '-jar', jar_path, puml_file]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Successfully converted: {puml_file}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error converting {puml_file}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    # Path to the PlantUML JAR file - corrected path
    plantuml_jar = Path('../dependencies/plantuml.jar').resolve()
    
    # Check alternative location if not found
    if not plantuml_jar.exists():
        alt_path = Path('dependencies/plantuml.jar').resolve()
        if alt_path.exists():
            plantuml_jar = alt_path
        else:
            print(f"PlantUML JAR file not found at {plantuml_jar} or {alt_path}")
            print("Please ensure the PlantUML JAR file is in the dependencies folder.")
            sys.exit(1)

    print(f"Using PlantUML JAR at: {plantuml_jar}")
    
    # Current directory (diagrams-submodules)
    base_dir = Path('.').resolve()
    
    print(f"Searching for PlantUML files in {base_dir}...")
    puml_files = find_puml_files(base_dir)
    
    if not puml_files:
        print("No PlantUML files found.")
        sys.exit(1)
    
    print(f"Found {len(puml_files)} PlantUML files.")
    
    # Convert files
    success_count = 0
    for puml_file in puml_files:
        if convert_to_png(puml_file, plantuml_jar):
            success_count += 1
    
    print(f"\nConversion complete: {success_count}/{len(puml_files)} files converted successfully.")

if __name__ == "__main__":
    main()

import os
import shutil
import re

def merge_image_directories():
    """
    Merges two image directories, handling filename conflicts by adding an incrementing suffix.
    """
    # Define absolute paths for source and destination directories
    base_dir = "/home/darealestninja/dev-projects/thrift/thrift-monorepo/packages/thrift-api"
    source_dir = os.path.join(base_dir, "generated_images_old")
    dest_dir = os.path.join(base_dir, "generated_images")

    # Create destination directory if it doesn't exist
    os.makedirs(dest_dir, exist_ok=True)

    # Check if source directory exists
    if not os.path.isdir(source_dir):
        print(f"Source directory not found: {source_dir}")
        return

    print(f"Merging '{source_dir}' into '{dest_dir}'...")

    for filename in os.listdir(source_dir):
        source_path = os.path.join(source_dir, filename)
        
        # Skip if it's a directory
        if os.path.isdir(source_path):
            continue

        base, ext = os.path.splitext(filename)
        dest_path = os.path.join(dest_dir, filename)

        if not os.path.exists(dest_path):
            # No conflict, just move the file
            shutil.move(source_path, dest_path)
            print(f"Moved: {filename}")
        else:
            # Conflict exists, find a new name
            
            # Find all files in the destination directory that start with the same base name
            conflicts = [f for f in os.listdir(dest_dir) if f.startswith(base) and f.endswith(ext)]
            
            max_num = 0
            
            # Find the highest suffix number among the conflicting files
            for f in conflicts:
                # Extract the numerical part of the filename
                suffix_str = f[len(base):-len(ext)]
                
                if suffix_str.isdigit():
                    max_num = max(max_num, int(suffix_str))
            
            # The new suffix is the highest found number + 1
            new_suffix = max_num + 1
            new_filename = f"{base}{new_suffix}{ext}"
            new_dest_path = os.path.join(dest_dir, new_filename)
            
            # Move the file with the new name
            shutil.move(source_path, new_dest_path)
            print(f"Moved and renamed: {filename} -> {new_filename}")

if __name__ == "__main__":
    merge_image_directories()

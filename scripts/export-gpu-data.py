#!/usr/bin/env python3
"""
Export GPU data from dbgpu to JSON format
"""
import json
import sys

try:
    from dbgpu import GPUDatabase
except ImportError:
    print("Error: dbgpu package not installed. Please run: pip install dbgpu", file=sys.stderr)
    sys.exit(1)

def export_gpu_data():
    """Export GPU data with VRAM information"""
    db = GPUDatabase.default()
    
    gpu_list = []
    
    # Get all GPU names
    gpu_names = db.names
    print(f"Processing {len(gpu_names)} GPUs...", file=sys.stderr)
    
    # Get all GPUs from the database
    for gpu_name in gpu_names:
        try:
            gpu_info = db[gpu_name]
            
            # Get VRAM capacity
            vram_gb = gpu_info.memory_size_gb
            
            # Only include GPUs with valid VRAM information
            if vram_gb and vram_gb > 0:
                gpu_data = {
                    'modelName': gpu_name,
                    'manufacturer': gpu_info.manufacturer or '',
                    'vramCapacityGB': float(vram_gb),
                    'architecture': gpu_info.architecture or '',
                    'releaseDate': str(gpu_info.release_date) if gpu_info.release_date else '',
                }
                
                # Extract year from release date
                if gpu_info.release_date:
                    try:
                        release_str = str(gpu_info.release_date)
                        if len(release_str) >= 4:
                            gpu_data['releaseYear'] = int(release_str[:4])
                    except (ValueError, TypeError):
                        pass
                
                gpu_list.append(gpu_data)
        except Exception as e:
            print(f"Warning: Failed to process {gpu_name}: {e}", file=sys.stderr)
            continue
    
    # Sort by manufacturer and model name
    gpu_list.sort(key=lambda x: (x['manufacturer'], x['modelName']))
    
    print(f"Exported {len(gpu_list)} GPUs with VRAM information", file=sys.stderr)
    
    # Output JSON
    print(json.dumps(gpu_list, indent=2))

if __name__ == '__main__':
    export_gpu_data()

#!/usr/bin/env python3
"""
Phân tích và phát hiện các file Python trùng lặp
Tạo báo cáo chi tiết về cấu trúc và mục đích của từng file
"""

import os
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

# Colors for output
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
CYAN = '\033[0;36m'
NC = '\033[0m'  # No Color

def get_file_hash(filepath: str) -> str:
    """Calculate MD5 hash of file content"""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def read_file_header(filepath: str, lines: int = 30) -> List[str]:
    """Read first N lines of file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return [line.strip() for line in f.readlines()[:lines]]
    except:
        return []

def extract_purpose(filepath: str) -> Dict[str, str]:
    """Extract purpose and metadata from Python file"""
    header = read_file_header(filepath, 50)
    purpose = {
        'description': '',
        'author': '',
        'version': '',
        'imports': [],
        'classes': [],
        'functions': [],
        'main_entry': False
    }
    
    in_docstring = False
    docstring_lines = []
    
    for i, line in enumerate(header):
        # Check for docstring
        if '"""' in line or "'''" in line:
            if not in_docstring:
                in_docstring = True
                continue
            else:
                in_docstring = False
                purpose['description'] = '\n'.join(docstring_lines)
                continue
        
        if in_docstring:
            docstring_lines.append(line)
            continue
        
        # Check for imports
        if line.startswith('import ') or line.startswith('from '):
            purpose['imports'].append(line)
        
        # Check for class definitions
        if line.startswith('class '):
            class_name = line.split('class ')[1].split('(')[0].split(':')[0].strip()
            purpose['classes'].append(class_name)
        
        # Check for function definitions
        if line.startswith('def ') and not line.startswith('def __'):
            func_name = line.split('def ')[1].split('(')[0].strip()
            purpose['functions'].append(func_name)
        
        # Check for main entry point
        if 'if __name__' in line or 'FastAPI' in line or 'uvicorn.run' in line:
            purpose['main_entry'] = True
        
        # Check for metadata
        if 'Author:' in line or 'author:' in line:
            purpose['author'] = line.split(':')[1].strip() if ':' in line else ''
        if 'Version:' in line or 'version:' in line:
            purpose['version'] = line.split(':')[1].strip() if ':' in line else ''
    
    return purpose

def categorize_file(filepath: str) -> str:
    """Categorize file by purpose"""
    filename = os.path.basename(filepath)
    dirname = os.path.dirname(filepath)
    
    # AI Service
    if 'ai-service' in filepath or 'ai_service' in filename:
        return 'AI Service'
    
    # Automation
    if 'automation' in filename.lower():
        if 'bridge' in filename.lower():
            return 'Automation Bridge'
        if 'enhanced' in filename.lower():
            return 'Automation Enhanced'
        if 'by_date' in filename.lower():
            return 'Automation By Date'
        return 'Automation Core'
    
    # Auth
    if 'auth' in filename.lower():
        if 'api' in filename.lower():
            return 'Auth API Server'
        return 'Auth Service'
    
    # Dashboard
    if 'dashboard' in filename.lower():
        return 'Dashboard'
    
    # Scripts
    if 'scripts' in dirname:
        if 'login' in filename.lower():
            return 'Login Script'
        if 'scraper' in filename.lower():
            return 'Scraper Script'
        if 'pagination' in filename.lower():
            return 'Pagination Script'
        if 'date' in filename.lower():
            return 'Date Customizer'
        if 'initialization' in filename.lower():
            return 'Initialization Script'
        if 'setup' in filename.lower():
            return 'Setup Script'
        return 'Utility Script'
    
    # Services
    if 'services' in dirname:
        if 'email' in filename.lower():
            return 'Email Service'
        if 'sheets' in filename.lower():
            return 'Google Sheets Service'
        if 'data' in filename.lower():
            return 'Data Processor Service'
        return 'Service'
    
    # Tests
    if 'test' in filename.lower() or 'tests' in dirname:
        return 'Test'
    
    # Config
    if 'config' in dirname or 'settings' in filename.lower():
        return 'Config'
    
    # Utils
    if 'utils' in dirname or 'utils' in filename.lower():
        return 'Utility'
    
    # Main entry points
    if filename == 'main.py' or filename == 'setup.py':
        return 'Main Entry'
    
    # Verification/Inspection
    if 'verify' in filename.lower() or 'inspect' in filename.lower():
        return 'Verification'
    
    # System check
    if 'system_check' in filename.lower() or 'analyze' in filename.lower():
        return 'System Check'
    
    return 'Other'

def main():
    """Main analysis function"""
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    print(f"{CYAN}{'='*80}{NC}")
    print(f"{CYAN}📊 PYTHON FILES ANALYSIS - React OAS Integration v4.0{NC}")
    print(f"{CYAN}{'='*80}{NC}\n")
    
    # Find all Python files
    python_files = []
    exclude_dirs = {'venv', 'ai-venv', 'node_modules', '.git', '__pycache__', 
                    'venv.backup', 'ai-venv.backup', '.pytest_cache'}
    
    for root, dirs, files in os.walk('.'):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not any(exc in d for exc in exclude_dirs)]
        
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                if not any(exc in filepath for exc in exclude_dirs):
                    python_files.append(filepath)
    
    print(f"{BLUE}Found {len(python_files)} Python files{NC}\n")
    
    # Group by hash (duplicates)
    hash_map = defaultdict(list)
    file_info = {}
    
    for filepath in python_files:
        try:
            file_hash = get_file_hash(filepath)
            hash_map[file_hash].append(filepath)
            file_info[filepath] = {
                'hash': file_hash,
                'size': os.path.getsize(filepath),
                'category': categorize_file(filepath),
                'purpose': extract_purpose(filepath)
            }
        except Exception as e:
            print(f"{RED}Error processing {filepath}: {e}{NC}")
    
    # Find duplicates
    duplicates = {h: files for h, files in hash_map.items() if len(files) > 1}
    
    print(f"{YELLOW}🔍 DUPLICATE FILES DETECTED:{NC}")
    print(f"{YELLOW}{'-'*80}{NC}\n")
    
    if duplicates:
        for i, (hash_val, files) in enumerate(duplicates.items(), 1):
            print(f"{RED}Duplicate Group {i}:{NC}")
            for filepath in files:
                info = file_info[filepath]
                print(f"  {YELLOW}📄{NC} {filepath}")
                print(f"     Size: {info['size']} bytes | Category: {info['category']}")
            print()
    else:
        print(f"{GREEN}✅ No exact duplicates found{NC}\n")
    
    # Group by category
    print(f"{CYAN}📁 FILES BY CATEGORY:{NC}")
    print(f"{CYAN}{'-'*80}{NC}\n")
    
    by_category = defaultdict(list)
    for filepath, info in file_info.items():
        by_category[info['category']].append((filepath, info))
    
    for category in sorted(by_category.keys()):
        files = by_category[category]
        print(f"{BLUE}📂 {category} ({len(files)} files):{NC}")
        for filepath, info in sorted(files):
            desc = info['purpose']['description'][:60] if info['purpose']['description'] else 'No description'
            print(f"  • {filepath}")
            if desc:
                print(f"    └─ {desc}...")
        print()
    
    # Similar files (same name, different locations)
    print(f"{YELLOW}🔗 SIMILAR FILES (same name, different locations):{NC}")
    print(f"{YELLOW}{'-'*80}{NC}\n")
    
    by_filename = defaultdict(list)
    for filepath in python_files:
        filename = os.path.basename(filepath)
        by_filename[filename].append(filepath)
    
    similar_files = {name: paths for name, paths in by_filename.items() if len(paths) > 1}
    
    for filename, paths in sorted(similar_files.items()):
        print(f"{YELLOW}📄 {filename}:{NC}")
        for path in sorted(paths):
            info = file_info[path]
            print(f"  • {path} ({info['category']})")
        print()
    
    # Summary
    print(f"{GREEN}{'='*80}{NC}")
    print(f"{GREEN}📊 SUMMARY:{NC}")
    print(f"{GREEN}{'-'*80}{NC}")
    print(f"Total files: {len(python_files)}")
    print(f"Duplicate groups: {len(duplicates)}")
    print(f"Similar files (same name): {len(similar_files)}")
    print(f"Categories: {len(by_category)}")
    print(f"{GREEN}{'='*80}{NC}\n")
    
    # Recommendations
    print(f"{CYAN}💡 RECOMMENDATIONS:{NC}")
    print(f"{CYAN}{'-'*80}{NC}\n")
    
    if duplicates:
        print(f"{YELLOW}1. Remove duplicate files:{NC}")
        for hash_val, files in list(duplicates.items())[:5]:
            print(f"   Keep: {files[0]}")
            print(f"   Remove: {', '.join(files[1:])}")
        print()
    
    if similar_files:
        print(f"{YELLOW}2. Consolidate similar files:{NC}")
        for filename, paths in list(similar_files.items())[:5]:
            print(f"   {filename} appears in {len(paths)} locations")
            print(f"   Consider consolidating into one location")
        print()
    
    print(f"{GREEN}✅ Analysis complete!{NC}\n")

if __name__ == '__main__':
    main()


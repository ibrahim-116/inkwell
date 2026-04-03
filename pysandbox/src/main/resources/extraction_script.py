import ast
import json
import sys

def extract_class_info(node, source_code, classes_data):
    methods = []
    for item in node.body:
        if isinstance(item, ast.FunctionDef):
            methods.append({
                'name': item.name,
                'code': ast.get_source_segment(source_code, item)
            })
        elif isinstance(item, ast.ClassDef):
            extract_class_info(item, source_code, classes_data)
    
    class_name = node.name
    classes_data.append({
        'name': class_name,
        'methods': methods,
        'code': ast.get_source_segment(source_code, node)
    })

def extract_source_info(source_file):
    with open(source_file, 'r', encoding='utf-8') as f:
        source_code = f.read()
    try:
        tree = ast.parse(source_code)
    except Exception as e:
        return None
    module_functions = []
    classes_data = []
    for node in tree.body:
        if isinstance(node, ast.FunctionDef):
            module_functions.append({
                'name': node.name,
                'code': ast.get_source_segment(source_code, node)
            })
        elif isinstance(node, ast.ClassDef):
            extract_class_info(node, source_code, classes_data)
    return {
        'module_functions': module_functions,
        'classes': classes_data
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python script.py <target_file>"}))
        sys.exit(1)
    target_file = sys.argv[1]
    info = extract_source_info(target_file)
    if info:
        print(json.dumps(info))
    else:
        print(json.dumps({"error": "Failed to parse source code"}))

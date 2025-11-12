#!/usr/bin/env python3
# dealershipai_doctrine_selfheal_autocommit.py
# Validate, auto-fix, and optionally commit DealershipAI UX doctrine files

import json, yaml, sys, subprocess
from pathlib import Path

# ===== Required Schema Definition =====
REQUIRED_TOP_LEVEL_KEYS = {
    "doctrine_id": str,
    "alignment": str,
    "principles": dict,
    "summary": dict
}

REQUIRED_PRINCIPLE_KEYS = [
    "1_define_system_as_workflow",
    "2_hierarchy_of_clarity",
    "3_fuse_product_and_data_design",
    "4_narrative_ux_pulse_cards",
    "5_experience_architecture",
    "6_interaction_signature",
    "7_visual_language",
    "8_continuous_optimization",
    "9_implementation_stack",
    "10_success_metrics"
]

DEFAULT_SUMMARY = {
    "core_equation": "Design clarity × Workflow immediacy × Emotional trust",
    "execution_laws": [
        "Every pixel is a verb",
        "Every insight self-validates",
        "Remove friction until comprehension is automatic"
    ]
}

# ===== Utility Functions =====
def load_file(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {p}")
    with open(p, "r", encoding="utf-8") as f:
        if p.suffix == ".json":
            return json.load(f), "json"
        elif p.suffix in [".yaml", ".yml"]:
            return yaml.safe_load(f), "yaml"
        else:
            raise ValueError("Unsupported file type. Use .json or .yaml")

def save_file(data, original_path, fmt):
    p = Path(original_path)
    normalized_path = p.with_name(p.stem + "_normalized" + p.suffix)
    with open(normalized_path, "w", encoding="utf-8") as f:
        if fmt == "json":
            json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            yaml.safe_dump(data, f, sort_keys=False, allow_unicode=True)
    return normalized_path

# ===== Validation and Auto-Healing =====
def validate_and_fix(data):
    changes = []

    for key, expected_type in REQUIRED_TOP_LEVEL_KEYS.items():
        if key not in data:
            changes.append(f"Added missing top-level key: {key}")
            data[key] = {} if expected_type == dict else ""
        elif not isinstance(data[key], expected_type):
            changes.append(f"Coerced type of '{key}' to {expected_type.__name__}")
            data[key] = {} if expected_type == dict else str(data[key])

    if "principles" not in data or not isinstance(data["principles"], dict):
        data["principles"] = {}
        changes.append("Recreated 'principles' dictionary")

    for pk in REQUIRED_PRINCIPLE_KEYS:
        if pk not in data["principles"]:
            data["principles"][pk] = {"_note": "auto-generated placeholder"}
            changes.append(f"Inserted missing principle: {pk}")

    if "summary" not in data or not isinstance(data["summary"], dict):
        data["summary"] = DEFAULT_SUMMARY.copy()
        changes.append("Recreated summary section")
    else:
        for key, val in DEFAULT_SUMMARY.items():
            if key not in data["summary"]:
                data["summary"][key] = val
                changes.append(f"Inserted missing summary key: {key}")

    return data, changes

# ===== Git Helpers =====
def git_commit(file_path, message):
    try:
        subprocess.run(["git", "add", str(file_path)], check=True)
        subprocess.run(
            ["git", "commit", "-m", message],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(f"📦 Auto-committed normalized file: {file_path}")
    except subprocess.CalledProcessError as e:
        print("⚠️ Git commit skipped or failed:", e)

# ===== Main =====
def main(file_path, auto_commit=True):
    data, fmt = load_file(file_path)
    data, changes = validate_and_fix(data)

    if changes:
        normalized_path = save_file(data, file_path, fmt)
        print("✅ Doctrine normalized and validated.")
        for c in changes:
            print(f"  - {c}")
        print(f"Saved normalized file → {normalized_path}")

        if auto_commit:
            git_commit(normalized_path, "ci: normalize UX doctrine schema")
    else:
        print("✅ Doctrine validated. No changes needed.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dealershipai_doctrine_selfheal_autocommit.py path/to/DealershipAI_Design_Doctrine_v1.0.yaml [--no-commit]")
        sys.exit(1)

    auto_commit = "--no-commit" not in sys.argv
    file_arg = next(a for a in sys.argv[1:] if not a.startswith("--"))
    main(file_arg, auto_commit)

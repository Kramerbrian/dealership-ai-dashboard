import asyncio
import json
import os
import urllib.request
from datetime import datetime, timezone


async def run_once() -> dict:
    proc = await asyncio.create_subprocess_exec(
        "python3", "/workspace/scripts/cta_audit.py",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    # The audit script prints JSON to stdout
    try:
        parsed = json.loads(stdout.decode().split("\n")[-1])
    except Exception:
        # Fallback: read the report file
        try:
            with open("/workspace/cta_audit_report.json", "r") as f:
                parsed = json.load(f)
        except Exception as e:
            parsed = {"error": str(e), "all_ok": False}
    return parsed


async def notify(status: dict):
    # Placeholder: write a status file and print minimal message
    stamp = datetime.now(timezone.utc).isoformat()
    status["notified_at"] = stamp
    with open("/workspace/cta_monitor_status.json", "w") as f:
        json.dump(status, f, indent=2)
    print(f"[cta-monitor] {stamp} all_ok={status.get('all_ok')} ctas={len(status.get('results', []))}")
    # Optional webhook notification when all OK
    hook = os.getenv("CTA_WEBHOOK_URL", "").strip()
    if hook and status.get("all_ok"):
        payload = {
            "text": f"All CTAs validated for {status.get('url')} at {stamp}"
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(hook, data=data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as _:
                pass
        except Exception:
            pass


async def main():
    interval_seconds = int(os.getenv("CTA_MONITOR_INTERVAL", "600"))
    consecutive_ok_required = int(os.getenv("CTA_MONITOR_OK_STREAK", "2"))
    ok_streak = 0
    while True:
        status = await run_once()
        await notify(status)
        if status.get("all_ok"):
            ok_streak += 1
        else:
            ok_streak = 0
        if ok_streak >= consecutive_ok_required:
            # Exit when stable OK is reached
            break
        await asyncio.sleep(interval_seconds)


if __name__ == "__main__":
    asyncio.run(main())


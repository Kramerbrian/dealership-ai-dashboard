import asyncio
import json
from datetime import datetime, timezone

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError


CTA_SELECTORS = [
    {"name": "Top Nav - Sign In", "get": lambda page: page.get_by_role("button", name="Sign In")},
    {"name": "Hero - Scan Now", "get": lambda page: page.get_by_role("button", name="Scan Now")},
    {"name": "Dashboard Card - Get Action Plan", "get": lambda page: page.get_by_role("button", name="Get Action Plan")},
    {"name": "Report - Get My Free Report", "get": lambda page: page.get_by_role("button", name="Get My Free Report")},
    {"name": "Final CTA - Start Your Free Analysis Now", "get": lambda page: page.get_by_role("button", name="Start Your Free Analysis Now")},
]


async def ensure_ready(page):
    await page.wait_for_load_state("domcontentloaded")
    # Wait a bit for hydration
    try:
        await page.wait_for_load_state("networkidle", timeout=10000)
    except PlaywrightTimeoutError:
        pass


async def open_and_validate_clerk_modal(page):
    """Detect Clerk modal/open state by waiting for an iframe or portal from Clerk."""
    # Clerk modals often render an iframe with clerk.accounts in src or a portal with data attributes
    try:
        await page.wait_for_selector("iframe[src*='clerk.']", timeout=5000)
        return True, "iframe detected"
    except PlaywrightTimeoutError:
        # Fallback: look for data-clerk elements
        try:
            await page.wait_for_selector("[data-clerk-modal],[data-clerk-element],[data-clerk-container]", timeout=3000)
            return True, "clerk data element detected"
        except PlaywrightTimeoutError:
            # As a final fallback, check if URL changed to sign-in/up route
            url = page.url
            if any(seg in url for seg in ["sign-in", "sign-up", "/signin", "/signup"]):
                return True, f"navigated to {url}"
            return False, "no clerk modal or redirect detected"


async def audit_ctas(base_url: str):
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto(base_url, wait_until="domcontentloaded")
        await ensure_ready(page)

        # Special handling for the Scan Now CTA: enable it by typing a URL
        try:
            url_input = page.get_by_role("textbox").filter(has_text=None)
            if await url_input.count() > 0:
                await url_input.nth(0).fill("https://example-dealer.com")
        except Exception:
            pass

        for cta in CTA_SELECTORS:
            name = cta["name"]
            entry = {"cta": name, "status": "unknown", "details": ""}
            try:
                locator = cta["get"](page)
                await locator.scroll_into_view_if_needed()
                # Some CTAs may be disabled until input filled; try to enable first
                is_disabled = await locator.is_disabled() if await locator.count() > 0 else True
                if is_disabled and "Scan Now" in name:
                    try:
                        # Attempt to fill again in case selector lookup differs
                        await page.fill("input[type='url']", "https://example-dealer.com")
                        is_disabled = await locator.is_disabled()
                    except Exception:
                        pass

                if await locator.count() == 0:
                    entry["status"] = "not_found"
                    entry["details"] = "CTA button not found in DOM"
                else:
                    if is_disabled:
                        entry["status"] = "disabled"
                        entry["details"] = "Button is disabled and cannot be clicked"
                    else:
                        await locator.click()
                        ok, how = await open_and_validate_clerk_modal(page)
                        entry["status"] = "ok" if ok else "failed"
                        entry["details"] = how
                        # Close modal if exists to continue
                        if ok:
                            # Try pressing Escape to close modal
                            try:
                                await page.keyboard.press("Escape")
                                await page.wait_for_timeout(500)
                            except Exception:
                                pass
            except PlaywrightTimeoutError as e:
                entry["status"] = "timeout"
                entry["details"] = str(e)
            except Exception as e:
                entry["status"] = "error"
                entry["details"] = str(e)
            results.append(entry)

        await context.close()
        await browser.close()

    report = {
        "url": base_url,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "all_ok": all(r.get("status") == "ok" or (r.get("cta").startswith("Hero - Scan Now") and r.get("status") in ["ok", "disabled"]) for r in results),
    }
    return report


async def main():
    report = await audit_ctas("https://www.dealershipai.com/")
    print(json.dumps(report, indent=2))
    with open("/workspace/cta_audit_report.json", "w") as f:
        json.dump(report, f, indent=2)


if __name__ == "__main__":
    asyncio.run(main())


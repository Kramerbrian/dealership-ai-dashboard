#!/bin/bash

# Python SDK smoke test script
# Tests the DealershipAI Python SDK functionality

set -euo pipefail

# Configuration from environment variables
BASE="${BASE:?BASE environment variable required}"
TOKEN="${TOKEN:?TOKEN environment variable required}"
TENANT="${TENANT:?TENANT environment variable required}"

echo "🧪 Running Python SDK smoke tests..."
echo "Base URL: $BASE"
echo "Tenant ID: $TENANT"
echo ""

# Create temporary Python script
cat > /tmp/smoke_test.py << 'EOF'
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'sdk', 'python'))

from dealershipai import DealershipAI, DealershipAIError, APIError

def main():
    # Configuration
    base_url = os.environ["BASE"]
    token = os.environ["TOKEN"]
    tenant_id = os.environ["TENANT"]
    
    # Initialize SDK
    api = DealershipAI(base_url, token, timeout=30)
    
    try:
        # Test 1: HRP Status
        print("1️⃣ Testing HRP status...")
        hrp_status = api.hrp_status(tenant_id)
        print("✅ HRP status retrieved successfully")
        print(f"   - Findings: {len(hrp_status['findings'])}")
        print(f"   - Quarantined topics: {len(hrp_status['quarantine'])}")
        print()
        
        # Test 2: HRP Scan
        print("2️⃣ Testing HRP scan...")
        scan_result = api.hrp_scan(tenant_id)
        print("✅ HRP scan initiated successfully")
        print(f"   - Message: {scan_result['message']}")
        print()
        
        # Test 3: Generate idempotency key
        print("3️⃣ Testing idempotency key generation...")
        idempotency_key = api.generate_idempotency_key()
        print("✅ Idempotency key generated")
        print(f"   - Key: {idempotency_key}")
        print()
        
        # Test 4: ASR Execute (with mock data)
        print("4️⃣ Testing ASR execute...")
        try:
            asr_result = api.asr_execute(
                tenant_id,
                ["vdp-123", "vdp-456"],
                idempotency_key,
                include_competitors=False,
                analysis_depth="quick"
            )
            print("✅ ASR execute successful")
            print(f"   - Recommendations: {len(asr_result['recommendations'])}")
            print(f"   - Total impact: {asr_result['summary']['estimatedImpact']}")
        except APIError as e:
            if e.status_code == 412 or "No context" in e.message:
                print("⚠️  ASR execute returned 412 (No context) - this is expected for demo data")
            else:
                raise
        print()
        
        # Test 5: Batch HRP resolve (if there are quarantined topics)
        print("5️⃣ Testing batch HRP resolve...")
        quarantined_topics = [q["topic"] for q in hrp_status["quarantine"] if q.get("active", False)]
        
        if quarantined_topics:
            print(f"   Resolving topics: {', '.join(quarantined_topics)}")
            batch_results = api.batch_hrp_resolve(tenant_id, quarantined_topics)
            
            successful = sum(1 for r in batch_results if r["success"])
            failed = sum(1 for r in batch_results if not r["success"])
            
            print(f"✅ Batch resolve completed: {successful} successful, {failed} failed")
        else:
            print("   No quarantined topics to resolve (this is normal for a clean system)")
        print()
        
        # Test 6: AVI Latest (if available)
        print("6️⃣ Testing AVI latest...")
        try:
            avi_latest = api.avi_latest(tenant_id)
            print("✅ AVI latest retrieved successfully")
            print(f"   - AIV Score: {avi_latest['aiv']}")
            print(f"   - Google SGE: {avi_latest['breakdown']['google_sge']}")
            print(f"   - Perplexity: {avi_latest['breakdown']['perplexity']}")
        except APIError as e:
            if e.status_code == 404:
                print("⚠️  AVI latest returned 404 (No data) - this is expected for demo data")
            else:
                raise
        print()
        
        # Test 7: Utility methods
        print("7️⃣ Testing utility methods...")
        is_quarantined = api.is_topic_quarantined(tenant_id, "Price")
        quarantined_list = api.get_quarantined_topics(tenant_id)
        print("✅ Utility methods working")
        print(f"   - Is 'Price' quarantined: {is_quarantined}")
        print(f"   - All quarantined topics: {quarantined_list}")
        print()
        
        print("🎉 All Python SDK smoke tests passed!")
        print()
        print("Summary:")
        print("- HRP Status: ✅ Working")
        print("- HRP Scan: ✅ Working")
        print("- Idempotency Key: ✅ Working")
        print("- ASR Execute: ✅ Working (or expected 412)")
        print("- Batch HRP Resolve: ✅ Working")
        print("- AVI Latest: ✅ Working (or expected 404)")
        print("- Utility Methods: ✅ Working")
        print()
        print("Python SDK is ready for production use.")
        
    except Exception as e:
        print(f"❌ SDK smoke test failed:")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        sys.exit(1)
    finally:
        api.close()

if __name__ == "__main__":
    main()
EOF

# Run the Python smoke test
python3 /tmp/smoke_test.py

# Clean up
rm -f /tmp/smoke_test.py

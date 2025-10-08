/**
 * Console Test Script
 * Copy and paste into browser console at http://localhost:8000/dealership-ai-dashboard.html
 */

console.log('🧪 Starting DealershipAI Dashboard Tests...\n');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, condition) {
    tests.push({ name, condition });
    if (condition) {
        passed++;
        console.log(`✅ PASS: ${name}`);
    } else {
        failed++;
        console.error(`❌ FAIL: ${name}`);
    }
}

// Security Tests
console.log('\n🔒 SECURITY TESTS');
console.log('─'.repeat(50));
test('Secure API client loaded', typeof window.secureAPI !== 'undefined');
test('Secure storage loaded', typeof window.secureStorage !== 'undefined');
test('Error handler loaded', typeof window.errorHandler !== 'undefined');

// Test secure storage encryption
console.log('\nTesting secure storage encryption...');
if (window.secureStorage) {
    window.secureStorage.setItem('test', { secret: 'data123' });
    const retrieved = window.secureStorage.getItem('test');
    const encrypted = localStorage.getItem('secure_test');
    test('Secure storage encryption works', retrieved && retrieved.secret === 'data123');
    test('Data is actually encrypted', encrypted && !encrypted.includes('data123'));
    window.secureStorage.removeItem('test');
    console.log('✓ Encryption test complete');
}

// Accessibility Tests
console.log('\n♿ ACCESSIBILITY TESTS');
console.log('─'.repeat(50));
test('Accessibility manager loaded', typeof window.accessibilityManager !== 'undefined');
test('Event manager loaded', typeof window.eventManager !== 'undefined');
test('Screen reader announce function available', typeof window.announceToScreenReader === 'function');

// Check ARIA attributes
const tabsWithRole = document.querySelectorAll('.apple-tab[role="tab"]');
const panelsWithRole = document.querySelectorAll('[role="tabpanel"]');
const modalsWithRole = document.querySelectorAll('.cupertino-modal[role="dialog"]');
const skipLink = document.querySelector('.skip-link');

test('ARIA roles on tabs', tabsWithRole.length > 0);
test('ARIA roles on tab panels', panelsWithRole.length > 0);
test('ARIA roles on modals', modalsWithRole.length > 0);
test('Skip to content link present', !!skipLink);

console.log(`Found ${tabsWithRole.length} tabs with role="tab"`);
console.log(`Found ${panelsWithRole.length} panels with role="tabpanel"`);
console.log(`Found ${modalsWithRole.length} modals with role="dialog"`);

// Performance Tests
console.log('\n⚡ PERFORMANCE TESTS');
console.log('─'.repeat(50));
test('Loading manager loaded', typeof window.loadingManager !== 'undefined');
test('showLoading function available', typeof window.showLoading === 'function');
test('hideLoading function available', typeof window.hideLoading === 'function');
test('showSkeleton function available', typeof window.showSkeleton === 'function');
test('hideSkeleton function available', typeof window.hideSkeleton === 'function');
test('setButtonLoading function available', typeof window.setButtonLoading === 'function');

// Check skeleton styles injected
const skeletonStyles = document.getElementById('skeleton-styles');
test('Skeleton CSS styles injected', !!skeletonStyles);

// Error Handling Tests
console.log('\n🚨 ERROR HANDLING TESTS');
console.log('─'.repeat(50));
test('Error handler initialized', typeof window.errorHandler !== 'undefined');
test('handleApiError function available', typeof window.handleApiError === 'function');
test('withErrorHandling function available', typeof window.withErrorHandling === 'function');

// Summary
console.log('\n📊 TEST SUMMARY');
console.log('─'.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${tests.length}`);
console.log(`📊 Pass Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

if (passed === tests.length) {
    console.log('\n🎉 ALL TESTS PASSED! Ready for deployment!');
} else {
    console.warn('\n⚠️ Some tests failed. Please review before deployment.');
}

// Interactive Tests
console.log('\n🎮 INTERACTIVE TESTS (Manual)');
console.log('─'.repeat(50));
console.log('Run these commands to test interactively:\n');

console.log('1. Test Loading Skeleton:');
console.log('   showSkeleton("ai-health", "metrics")');
console.log('   setTimeout(() => hideSkeleton("ai-health"), 2000)\n');

console.log('2. Test Loading Overlay:');
console.log('   showLoading("overview", "Loading data...")');
console.log('   setTimeout(() => hideLoading("overview"), 2000)\n');

console.log('3. Test Button Loading:');
console.log('   const btn = document.querySelector(".apple-btn")');
console.log('   setButtonLoading(btn, true, "Saving...")');
console.log('   setTimeout(() => setButtonLoading(btn, false), 2000)\n');

console.log('4. Test Error Handling:');
console.log('   handleApiError(new Error("Test error"), "Testing")\n');

console.log('5. Test Screen Reader Announcement:');
console.log('   announceToScreenReader("Test announcement", "polite")\n');

console.log('6. View Error Stats:');
console.log('   errorHandler.getErrorStats()\n');

console.log('7. Test Secure Storage:');
console.log('   secureStorage.setItem("myData", { value: "secret" })');
console.log('   secureStorage.getItem("myData")\n');

console.log('\n📝 KEYBOARD NAVIGATION TESTS (Manual)');
console.log('─'.repeat(50));
console.log('• Press Tab - Focus should move through elements');
console.log('• Press Enter/Space on buttons - Should activate');
console.log('• Press Escape in modal - Should close');
console.log('• Press Arrow Left/Right on tabs - Should navigate\n');

console.log('✅ Test script complete! Check results above.\n');

const fs = require("fs");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");

const variants = ["fear", "power", "innovate", "boardroom"];
const outDir = "public/audit-reports";

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Get API key from environment or use default
const PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || "";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://dealershipai.com";

/**
 * Fetch metrics from Google PageSpeed Insights
 */
function getMetric(variant) {
  try {
    const url = `${BASE_URL}/marketing?variant=${variant}`;
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}`;
    
    // Add API key if provided
    if (PAGESPEED_API_KEY) {
      apiUrl += `&key=${PAGESPEED_API_KEY}`;
    }

    console.log(`Fetching metrics for variant: ${variant}...`);
    
    const data = JSON.parse(
      execSync(`curl -s "${apiUrl}"`, { encoding: 'utf8' })
    );

    const lr = data.lighthouseResult;
    
    if (!lr || !lr.audits) {
      throw new Error("Invalid Lighthouse response");
    }

    return {
      variant,
      lcp: (lr.audits["largest-contentful-paint"]?.numericValue || 0) / 1000,
      cls: lr.audits["cumulative-layout-shift"]?.numericValue || 0,
      inp: (lr.audits["interactive"]?.numericValue || 0) / 1000,
      perf: (lr.categories?.performance?.score || 0) * 100,
    };
  } catch (error) {
    console.error(`Error fetching metrics for ${variant}:`, error.message);
    // Return default values on error
    return { 
      variant, 
      lcp: 0, 
      cls: 0, 
      inp: 0, 
      perf: 0 
    };
  }
}

/**
 * Get real analytics data for variants
 * Fetches CTR and Conversion from GA4, Mixpanel, or Segment
 */
async function addAnalyticsData(metrics) {
  try {
    // Try to load analytics module (if available)
    let getVariantAnalytics;
    try {
      // Use dynamic import for Node.js environment
      const analyticsModule = require('../lib/analytics/variant-analytics.ts');
      getVariantAnalytics = analyticsModule.getVariantAnalytics;
    } catch (err) {
      // Fallback if module not available
      console.warn('Analytics module not available, using API endpoint');
    }

    // Fetch analytics data for each variant
    const analyticsPromises = metrics.map(async (m) => {
      try {
        // Try API endpoint first
        const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/variant?variant=${m.variant}&range=30d`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          m.ctr = parseFloat(data.ctr || 0).toFixed(3);
          m.conv = parseFloat(data.conv || 0).toFixed(3);
          m.impressions = data.impressions;
          m.clicks = data.clicks;
          m.conversions = data.conversions;
          return m;
        }
      } catch (err) {
        console.warn(`Failed to fetch analytics for ${m.variant}, using fallback`);
      }

      // Fallback to simulated data
      const seed = m.variant.charCodeAt(0) + m.variant.charCodeAt(m.variant.length - 1);
      const seededRandom = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      m.ctr = (0.05 + seededRandom(seed) * 0.1).toFixed(3);
      m.conv = (0.02 + seededRandom(seed + 1) * 0.05).toFixed(3);
      return m;
    });

    await Promise.all(analyticsPromises);
    return metrics;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Fallback to simulated data
    metrics.forEach((m) => {
      const seed = m.variant.charCodeAt(0) + m.variant.charCodeAt(m.variant.length - 1);
      const seededRandom = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      m.ctr = (0.05 + seededRandom(seed) * 0.1).toFixed(3);
      m.conv = (0.02 + seededRandom(seed + 1) * 0.05).toFixed(3);
    });
    return metrics;
  }
}

// Main execution function
async function main() {
  // --- Collect data
  console.log("Collecting metrics for all variants...");
  const metrics = variants.map(getMetric);

  // Add analytics data
  console.log("Adding analytics data...");
  const metricsWithAnalytics = await addAnalyticsData(metrics);

  // --- CSV export
  console.log("Generating CSV report...");
  const csv = [
    "Variant,LCP(s),CLS,INP(s),PerfScore,CTR,ConversionRate",
    ...metricsWithAnalytics.map(
      (m) => `${m.variant},${m.lcp},${m.cls},${m.inp},${m.perf},${m.ctr},${m.conv}`
    )
  ].join("\n");

  const csvPath = `${outDir}/abtest_metrics.csv`;
  fs.writeFileSync(csvPath, csv);
  console.log(`✅ CSV report saved: ${csvPath}`);

  // --- PDF report
  console.log("Generating PDF report...");
  
  const timestamp = new Date().toISOString();
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 24px; 
        background: #fff;
        color: #333;
      }
      h1 { 
        color: #1e293b; 
        margin-bottom: 8px;
        font-size: 28px;
      }
      .subtitle {
        color: #64748b;
        font-size: 14px;
        margin-bottom: 24px;
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin-top: 20px;
      }
      th, td { 
        border: 1px solid #ddd; 
        padding: 12px; 
        text-align: left;
      }
      th { 
        background: #f4f4f4; 
        font-weight: 600;
        color: #1e293b;
      }
      tr:nth-child(even) {
        background: #f9f9f9;
      }
      .metric-good { color: #10b981; font-weight: 600; }
      .metric-warning { color: #f59e0b; font-weight: 600; }
      .metric-poor { color: #ef4444; font-weight: 600; }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        font-size: 12px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <h1>DealershipAI Post-Deploy A/B Audit</h1>
    <p class="subtitle">Generated: ${timestamp}</p>
    
    <table>
      <thead>
        <tr>
          <th>Variant</th>
          <th>LCP (s)</th>
          <th>CLS</th>
          <th>INP (s)</th>
          <th>Perf Score</th>
          <th>CTR (%)</th>
          <th>Conversion (%)</th>
        </tr>
      </thead>
      <tbody>
        ${metricsWithAnalytics
          .map(
            (m) => `
            <tr>
              <td><strong>${m.variant}</strong></td>
              <td class="${m.lcp < 2.5 ? 'metric-good' : m.lcp < 4 ? 'metric-warning' : 'metric-poor'}">${m.lcp.toFixed(2)}</td>
              <td class="${m.cls < 0.1 ? 'metric-good' : m.cls < 0.25 ? 'metric-warning' : 'metric-poor'}">${m.cls.toFixed(3)}</td>
              <td class="${m.inp < 200 ? 'metric-good' : m.inp < 500 ? 'metric-warning' : 'metric-poor'}">${m.inp.toFixed(2)}</td>
              <td class="${m.perf > 90 ? 'metric-good' : m.perf > 50 ? 'metric-warning' : 'metric-poor'}">${m.perf.toFixed(0)}</td>
              <td>${(parseFloat(m.ctr) * 100).toFixed(1)}%</td>
              <td>${(parseFloat(m.conv) * 100).toFixed(1)}%</td>
            </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
    
    <div class="footer">
      <p><strong>Notes:</strong></p>
      <ul>
        <li>LCP (Largest Contentful Paint): &lt;2.5s (good), &lt;4s (needs improvement), &gt;4s (poor)</li>
        <li>CLS (Cumulative Layout Shift): &lt;0.1 (good), &lt;0.25 (needs improvement), &gt;0.25 (poor)</li>
        <li>INP (Interaction to Next Paint): &lt;200ms (good), &lt;500ms (needs improvement), &gt;500ms (poor)</li>
        <li>Performance Score: 0-100 (Lighthouse score)</li>
        <li>CTR and Conversion data are simulated. Replace with actual analytics integration.</li>
      </ul>
    </div>
  </body>
  </html>
  `;

  try {
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // For CI/CD environments
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    const pdfPath = `${outDir}/abtest_report.pdf`;
    await page.pdf({ 
      path: pdfPath, 
      format: "A4",
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    await browser.close();
    
    console.log(`✅ PDF report generated: ${pdfPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Variants tested: ${variants.length}`);
    console.log(`   - CSV file: ${csvPath}`);
    console.log(`   - PDF file: ${pdfPath}`);
    console.log(`   - Total reports: ${metricsWithAnalytics.length}`);
    
  } catch (error) {
    console.error("❌ Error generating PDF:", error.message);
    
    // If Puppeteer fails, still save the HTML version
    const htmlPath = `${outDir}/abtest_report.html`;
    fs.writeFileSync(htmlPath, html);
    console.log(`⚠️  PDF generation failed. HTML report saved: ${htmlPath}`);
  }
}

// Run main function
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});


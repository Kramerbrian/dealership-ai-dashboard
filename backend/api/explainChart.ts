import express from "express";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const router = express.Router();

router.post("/chart", async (req, res) => {
  try {
    const decision = req.body; // dealerId, schemaType, features, id
    const tmp = `/tmp/decision_${Date.now()}_${Math.random().toString(36).slice(2)}.json`;
    
    await fs.writeFile(tmp, JSON.stringify(decision));

    return new Promise<void>((resolve, reject) => {
      const proc = spawn("python3", [
        path.join(__dirname, "../../analytics/explainability/generate_shap_chart.py"),
        tmp
      ]);

      let output = "";
      let errorOutput = "";

      proc.stdout.on("data", (d) => (output += d.toString()));
      proc.stderr.on("data", (d) => (errorOutput += d.toString()));

      proc.on("close", (code) => {
        fs.unlink(tmp).catch(() => {}); // Cleanup

        if (code === 0) {
          try {
            const data = JSON.parse(output);
            res.json(data);
            resolve();
          } catch (e) {
            res.status(500).json({ error: "Failed to parse SHAP output", details: errorOutput });
            reject(e);
          }
        } else {
          res.status(500).json({ error: "SHAP chart generation failed", details: errorOutput });
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;


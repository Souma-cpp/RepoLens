import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import {
    parseGitHubRepoUrl,
    fetchRepoFile,
    detectStack,
    generateRunSteps,
    fetchRepoTree,
    buildMarkdown,
    findPackageJsonPath,
    buildImportant,
    calculateScore,
} from "./utils/repo.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.status(200).json({ msg: "base route is working" });
});

app.post("/analyze", async (req, res) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: "repoUrl is required" });
        }

        const { owner, repo } = parseGitHubRepoUrl(repoUrl);

        // ✅ fetch repo tree (main or master)
        const tree = await fetchRepoTree(owner, repo);

        // ✅ find package.json anywhere in repo
        const pkgPath = findPackageJsonPath(tree);
        const pkgRaw = pkgPath ? await fetchRepoFile(owner, repo, pkgPath) : null;

        // ✅ readme
        const readmeRaw = await fetchRepoFile(owner, repo, "README.md");

        let pkgJson = null;
        if (pkgRaw) {
            try {
                pkgJson = JSON.parse(pkgRaw);
            } catch {
                pkgJson = null;
            }
        }

        const detected = pkgJson
            ? detectStack(pkgJson)
            : { framework: "Unknown", stack: [] };

        const runSteps = pkgJson
            ? generateRunSteps(pkgJson)
            : ["npm install", "npm run dev"];

        const warnings = [];
        const important = buildImportant({ tree, pkgPath, readmeRaw });

        // ✅ warnings
        if (!tree?.tree?.length) warnings.push("Could not fetch repo tree (check token / branch)");

        if (!important.packageJsonPath) warnings.push("package.json not found (monorepo or non-JS repo)");
        if (!important.hasReadme) warnings.push("README is missing");
        else if (readmeRaw && readmeRaw.length < 200) warnings.push("README is too small");

        if (!important.hasEnvExample) warnings.push("Missing .env.example");
        if (!important.hasDockerfile) warnings.push("Missing Dockerfile");
        if (!important.hasDockerCompose) warnings.push("No docker-compose.yml found");
        if (!important.hasLicense) warnings.push("No LICENSE file found");
        if (!important.hasTests) warnings.push("No tests folder/config found");

        const score = calculateScore({ important, warnings });

        const markdown = buildMarkdown({
            repo: { owner, repo },
            framework: detected.framework,
            stack: detected.stack,
            runSteps,
            warnings,
            important,
            score,
        });

        return res.status(200).json({
            repo: { owner, name: repo, url: repoUrl },
            detected,
            runSteps,
            warnings,
            important,
            score,
            generatedMarkdown: markdown,
        });
    } catch (err) {
        console.error(err);

        // ✅ show real error to debug
        return res.status(500).json({
            error: "Failed to analyze repo",
            details: err.message,
        });
    }
});

app.listen(port, () => {
    console.log(`✅ server online on http://localhost:${port}`);
});

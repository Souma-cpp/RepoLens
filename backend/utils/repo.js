export function parseGitHubRepoUrl(repoUrl) {
    const u = new URL(repoUrl);
    const parts = u.pathname.split("/").filter(Boolean);

    if (parts.length < 2) throw new Error("Invalid repo URL");
    return { owner: parts[0], repo: parts[1] };
}

function githubHeaders() {
    const headers = {
        Accept: "application/vnd.github+json",
    };

    // ✅ Token required for private repos + higher rate limit
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
}

export async function fetchRepoFile(owner, repo, path) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, { headers: githubHeaders() });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.content) return null;

    return Buffer.from(data.content, "base64").toString("utf-8");
}

export async function fetchRepoTree(owner, repo) {
    // ✅ Try main, then master
    const candidates = ["main", "master"];

    for (const branch of candidates) {
        const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
        const res = await fetch(url, { headers: githubHeaders() });

        if (res.ok) {
            return await res.json();
        }
    }

    return null;
}

export function findPackageJsonPath(tree) {
    if (!tree?.tree?.length) return null;

    // root first
    const root = tree.tree.find((x) => x.path === "package.json");
    if (root) return "package.json";

    // monorepo search
    const candidate = tree.tree.find(
        (x) =>
            x.path.endsWith("package.json") &&
            !x.path.includes("node_modules") &&
            !x.path.includes("/dist/") &&
            !x.path.includes("/build/") &&
            !x.path.includes(".github/")
    );

    return candidate?.path || null;
}

export function detectStack(pkgJson) {
    const deps = {
        ...(pkgJson.dependencies || {}),
        ...(pkgJson.devDependencies || {}),
    };

    const has = (name) => Boolean(deps?.[name]);

    // ✅ frameworks (highest-level classification)
    const FRAMEWORKS = [
        // React ecosystem
        { name: "Next.js", keys: ["next"] },
        { name: "Remix", keys: ["@remix-run/react", "@remix-run/node"] },
        { name: "Gatsby", keys: ["gatsby"] },

        // Vue ecosystem
        { name: "Nuxt", keys: ["nuxt"] },
        { name: "Vue", keys: ["vue"] },

        // Svelte ecosystem
        { name: "SvelteKit", keys: ["@sveltejs/kit"] },
        { name: "Svelte", keys: ["svelte"] },

        // Angular ecosystem
        { name: "Angular", keys: ["@angular/core"] },

        // Backend frameworks
        { name: "Express", keys: ["express"] },
        { name: "Fastify", keys: ["fastify"] },
        { name: "NestJS", keys: ["@nestjs/core"] },
        { name: "Koa", keys: ["koa"] },
        { name: "Hapi", keys: ["@hapi/hapi"] },

        // Full stack meta-frameworks / others
        { name: "Astro", keys: ["astro"] },
        { name: "SolidStart", keys: ["solid-start"] },
        { name: "SolidJS", keys: ["solid-js"] },

        // Edge / serverless
        { name: "Hono", keys: ["hono"] },
    ];

    // ✅ build / tooling detection
    const TOOLS = [
        // language
        { name: "TypeScript", keys: ["typescript"] },

        // bundlers / dev servers
        { name: "Vite", keys: ["vite"] },
        { name: "Webpack", keys: ["webpack"] },
        { name: "Rollup", keys: ["rollup"] },
        { name: "Parcel", keys: ["parcel"] },
        { name: "Turbopack", keys: ["@vercel/turbopack"] },

        // styling
        { name: "TailwindCSS", keys: ["tailwindcss"] },
        { name: "PostCSS", keys: ["postcss"] },
        { name: "Sass", keys: ["sass"] },
        { name: "Styled Components", keys: ["styled-components"] },
        { name: "Emotion", keys: ["@emotion/react", "@emotion/styled"] },

        // UI libs (huge for product)
        { name: "shadcn/ui", keys: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"] },
        { name: "Radix UI", keys: ["@radix-ui/react-dialog"] },
        { name: "Material UI", keys: ["@mui/material"] },
        { name: "Chakra UI", keys: ["@chakra-ui/react"] },
        { name: "Ant Design", keys: ["antd"] },

        // state / data fetching
        { name: "Redux", keys: ["redux", "@reduxjs/toolkit"] },
        { name: "Zustand", keys: ["zustand"] },
        { name: "React Query (TanStack)", keys: ["@tanstack/react-query"] },
        { name: "SWR", keys: ["swr"] },

        // validation
        { name: "Zod", keys: ["zod"] },
        { name: "Yup", keys: ["yup"] },
        { name: "Joi", keys: ["joi"] },

        // HTTP
        { name: "Axios", keys: ["axios"] },

        // auth
        { name: "JWT", keys: ["jsonwebtoken"] },
        { name: "Bcrypt", keys: ["bcrypt", "bcryptjs"] },
        { name: "NextAuth", keys: ["next-auth"] },
        { name: "Passport.js", keys: ["passport"] },

        // database / orm
        { name: "Prisma", keys: ["prisma", "@prisma/client"] },
        { name: "Drizzle ORM", keys: ["drizzle-orm"] },
        { name: "TypeORM", keys: ["typeorm"] },
        { name: "Sequelize", keys: ["sequelize"] },
        { name: "Mongoose (MongoDB)", keys: ["mongoose"] },
        { name: "MongoDB Driver", keys: ["mongodb"] },

        // backend services
        { name: "Firebase", keys: ["firebase"] },
        { name: "Supabase", keys: ["@supabase/supabase-js"] },

        // testing
        { name: "Jest", keys: ["jest"] },
        { name: "Vitest", keys: ["vitest"] },
        { name: "Playwright", keys: ["playwright"] },
        { name: "Cypress", keys: ["cypress"] },

        // lint/format
        { name: "ESLint", keys: ["eslint"] },
        { name: "Prettier", keys: ["prettier"] },

        // runtime / server
        { name: "Node.js", keys: ["node"] }, // not always in deps, but ok
        { name: "Bun", keys: ["bun"] },

        // graphql
        { name: "GraphQL", keys: ["graphql"] },
        { name: "Apollo", keys: ["@apollo/client", "apollo-server"] },
        { name: "tRPC", keys: ["@trpc/server", "@trpc/client"] },

        // API docs
        { name: "Swagger", keys: ["swagger-ui-express", "swagger-jsdoc"] },
    ];

    // ✅ detect framework with scoring (more robust than if/else)
    const frameworkScores = FRAMEWORKS.map((fw) => {
        const score = fw.keys.reduce((acc, k) => acc + (has(k) ? 1 : 0), 0);
        return { framework: fw.name, score };
    });

    frameworkScores.sort((a, b) => b.score - a.score);

    let framework = "Unknown";
    if (frameworkScores[0]?.score > 0) {
        framework = frameworkScores[0].framework;
    }

    // ✅ detect tools stack
    const stack = [];

    for (const item of TOOLS) {
        if (item.keys.some((k) => has(k))) {
            stack.push(item.name);
        }
    }

    // ✅ extra: infer language / package manager hints from scripts (bonus)
    const scripts = pkgJson.scripts || {};
    const scriptText = Object.values(scripts).join(" ").toLowerCase();

    if (scriptText.includes("ts-node") && !stack.includes("TypeScript")) {
        stack.push("TypeScript");
    }

    // ✅ remove duplicates + keep nice order
    const uniqueStack = [...new Set(stack)];

    // ✅ if framework is React but framework detection failed
    if (framework === "Unknown" && has("react")) {
        framework = "React";
    }
    if (framework === "Unknown" && has("vue")) {
        framework = "Vue";
    }
    if (framework === "Unknown" && has("svelte")) {
        framework = "Svelte";
    }

    return {
        framework,
        stack: uniqueStack,
        rawDepsCount: Object.keys(deps).length,
    };
}


export function generateRunSteps(pkgJson) {
    const scripts = pkgJson.scripts || {};
    const steps = [];

    steps.push("npm install");

    if (scripts.dev) steps.push("npm run dev");
    else if (scripts.start) steps.push("npm start");
    else if (scripts.build) {
        steps.push("npm run build");
        steps.push("npm start");
    } else {
        steps.push("# No dev/start script found");
    }

    return steps;
}

export function buildImportant({ tree, pkgPath, readmeRaw }) {
    const fileSet = tree?.tree?.length
        ? new Set(tree.tree.map((x) => x.path))
        : new Set();

    const hasTests = [...fileSet].some((p) => {
        const low = p.toLowerCase();
        return (
            low.includes("__tests__") ||
            low.includes("/test/") ||
            low.includes("/tests/") ||
            low.includes("jest.config") ||
            low.includes("vitest.config")
        );
    });

    return {
        packageJsonPath: pkgPath || null,
        hasDockerfile: fileSet.has("Dockerfile"),
        hasDockerCompose: fileSet.has("docker-compose.yml"),
        hasEnvExample: fileSet.has(".env.example"),
        hasLicense: fileSet.has("LICENSE"),
        hasReadme: Boolean(readmeRaw),
        hasTests,
    };
}

export function calculateScore({ important, warnings }) {
    let score = 100;

    if (!important.packageJsonPath) score -= 25;
    if (!important.hasReadme) score -= 20;
    if (!important.hasEnvExample) score -= 15;
    if (!important.hasDockerfile) score -= 10;
    if (!important.hasTests) score -= 10;

    if (warnings.length >= 5) score -= 10;

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
}

export function buildMarkdown({ repo, framework, stack, runSteps, warnings, important, score }) {
    return `# RepoLens Report

## Repo
- **${repo.owner}/${repo.repo}**
- Score: **${score}/100**

## Tech Stack
- Framework: **${framework}**
${stack.length ? stack.map((s) => `- ${s}`).join("\n") : "- (No stack detected)"}

## Key Signals
- package.json: ${important.packageJsonPath ? `\`${important.packageJsonPath}\`` : "❌ Not found"}
- README: ${important.hasReadme ? "✅ Found" : "❌ Missing"}
- Dockerfile: ${important.hasDockerfile ? "✅ Found" : "❌ Missing"}
- docker-compose.yml: ${important.hasDockerCompose ? "✅ Found" : "❌ Missing"}
- .env.example: ${important.hasEnvExample ? "✅ Found" : "❌ Missing"}
- Tests: ${important.hasTests ? "✅ Found" : "❌ Not detected"}

## Run locally
${runSteps.map((s) => `\`${s}\``).join("\n\n")}

## Warnings
${warnings.length
            ? warnings.map((w) => `- ⚠️ ${w}`).join("\n")
            : "- ✅ No major issues detected"
        }
`;
}

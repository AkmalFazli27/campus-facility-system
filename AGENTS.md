<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MANDATORY - Codebase Intelligence (codebase-memory-mcp)

ALWAYS use `codebase-memory-mcp` BEFORE reading files directly:
1. `search_graph` to find functions, classes, or variables
2. `trace_path` for dependencies (callers and callees)
3. `get_code_snippet` / `get_architecture` to read source code
ONLY fall back to `grep`/`glob`/`read` if the graph returns no results or when dealing with string literals/configurations.

For notebooks specifically: functions in `notebooks/*.ipynb` are synced to `notebooks/*.py` via jupytext (untracked but indexed). Search within `notebooks/eda.py` or `modeling.py` using the graph; do not parse the `.ipynb` JSON directly.

Do not ask for keywords again—this is the default rule for all planning and exploration tasks in this repository.

## Database Rules (wajib)

* Dev harian pakai MySQL lokal `campus_facility_dev`. Aiven `campus_facility` hanya untuk integrasi/demo.
* Dilarang `prisma migrate reset` dan `prisma migrate dev` ke database Aiven. Ke staging hanya `migrate deploy`.
* Jangan commit `.env*` kecuali `.env.example`. Jangan tulis password asli di repo/PR/chat publik.
* Detail lengkap: README bagian Setup Database + PRD §12/§28.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.opencode/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.opencode/skills/antislop-ui/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.opencode/skills/antislop-layoutmobile/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

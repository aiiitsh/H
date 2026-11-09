# Notes for Claude

When Ahmed talks about his life (habits, goals, feelings, faith, work, relationships, attention) rather than code, act as his mentor.
His private mentor rules are not in this repo. At the start of such a conversation, load them with:

    node scripts/claude-api.mjs mentor

and follow them. If that fails (no `.claude-api.json` or no network), say so and ask Ahmed to paste his rules.

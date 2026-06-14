# Airport Ops — Visual v16 Docs Pack

Questa versione parte dalla v15 e aggiunge la documentazione ufficiale del progetto, costruita dalle decisioni prese in chat.

## Cosa contiene

- Pixi live renderer con base map production.
- Sprite NPC, aerei e veicoli estratti.
- Mission loop con stelle e unlock.
- Registry npm pubblico in `.npmrc`.
- Documentazione progetto in `docs/`.

## Documenti importanti

Leggere in questo ordine:

1. `docs/PROJECT_MEMORY.md` — memoria completa del progetto.
2. `docs/VISUAL_BIBLE.md` — regole artistiche ufficiali.
3. `docs/ASSET_PIPELINE.md` — come gestire immagini/sprite/overlay.
4. `docs/ROADMAP.md` — prossime versioni v16-v23.
5. `docs/IMPLEMENTATION_NOTES.md` — note tecniche di sviluppo.
6. `docs/PROMPTS_AND_ART_DIRECTION.md` — prompt e regole per generare asset coerenti.
7. `docs/VERSION_HISTORY.md` — cronologia versioni.

## Run locale

```bash
cd ~/Desktop/"GPT Game"/airport-ops-claude-vite
npm install --no-audit --no-fund
npm run dev
```

Live view diretta:

```text
http://localhost:5173/?autostart=1
```

## Se npm dà problemi

```bash
rm -rf node_modules package-lock.json
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund --registry=https://registry.npmjs.org/
npm run dev
```

## Push

```bash
cd ~/Desktop/"GPT Game"/airport-ops-claude-vite
git status
git add .
git commit -m "Add project visual bible and production docs"
git push
```

## Nota

Da ora la direzione ufficiale è: una mappa canonica stabile, NPC/aerei/veicoli separati, upgrade come moduli, eventi come overlay, UI mobile-first.

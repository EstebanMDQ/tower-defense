## 1. Project setup

- [ ] 1.1 Initialize `package.json` and install `phaser`, `vite`, `typescript`
      (dev) - requires user approval to install deps
- [ ] 1.2 Add `tsconfig.json` with `strict: true` and no implicit `any`
- [ ] 1.3 Add `vite.config.ts` and `index.html` mounting the game canvas
- [ ] 1.4 Add `npm run dev` / `npm run build` scripts

## 2. Coordinate model

- [ ] 2.1 Create `src/config/grid.ts` with columns (9), rows (16), Base row, and
      Portal row constants
- [ ] 2.2 Add tile <-> pixel conversion helpers driven by grid config
- [ ] 2.3 Create `src/types.ts` for shared types (tile coords, target class)

## 3. Game shell

- [ ] 3.1 Create `src/main.ts` bootstrapping `Phaser.Game` with portrait
      `Scale.FIT` configuration
- [ ] 3.2 Add `BootScene`, `GameScene`, `HUDScene`, `GameOverScene` skeletons
- [ ] 3.3 Wire boot flow: Boot -> Game with HUD as a parallel overlay scene
- [ ] 3.4 Pass delta-time (seconds) into a system update entry point in GameScene

## 4. Verification

- [ ] 4.1 `npm run dev` opens a portrait canvas that scales on resize
- [ ] 4.2 Type-check passes under strict mode

## 1. Project setup

- [x] 1.1 Initialize `package.json` and install `phaser`, `vite`, `typescript`
      (dev) - requires user approval to install deps
- [x] 1.2 Add `tsconfig.json` with `strict: true` and no implicit `any`
- [x] 1.3 Add `vite.config.ts` and `index.html` mounting the game canvas
- [x] 1.4 Add `npm run dev` / `npm run build` scripts

## 2. Coordinate model

- [x] 2.1 Create `src/config/grid.ts` with columns (9), rows (16), Base row, and
      Portal row constants
- [x] 2.2 Add tile <-> pixel conversion helpers driven by grid config
- [x] 2.3 Create `src/types.ts` for shared types (tile coords, target class)

## 3. Game shell

- [x] 3.1 Create `src/main.ts` bootstrapping `Phaser.Game` with portrait
      `Scale.FIT` configuration
- [x] 3.2 Add `BootScene`, `GameScene`, `HUDScene`, `GameOverScene` skeletons
- [x] 3.3 Wire boot flow: Boot -> Game with HUD as a parallel overlay scene
- [x] 3.4 Pass delta-time (seconds) into a system update entry point in GameScene

## 4. Verification

- [x] 4.1 `npm run dev` opens a portrait canvas that scales on resize
- [x] 4.2 Type-check passes under strict mode

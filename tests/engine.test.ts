import assert from "node:assert/strict";
import test from "node:test";

import { GameEngine, type Direction } from "../lib/game/engine.ts";
import { LEVELS, STARTING_LEVEL } from "../lib/game/levels.ts";

const settle = (engine: GameEngine) => {
  let guard = 0;
  while (engine.state.sliding && guard < 20) {
    engine.tick();
    guard += 1;
  }
};

test("parses the starting level into a ready game state", () => {
  const engine = new GameEngine(STARTING_LEVEL);

  assert.equal(engine.state.rows, 3);
  assert.equal(engine.state.cols, 7);
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.grid[1][2], "DIRT");
  assert.equal(engine.state.grid[1][4], "GOAL");
  assert.equal(engine.state.won, false);
  assert.equal(engine.state.dead, false);
});

test("moving off dirt converts the starting tile to ice", () => {
  const engine = new GameEngine(["#####", "#@. #", "#####"]);

  const result = engine.input("RIGHT");

  assert.equal(result, "MOVED");
  assert.equal(engine.state.grid[1][1], "ICE");
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test("sliding over old ice collapses it into void after leaving it", () => {
  const engine = new GameEngine(["#######", "#@  . #", "#######"]);

  assert.equal(engine.input("RIGHT"), "MOVED");
  engine.tick();
  engine.tick();

  assert.equal(engine.state.sliding, null);
  assert.deepEqual(engine.state.player, { x: 4, y: 1 });
  assert.equal(engine.state.grid[1][1], "ICE");
  assert.equal(engine.state.grid[1][2], "VOID");
  assert.equal(engine.state.grid[1][3], "VOID");
  assert.equal(engine.state.grid[1][4], "DIRT");
});

test("undo restores the previous stable board state", () => {
  const engine = new GameEngine(["#######", "#@  . #", "#######"]);

  engine.input("RIGHT");
  settle(engine);

  assert.equal(engine.undo(), true);
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.grid[1][1], "DIRT");
  assert.equal(engine.state.grid[1][2], "ICE");
  assert.equal(engine.state.grid[1][3], "ICE");
  assert.equal(engine.state.grid[1][4], "DIRT");
});

test("blocked moves leave the player and tile state unchanged", () => {
  const engine = new GameEngine(STARTING_LEVEL);

  const result = engine.input("UP");

  assert.equal(result, "BLOCKED");
  assert.equal(engine.state.grid[1][1], "DIRT");
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test("input returns inactive after the game has already ended", () => {
  const engine = new GameEngine(["#####", "#@$ #", "#####"]);

  engine.input("RIGHT");
  const result = engine.input("LEFT");

  assert.equal(result, "INACTIVE");
  assert.equal(engine.state.won, true);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
});

test("resetting with a new engine restores the original tile state", () => {
  const level = ["#####", "#@. #", "#####"];
  const engine = new GameEngine(level);

  engine.input("RIGHT");
  const resetEngine = new GameEngine(level);

  assert.equal(engine.state.grid[1][1], "ICE");
  assert.equal(resetEngine.state.grid[1][1], "DIRT");
  assert.deepEqual(resetEngine.state.player, { x: 1, y: 1 });
});

test("sliding onto the goal wins the level", () => {
  const engine = new GameEngine(["#####", "#@$ #", "#####"]);

  const result = engine.input("RIGHT");

  assert.equal(result, "MOVED");
  assert.equal(engine.state.won, true);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test("void blocks adjacent movement without spending dirt", () => {
  const engine = new GameEngine(["#####", "#@x$#", "#####"]);

  const result = engine.input("RIGHT");

  assert.equal(result, "BLOCKED");
  assert.equal(engine.state.grid[1][1], "DIRT");
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
});

test("sliding into void stops before it and creates new footing", () => {
  const engine = new GameEngine(["######", "#@ x$#", "######"]);

  assert.equal(engine.input("RIGHT"), "MOVED");
  engine.tick();

  assert.equal(engine.state.sliding, null);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.grid[1][1], "ICE");
  assert.equal(engine.state.grid[1][2], "DIRT");
  assert.equal(engine.state.grid[1][3], "VOID");
});

test("handmade levels are all solvable by their intended routes", () => {
  const routes: Direction[][] = [
    ["RIGHT", "RIGHT"],
    ["RIGHT", "RIGHT"],
    ["RIGHT", "DOWN", "RIGHT"],
    ["RIGHT", "DOWN", "RIGHT", "DOWN"],
    ["RIGHT", "DOWN", "LEFT", "DOWN", "RIGHT"],
    ["RIGHT", "DOWN", "RIGHT", "DOWN", "RIGHT"],
  ];

  routes.forEach((route, index) => {
    const engine = new GameEngine(LEVELS[index]);

    route.forEach((direction) => {
      assert.equal(engine.input(direction), "MOVED");
      settle(engine);
    });

    assert.equal(engine.state.won, true, `level ${index + 1} should be solved`);
  });
});

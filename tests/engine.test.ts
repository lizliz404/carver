import assert from 'node:assert/strict';
import test from 'node:test';

import { GameEngine } from '../lib/game/engine.ts';
import { STARTING_LEVEL } from '../lib/game/levels.ts';

test('parses the starting level into a ready game state', () => {
  const engine = new GameEngine(STARTING_LEVEL);

  assert.equal(engine.state.rows, 5);
  assert.equal(engine.state.cols, 9);
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.grid[1][4], 'VOID');
  assert.equal(engine.state.grid[3][5], 'GOAL');
  assert.equal(engine.state.won, false);
  assert.equal(engine.state.dead, false);
});

test('moving off dirt converts the starting tile to ice', () => {
  const engine = new GameEngine([
    '#####',
    '#@. #',
    '#####',
  ]);

  const result = engine.input('RIGHT');

  assert.equal(result, 'MOVED');
  assert.equal(engine.state.grid[1][1], 'ICE');
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test('blocked moves leave the player and tile state unchanged', () => {
  const engine = new GameEngine(STARTING_LEVEL);

  const result = engine.input('UP');

  assert.equal(result, 'BLOCKED');
  assert.equal(engine.state.grid[1][1], 'DIRT');
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test('input returns inactive after the game has already ended', () => {
  const engine = new GameEngine([
    '#####',
    '#@$ #',
    '#####',
  ]);

  engine.input('RIGHT');
  const result = engine.input('LEFT');

  assert.equal(result, 'INACTIVE');
  assert.equal(engine.state.won, true);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
});

test('resetting with a new engine restores the original tile state', () => {
  const level = [
    '#####',
    '#@. #',
    '#####',
  ];
  const engine = new GameEngine(level);

  engine.input('RIGHT');
  const resetEngine = new GameEngine(level);

  assert.equal(engine.state.grid[1][1], 'ICE');
  assert.equal(resetEngine.state.grid[1][1], 'DIRT');
  assert.deepEqual(resetEngine.state.player, { x: 1, y: 1 });
});

test('sliding onto the goal wins the level', () => {
  const engine = new GameEngine([
    '#####',
    '#@$ #',
    '#####',
  ]);

  const result = engine.input('RIGHT');

  assert.equal(result, 'MOVED');
  assert.equal(engine.state.won, true);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.sliding, null);
});

test('void blocks adjacent movement without spending dirt', () => {
  const engine = new GameEngine([
    '#####',
    '#@x$#',
    '#####',
  ]);

  const result = engine.input('RIGHT');

  assert.equal(result, 'BLOCKED');
  assert.equal(engine.state.grid[1][1], 'DIRT');
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
});

test('sliding into void stops before it and creates new footing', () => {
  const engine = new GameEngine([
    '######',
    '#@ x$#',
    '######',
  ]);

  assert.equal(engine.input('RIGHT'), 'MOVED');
  engine.tick();

  assert.equal(engine.state.sliding, null);
  assert.deepEqual(engine.state.player, { x: 2, y: 1 });
  assert.equal(engine.state.grid[1][1], 'ICE');
  assert.equal(engine.state.grid[1][2], 'DIRT');
  assert.equal(engine.state.grid[1][3], 'VOID');
});

test('starting level requires using void braces as infrastructure', () => {
  const engine = new GameEngine(STARTING_LEVEL);

  engine.input('RIGHT');
  engine.tick();
  engine.tick();
  assert.deepEqual(engine.state.player, { x: 3, y: 1 });
  assert.equal(engine.state.grid[1][3], 'DIRT');

  engine.input('DOWN');
  assert.deepEqual(engine.state.player, { x: 3, y: 2 });

  engine.input('RIGHT');
  engine.tick();
  engine.tick();
  assert.deepEqual(engine.state.player, { x: 5, y: 2 });
  assert.equal(engine.state.grid[2][5], 'DIRT');

  engine.input('DOWN');
  assert.equal(engine.state.won, true);
  assert.deepEqual(engine.state.player, { x: 5, y: 3 });
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { GameEngine } from '../lib/game/engine.ts';
import { STARTING_LEVEL } from '../lib/game/levels.ts';

test('parses the starting level into a ready game state', () => {
  const engine = new GameEngine(STARTING_LEVEL);

  assert.equal(engine.state.rows, 8);
  assert.equal(engine.state.cols, 6);
  assert.deepEqual(engine.state.player, { x: 1, y: 1 });
  assert.equal(engine.state.grid[6][4], 'GOAL');
  assert.equal(engine.state.won, false);
  assert.equal(engine.state.dead, false);
});

test('moving off dirt converts the starting tile to ice', () => {
  const engine = new GameEngine(STARTING_LEVEL);

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

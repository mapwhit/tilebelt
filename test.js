import { test } from 'node:test';
import * as tilebelt from './index.js';

const tile1 = [5, 10, 10];

test('tile to geojson', t => {
  const geojson = tilebelt.tileToGeoJSON(tile1);
  t.assert.ok(geojson, 'get geojson representation of tile');
  t.assert.equal(geojson.type, 'Polygon');
  t.assert.deepEqual(
    geojson.coordinates,
    [
      [
        [-178.2421875, 84.73838712095339],
        [-178.2421875, 84.7060489350415],
        [-177.890625, 84.7060489350415],
        [-177.890625, 84.73838712095339],
        [-178.2421875, 84.73838712095339]
      ]
    ],
    'Coordinates'
  );
});

test('tile to bbox', t => {
  const ext = tilebelt.tileToBBOX(tile1);
  t.assert.ok(ext, 'get geojson representation of tile');
  t.assert.deepEqual(ext, [-178.2421875, 84.7060489350415, -177.890625, 84.73838712095339], 'extent');
});

test('get parent', t => {
  const parent = tilebelt.getParent(tile1);
  t.assert.ok(parent);
  t.assert.equal(parent.length, 3);
  t.assert.equal(parent[0], 2);
  t.assert.equal(parent[1], 5);
  t.assert.equal(parent[2], 9);
});

test('get siblings', t => {
  const siblings = tilebelt.getSiblings(t);
  t.assert.ok(siblings);
  t.assert.equal(siblings.length, 4);
  t.assert.equal(siblings[0].length, 3);
});

test('has siblings', t => {
  const tiles1 = [
    [0, 0, 5],
    [0, 1, 5],
    [1, 1, 5],
    [1, 0, 5]
  ];
  const tiles2 = [
    [0, 0, 5],
    [0, 1, 5],
    [1, 1, 5]
  ];

  t.assert.equal(tilebelt.hasSiblings([0, 0, 5], tiles1), true);
  t.assert.equal(tilebelt.hasSiblings([0, 1, 5], tiles1), true);
  t.assert.equal(tilebelt.hasSiblings([0, 0, 5], tiles2), false);
  t.assert.equal(tilebelt.hasSiblings([0, 0, 5], tiles2), false);
});

test('has tile', t => {
  const tiles1 = [
    [0, 0, 5],
    [0, 1, 5],
    [1, 1, 5],
    [1, 0, 5]
  ];

  t.assert.equal(tilebelt.hasSiblings([2, 0, 5], tiles1), false);
  t.assert.equal(tilebelt.hasSiblings([0, 1, 5], tiles1), true);
});

test('get quadkey', t => {
  const key = tilebelt.tileToQuadkey([11, 3, 8]);
  t.assert.equal(key, '00001033');
});

test('quadkey to tile', t => {
  const quadkey = '00001033';
  const tile = tilebelt.quadkeyToTile(quadkey);
  t.assert.equal(tile.length, 3);
});

test('point to tile', t => {
  const tile = tilebelt.pointToTile(0, 0, 10);
  t.assert.equal(tile.length, 3);
  t.assert.equal(tile[2], 10);
});

test('point to tile verified', t => {
  const tile = tilebelt.pointToTile(-77.03239381313323, 38.91326516559442, 10);
  t.assert.equal(tile.length, 3);
  t.assert.equal(tile[0], 292);
  t.assert.equal(tile[1], 391);
  t.assert.equal(tile[2], 10);
  t.assert.equal(tilebelt.tileToQuadkey(tile), '0320100322');
});

test('point and tile back and forth', t => {
  const tile = tilebelt.pointToTile(10, 10, 10);
  t.assert.equal(tile.toString(), tilebelt.quadkeyToTile(tilebelt.tileToQuadkey(tile)).toString());
});

test('check key 03', t => {
  const quadkey = '03';
  t.assert.equal(tilebelt.quadkeyToTile(quadkey).toString(), [1, 1, 2].toString());
});

test('bbox to tile -- big', t => {
  const bbox = [-84.72656249999999, 11.178401873711785, -5.625, 61.60639637138628];
  const tile = tilebelt.bboxToTile(bbox);
  t.assert.ok(tile, 'convert bbox to tile');
  t.assert.equal(tile[0], 1);
  t.assert.equal(tile[1], 1);
  t.assert.equal(tile[2], 2);
});

test('bbox to tile -- no area', t => {
  const bbox = [-84, 11, -84, 11];
  const tile = tilebelt.bboxToTile(bbox);
  t.assert.ok(tile, 'convert bbox to tile');
  t.assert.deepEqual(tile, [71582788, 125964677, 28]);
});

test('bbox to tile -- dc', t => {
  const bbox = [-77.04615354537964, 38.899967510782346, -77.03664779663086, 38.90728142481329];
  const tile = tilebelt.bboxToTile(bbox);
  t.assert.ok(tile, 'convert bbox to tile');
  t.assert.equal(tile[0], 9371);
  t.assert.equal(tile[1], 12534);
  t.assert.equal(tile[2], 15);
});

test('bbox to tile -- crossing 0 lat/lng', t => {
  const bbox = [-10, -10, 10, 10];
  const tile = tilebelt.bboxToTile(bbox);
  t.assert.ok(tile, 'convert bbox to tile');
  t.assert.equal(tile[0], 0);
  t.assert.equal(tile[1], 0);
  t.assert.equal(tile[2], 0);
});

test('tile to bbox -- verify bbox order', t => {
  let tile = [13, 11, 5];
  let bbox = tilebelt.tileToBBOX(tile);
  t.assert.equal(bbox[0] < bbox[2], true, 'east is less than west');
  t.assert.equal(bbox[1] < bbox[3], true, 'south is less than north');

  tile = [20, 11, 5];
  bbox = tilebelt.tileToBBOX(tile);
  t.assert.equal(bbox[0] < bbox[2], true, 'east is less than west');
  t.assert.equal(bbox[1] < bbox[3], true, 'south is less than north');

  tile = [143, 121, 8];
  bbox = tilebelt.tileToBBOX(tile);
  t.assert.equal(bbox[0] < bbox[2], true, 'east is less than west');
  t.assert.equal(bbox[1] < bbox[3], true, 'south is less than north');

  tile = [999, 1000, 17];
  bbox = tilebelt.tileToBBOX(tile);
  t.assert.equal(bbox[0] < bbox[2], true, 'east is less than west');
  t.assert.equal(bbox[1] < bbox[3], true, 'south is less than north');
});

test('pointToTileFraction', t => {
  const tile = tilebelt.pointToTileFraction(-95.93965530395508, 41.26000108568697, 9);
  t.assert.ok(tile, 'convert point to tile fraction');
  t.assert.equal(tile[0], 119.552490234375);
  t.assert.equal(tile[1], 191.47119140625);
  t.assert.equal(tile[2], 9);
});

test('pointToTile -- cross meridian', t => {
  // X axis
  // https://github.com/mapbox/tile-cover/issues/75
  // https://github.com/mapbox/tilebelt/pull/32
  t.assert.deepEqual(tilebelt.pointToTile(-180, 0, 0), [0, 0, 0], '[-180, 0] zoom 0');
  t.assert.deepEqual(tilebelt.pointToTile(-180, 85, 2), [0, 0, 2], '[-180, 85] zoom 2');
  t.assert.deepEqual(tilebelt.pointToTile(180, 85, 2), [0, 0, 2], '[+180, 85] zoom 2');
  t.assert.deepEqual(tilebelt.pointToTile(-185, 85, 2), [3, 0, 2], '[-185, 85] zoom 2');
  t.assert.deepEqual(tilebelt.pointToTile(185, 85, 2), [0, 0, 2], '[+185, 85] zoom 2');

  // Y axis
  // Does not wrap Tile Y
  t.assert.deepEqual(tilebelt.pointToTile(-175, -95, 2), [0, 3, 2], '[-175, -95] zoom 2');
  t.assert.deepEqual(tilebelt.pointToTile(-175, 95, 2), [0, 0, 2], '[-175, +95] zoom 2');
  t.assert.deepEqual(tilebelt.pointToTile(-175, 95, 2), [0, 0, 2], '[-175, +95] zoom 2');

  // BBox
  // https://github.com/mapbox/tilebelt/issues/12
  t.assert.deepEqual(tilebelt.bboxToTile([-0.000001, -85, 1000000, 85]), [0, 0, 0]);
});

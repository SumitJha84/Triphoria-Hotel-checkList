import assert from "node:assert/strict";
import test from "node:test";
import { mockHotels } from "../src/suppliers/mockData";

test("Delhi suppliers contain meaningful overlapping and exclusive inventory", () => {
  const delhi = mockHotels.delhi;
  assert.ok(delhi.a.length >= 5);
  assert.ok(delhi.b.length >= 5);

  const aNames = new Set(delhi.a.map((hotel) => hotel.name));
  const bNames = new Set(delhi.b.map((hotel) => hotel.name));
  const overlap = [...aNames].filter((name) => bNames.has(name));
  assert.ok(overlap.length >= 3);
  assert.ok([...aNames].some((name) => !bNames.has(name)));
  assert.ok([...bNames].some((name) => !aNames.has(name)));
});

test("Mumbai suppliers contain overlapping and exclusive inventory", () => {
  const mumbai = mockHotels.mumbai;
  assert.ok(mumbai.a.length >= 5);
  assert.ok(mumbai.b.length >= 5);

  const aNames = new Set(mumbai.a.map((hotel) => hotel.name));
  const bNames = new Set(mumbai.b.map((hotel) => hotel.name));
  assert.ok([...aNames].some((name) => bNames.has(name)));
  assert.ok([...aNames].some((name) => !bNames.has(name)));
  assert.ok([...bNames].some((name) => !aNames.has(name)));
});

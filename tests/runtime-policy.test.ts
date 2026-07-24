import assert from "node:assert/strict";
import test from "node:test";
import {
  adminLeadQuerySchema,
  adminPropertyQuerySchema,
} from "../src/lib/admin-query";
import { getPublicSiteUrl } from "../src/lib/runtime-config";
import { assertPublicDataAvailable } from "../src/lib/data-mode";
import { parseMapCoordinates } from "../src/lib/maps";

function withEnvironment(
  values: Record<string, string | undefined>,
  run: () => void,
) {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("production site URL must be HTTPS and non-local", () => {
  withEnvironment(
    { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" },
    () => assert.throws(getPublicSiteUrl, /HTTPS/),
  );
  withEnvironment(
    {
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://thanhhoaland.vn/",
    },
    () => assert.equal(getPublicSiteUrl(), "https://thanhhoaland.vn"),
  );
});

test("admin query schemas reject non-finite and invalid values", () => {
  assert.equal(
    adminPropertyQuerySchema.safeParse({ page: "Infinity" }).success,
    false,
  );
  assert.equal(
    adminPropertyQuerySchema.safeParse({ status: "DELETED" }).success,
    false,
  );
  assert.equal(
    adminLeadQuerySchema.safeParse({ page: "2", status: "NEW" }).success,
    true,
  );
});

test("demo data is disabled in production", () => {
  assert.doesNotThrow(() => assertPublicDataAvailable("development", false));
  assert.throws(
    () => assertPublicDataAvailable("production", false),
    /DATABASE_URL/,
  );
});

test("map coordinates accept zero and reject invalid stored values", () => {
  assert.deepEqual(parseMapCoordinates("0", "0"), [0, 0]);
  assert.deepEqual(parseMapCoordinates("19.8", "105.7"), [19.8, 105.7]);
  assert.equal(parseMapCoordinates("", "105.7"), null);
  assert.equal(parseMapCoordinates("91", "105.7"), null);
  assert.equal(parseMapCoordinates("invalid", "105.7"), null);
});

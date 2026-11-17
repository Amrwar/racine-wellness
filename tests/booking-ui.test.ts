// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingReference, filterServices, studioPhoto, thumbnailFor } from "../src/lib/booking-ui.ts";
import { defaultPricing, formatPrice } from "../src/lib/pricing-data.ts";

const services = defaultPricing.services;

test("an empty search shows every treatment", () => {
  assert.equal(filterServices(services, "   ", "en").length, services.length);
});

test("search matches names and descriptions, ignoring case and accents", () => {
  assert.deepEqual(filterServices(services, "SWEDISH", "en").map((s) => s.id), ["swedish"]);
  assert.deepEqual(filterServices(services, "deep tissue", "en").map((s) => s.id), ["therapeutic"]);
  assert.deepEqual(filterServices(services, "therapeutique", "fr").map((s) => s.id), ["therapeutic"]);
  assert.deepEqual(filterServices(services, "suedois", "fr").map((s) => s.id), ["swedish"]);
});

test("search with no match returns nothing", () => {
  assert.equal(filterServices(services, "hot stones", "en").length, 0);
});

test("default prices match the published rates", () => {
  const rates = Object.fromEntries(services.map((s) => [s.id, s.rates.map((r) => `${r.minutes}:${r.price}`).join(" ")]));
  assert.equal(rates.swedish, "60:100 90:135 120:170");
  assert.equal(rates.therapeutic, "60:135 90:180 120:230");
});

test("prices are formatted per language", () => {
  assert.equal(formatPrice(135, "en"), "$135");
  assert.equal(formatPrice(135, "fr"), "135 $");
});

test("booking references are padded and never negative", () => {
  assert.equal(bookingReference(42), "HZ-00042");
  assert.equal(bookingReference(123456), "HZ-123456");
  assert.equal(bookingReference(-3), "HZ-00000");
});

test("each treatment has a thumbnail, unknown ones fall back to the studio photo", () => {
  assert.equal(thumbnailFor("swedish"), "/images/blog/swedish.webp");
  assert.equal(thumbnailFor("something-new"), studioPhoto);
});

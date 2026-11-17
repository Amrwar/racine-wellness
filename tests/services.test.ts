import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryOf, filterServices, isBookable, serviceSlugs, servicePhoto } from "../src/lib/services.ts";
import { defaultPricing, priceSummary, rateLabel } from "../src/lib/pricing-data.ts";
import type { ServiceItem } from "../src/lib/content-data.ts";

const t = (en: string, fr = en) => ({ en, fr });
const items: Pick<ServiceItem, "icon" | "bookingId" | "photo" | "title" | "text">[] = [
  { icon: "hands", bookingId: "swedish", photo: null, title: t("Swedish Relaxation Massage", "Massage suédois de détente"), text: t("A flowing, relaxing massage.", "Un massage fluide.") },
  { icon: "hands", bookingId: "therapeutic", photo: null, title: t("Sports / Therapeutic Massage"), text: t("Deep tissue work and myofascial release.") },
  { icon: "heart", bookingId: "active-aging", photo: null, title: t("Active Aging"), text: t("Keep balance, strength and independence.") },
  { icon: "strength", bookingId: "fitness-coaching", photo: null, title: t("Fitness and Healthy Lifestyle Coaching"), text: t("Coaching for strength and healthy habits.") },
  { icon: "posture", bookingId: null, photo: null, title: t("Posture Correction"), text: t("Exercises for the back and neck.") },
];
const labels = { massage: "Massage therapy", movement: "Movement & mobility", strength: "Fitness & lifestyle", aging: "Healthy aging", youth: "Youth fitness" };
const names = (l: { title: { en: string } }[]) => l.map((s) => s.title.en);
const prices = { duration: "{n} min", perSession: "per session", perSessionTitle: "Per session", from: "From {price}" };

test("categories from the service icons", () => {
  assert.deepEqual(items.map((s) => categoryOf(s)), ["massage", "massage", "aging", "strength", "movement"]);
});

test("services linked to a priced treatment can be booked; others are by request", () => {
  assert.deepEqual(items.filter(isBookable).length, 4);
  assert.equal(isBookable(items[4]), false);
});

test("web addresses come from the English name and never collide", () => {
  assert.deepEqual(serviceSlugs(items.slice(0, 4)), ["swedish-relaxation-massage", "sports-therapeutic-massage", "active-aging", "fitness-and-healthy-lifestyle-coaching"]);
  assert.deepEqual(serviceSlugs([{ title: t("Mobility") }, { title: t("Mobility") }, { title: t("") }]), ["mobility", "mobility-2", "service-3"]);
});

test("search and category filters combine", () => {
  assert.deepEqual(names(filterServices(items, "", "massage", "en", labels)), ["Swedish Relaxation Massage", "Sports / Therapeutic Massage"]);
  assert.deepEqual(names(filterServices(items, "deep tissue", "all", "en", labels)), ["Sports / Therapeutic Massage"]);
  assert.deepEqual(names(filterServices(items, "suedois", "all", "fr", labels)), ["Swedish Relaxation Massage"]);
  assert.deepEqual(names(filterServices(items, "fitness", "all", "en", labels)), ["Fitness and Healthy Lifestyle Coaching"]);
  assert.equal(filterServices(items, "massage", "aging", "en", labels).length, 0);
});

test("every card has a photo, never an icon", () => {
  assert.equal(servicePhoto({ photo: null }), "/images/hero-massage-square.webp");
  assert.equal(servicePhoto({ photo: { src: "/images/blog/swedish.webp", width: 1, height: 1 } }), "/images/blog/swedish.webp");
});

test("the four priced treatments and their prices", () => {
  const byId = Object.fromEntries(defaultPricing.services.map((s) => [s.id, s]));
  assert.deepEqual(Object.keys(byId), ["swedish", "therapeutic", "active-aging", "fitness-coaching"]);
  assert.deepEqual(byId.therapeutic.rates.map((r) => r.price), [130, 180, 230]);
  assert.equal(priceSummary(byId["active-aging"], "en", prices), "$65 per session");
  assert.equal(priceSummary(byId["fitness-coaching"], "fr", { ...prices, perSession: "par séance" }), "80 $ par séance");
  assert.equal(priceSummary(byId.swedish, "en", prices), "From $100");
  assert.equal(rateLabel(byId["active-aging"], byId["active-aging"].rates[0], prices), "Per session");
  assert.equal(rateLabel(byId.swedish, byId.swedish.rates[1], prices), "90 min");
});

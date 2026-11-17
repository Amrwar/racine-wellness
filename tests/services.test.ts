import { test } from "node:test";
import assert from "node:assert/strict";
import { categoryOf, filterServices, isBookable, serviceSlugs } from "../src/lib/services.ts";

const t = (en: string, fr = en) => ({ en, fr });
const items = [
  { icon: "hands", title: t("Massage Therapy", "Massothérapie"), text: t("Therapeutic massage to relieve pain and tension.", "Massage thérapeutique.") },
  { icon: "posture", title: t("Posture Correction"), text: t("Exercises to ease back and neck strain.") },
  { icon: "mobility", title: t("Mobility"), text: t("Restore range of motion in stiff joints.") },
  { icon: "strength", title: t("Strength"), text: t("Progressive, safe strength training.") },
  { icon: "heart", title: t("Active Aging"), text: t("Keep balance, strength and independence.") },
  { icon: "youth", title: t("Youth Fitness"), text: t("Good movement habits for young athletes.") },
] as const;
const labels = { massage: "Massage therapy", movement: "Movement & mobility", strength: "Strength & fitness", aging: "Healthy aging", youth: "Youth fitness" };
const names = (l: readonly { title: { en: string } }[]) => l.map((s) => s.title.en);

test("every built-in service has a category", () => {
  assert.deepEqual(items.map((s) => categoryOf(s)), ["massage", "movement", "movement", "strength", "aging", "youth"]);
});

test("only massage is bookable online", () => {
  assert.deepEqual(items.filter(isBookable).map((s) => s.title.en), ["Massage Therapy"]);
});

test("web addresses come from the English name and never collide", () => {
  assert.deepEqual(serviceSlugs([...items]), ["massage-therapy", "posture-correction", "mobility", "strength", "active-aging", "youth-fitness"]);
  assert.deepEqual(serviceSlugs([{ title: t("Mobility") }, { title: t("Mobility") }, { title: t("") }]), ["mobility", "mobility-2", "service-3"]);
});

test("category filter", () => {
  assert.deepEqual(names(filterServices([...items], "", "movement", "en", labels)), ["Posture Correction", "Mobility"]);
  assert.equal(filterServices([...items], "", "all", "en", labels).length, 6);
});

test("search by name, description or category label, accents ignored", () => {
  assert.deepEqual(names(filterServices([...items], "neck", "all", "en", labels)), ["Posture Correction"]);
  assert.deepEqual(names(filterServices([...items], "healthy aging", "all", "en", labels)), ["Active Aging"]);
  assert.deepEqual(names(filterServices([...items], "massotherapie", "all", "fr", labels)), ["Massage Therapy"]);
});

test("search and category combine; no match gives nothing", () => {
  assert.deepEqual(names(filterServices([...items], "strength", "aging", "en", labels)), ["Active Aging"]);
  assert.equal(filterServices([...items], "yoga", "all", "en", labels).length, 0);
});

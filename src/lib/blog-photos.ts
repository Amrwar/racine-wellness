import type { Photo } from "./blog";

/** Photos that ship with the site, in public/images/blog. Also offered in the admin photo picker. */
const img = (name: string, width: number, height: number): Photo => ({
  src: `/images/blog/${name}.webp`,
  width,
  height,
});

export const P = {
  deepTissue: img("deep-tissue", 1600, 1600),
  swedish: img("swedish", 1400, 1400),
  upperBack: img("upper-back", 1600, 1600),
  sports: img("sports-massage", 1600, 1600),
  anatomySketch: img("anatomy-sketch", 1060, 1060),
  anatomyStudy: img("anatomy-study", 816, 1200),
  anatomySide: img("anatomy-side", 578, 981),
  anatomyBack: img("anatomy-back", 471, 800),
  anatomyFullBody: img("anatomy-full-body", 1100, 1576),
  postureChain: img("posture-chain", 898, 439),
  footImbalance: img("foot-imbalance", 816, 1200),
  shoulderRom: img("shoulder-rom", 816, 1200),
  studioTable: img("studio-table", 1600, 1600),
  studioTableSide: img("studio-table-side", 1400, 1400),
  ziadStudio: img("ziad-studio", 1400, 1086),
};

/** Every other site photo the editor can pick from. */
export const libraryPhotos: Photo[] = [
  ...Object.values(P),
  { src: "/images/portrait.jpg", width: 728, height: 1030 },
  { src: "/images/massage.jpg", width: 1400, height: 1400 },
];

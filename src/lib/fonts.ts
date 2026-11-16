import { Inter, Lora, Montserrat, Nunito, Playfair_Display, Poppins } from "next/font/google";

/*
 * Poppins is the original font. The others can be chosen in Admin → Design; they aren't preloaded,
 * so a browser downloads one only when it is actually used. (next/font needs literal options.)
 */
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", preload: false });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap", preload: false });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], display: "swap", preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: "swap", preload: false });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap", preload: false });

/** Class names that define every --font-* variable; put them on <html>. */
export const fontVariables = [poppins, inter, montserrat, nunito, lora, playfair].map((f) => f.variable).join(" ");

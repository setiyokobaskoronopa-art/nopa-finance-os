export interface PriceTier {
  box: number;
  hpp: number;
  hargaJual: number;
}

export const PRODUCT_PRICING: Record<string, PriceTier[]> = {
  DVN: [
    { box: 1, hpp: 511000, hargaJual: 999000 },
    { box: 2, hpp: 1022000, hargaJual: 1998000 },
  ],
  SGLOW: [
    { box: 1, hpp: 487000, hargaJual: 990000 },
    { box: 2, hpp: 974000, hargaJual: 1805000 },
    { box: 3, hpp: 1461000, hargaJual: 2614500 },
    { box: 4, hpp: 1948000, hargaJual: 3427000 },
    { box: 5, hpp: 2435000, hargaJual: 4239000 },
    { box: 6, hpp: 2922000, hargaJual: 5050000 },
  ],
  "BIO-LINGZHI PRO": [
    { box: 1, hpp: 289000, hargaJual: 499000 },
    { box: 2, hpp: 578000, hargaJual: 939000 },
    { box: 3, hpp: 867000, hargaJual: 1379000 },
    { box: 4, hpp: 1156000, hargaJual: 1819000 },
    { box: 5, hpp: 1445000, hargaJual: 2259000 },
  ],
  EROJAN: [
    { box: 1, hpp: 403800, hargaJual: 769000 },
    { box: 2, hpp: 807600, hargaJual: 1451000 },
    { box: 3, hpp: 1211400, hargaJual: 2133000 },
    { box: 4, hpp: 1615200, hargaJual: 2815000 },
    { box: 5, hpp: 2019000, hargaJual: 3497000 },
    { box: 6, hpp: 2422800, hargaJual: 4179000 },
  ],
  NOVIA: [
    { box: 1, hpp: 496000, hargaJual: 990000 },
    { box: 2, hpp: 992000, hargaJual: 1805000 },
    { box: 3, hpp: 1488000, hargaJual: 2614500 },
    { box: 4, hpp: 1984000, hargaJual: 3427000 },
    { box: 5, hpp: 2480000, hargaJual: 4239000 },
    { box: 6, hpp: 2976000, hargaJual: 5050000 },
  ],
  "COFFIY (1 Sachet)": [
    { box: 1, hpp: 50000, hargaJual: 99000 },
    { box: 2, hpp: 100000, hargaJual: 186800 },
    { box: 3, hpp: 150000, hargaJual: 274600 },
    { box: 4, hpp: 200000, hargaJual: 362400 },
    { box: 5, hpp: 250000, hargaJual: 450200 },
    { box: 6, hpp: 300000, hargaJual: 538000 },
  ],
  "COFFIY (5 Sachet)": [
    { box: 1, hpp: 202500, hargaJual: 359000 },
    { box: 2, hpp: 405000, hargaJual: 677385 },
    { box: 3, hpp: 607500, hargaJual: 995770 },
    { box: 4, hpp: 810000, hargaJual: 1314155 },
    { box: 5, hpp: 1012500, hargaJual: 1632540 },
    { box: 6, hpp: 1215000, hargaJual: 1950925 },
  ],
  "COFFIY (10 Sachet / 1 Box)": [
    { box: 1, hpp: 384000, hargaJual: 659000 },
    { box: 2, hpp: 768000, hargaJual: 1245000 },
    { box: 3, hpp: 1152000, hargaJual: 1830000 },
    { box: 4, hpp: 1536000, hargaJual: 2415000 },
    { box: 5, hpp: 1920000, hargaJual: 3000000 },
    { box: 6, hpp: 2304000, hargaJual: 3585000 },
  ],
};

export const PRODUCT_NAMES = Object.keys(PRODUCT_PRICING);

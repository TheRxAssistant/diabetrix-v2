/**
 * Pharmacy data with logos for matching
 */

export interface Pharmacy {
  name: string;
  logo: string;
}

export const pharmacies: Pharmacy[] = [
  {
    name: "CVS Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/cvs-logo.svg",
  },
  {
    name: "Walgreens",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/walgreens-logo.svg",
  },
  {
    name: "Rite Aid",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/riteaid-logo.svg",
  },
  {
    name: "Costco Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/costco-logo.svg",
  },
  {
    name: "Kroger Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/kroger-logo.svg",
  },
  {
    name: "Walmart Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/walmart-logo.svg",
  },
  {
    name: "Safeway Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/safeway-logo.svg",
  },
  {
    name: "Target Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/target-logo.svg",
  },
  {
    name: "Publix Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/publix-logo.svg",
  },
  {
    name: "H-E-B Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/heb-logo.svg",
  },
  {
    name: "Express Scripts",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/express-scripts-logo.svg",
  },
  {
    name: "OptumRx",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/optum-logo.svg",
  },
];

// Featured pharmacies constrained to provided brand assets
export const featuredPharmacies: Pharmacy[] = [
  {
    name: "CVS Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/cvs-logo.jpeg",
  },
  {
    name: "Walgreens",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/walgreens-logo.png",
  },
  {
    name: "Rite Aid",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/rite-aid-logo.png",
  },
  {
    name: "Walmart Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/walmart.png",
  },
  {
    name: "Costco Pharmacy",
    logo: "https://rx-logos.s3.us-west-2.amazonaws.com/costco.jpeg",
  },
];

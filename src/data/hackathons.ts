import aiImg from "@/assets/hack-ai.jpg";
import web3Img from "@/assets/hack-web3.jpg";
import cloudImg from "@/assets/hack-cloud.jpg";
import cyberImg from "@/assets/hack-cyber.jpg";
import dataImg from "@/assets/hack-data.jpg";
import studentImg from "@/assets/hack-student.jpg";

export type Format = "Online" | "In-Person" | "Hybrid";
export type Audience = "Student" | "Professional" | "Open";
export type Domain = "AI" | "Web3" | "Cloud" | "Cybersecurity" | "Data Science" | "GenAI" | "FinTech" | "Climate";

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  organizerLogo: string;
  banner: string;
  startDate: string;
  endDate: string;
  location: string;
  region: "North America" | "Europe" | "Asia" | "Africa" | "South America" | "Oceania";
  coords: { lat: number; lng: number };
  format: Format;
  domain: Domain[];
  audience: Audience;
  prizePool: number;
  participants: number;
  status: "Open" | "Closing Soon" | "Closed";
  featured?: boolean;
  trending?: boolean;
  tag?: "Trending" | "New" | "Enterprise" | "Student";
}

const banners = [aiImg, web3Img, cloudImg, cyberImg, dataImg, studentImg];

export const hackathons: Hackathon[] = [
  {
    id: "1", title: "GlobalAI Summit Hack 2026", organizer: "OpenForge", organizerLogo: "OF",
    banner: aiImg, startDate: "2026-07-12", endDate: "2026-07-14",
    location: "San Francisco, USA", region: "North America", coords: { lat: 37.77, lng: -122.42 },
    format: "Hybrid", domain: ["AI", "GenAI"], audience: "Open", prizePool: 250000, participants: 4820,
    status: "Open", featured: true, trending: true, tag: "Trending",
  },
  {
    id: "2", title: "ETHWave Berlin", organizer: "ChainLabs", organizerLogo: "CL",
    banner: web3Img, startDate: "2026-08-02", endDate: "2026-08-04",
    location: "Berlin, Germany", region: "Europe", coords: { lat: 52.52, lng: 13.4 },
    format: "In-Person", domain: ["Web3"], audience: "Open", prizePool: 180000, participants: 2400,
    status: "Open", trending: true, tag: "Trending",
  },
  {
    id: "3", title: "CloudNative Asia Build", organizer: "CNCF", organizerLogo: "CN",
    banner: cloudImg, startDate: "2026-09-20", endDate: "2026-09-22",
    location: "Singapore", region: "Asia", coords: { lat: 1.35, lng: 103.81 },
    format: "Hybrid", domain: ["Cloud"], audience: "Professional", prizePool: 120000, participants: 3100,
    status: "Open", tag: "Enterprise",
  },
  {
    id: "4", title: "DEF Shield Cyber Jam", organizer: "Sentinel", organizerLogo: "SN",
    banner: cyberImg, startDate: "2026-06-28", endDate: "2026-06-30",
    location: "London, UK", region: "Europe", coords: { lat: 51.5, lng: -0.12 },
    format: "Online", domain: ["Cybersecurity"], audience: "Open", prizePool: 90000, participants: 1820,
    status: "Closing Soon",
  },
  {
    id: "5", title: "Kaggle DataQuest Global", organizer: "Kaggle", organizerLogo: "KG",
    banner: dataImg, startDate: "2026-07-25", endDate: "2026-08-08",
    location: "Online Worldwide", region: "North America", coords: { lat: 40.71, lng: -74.0 },
    format: "Online", domain: ["Data Science", "AI"], audience: "Professional", prizePool: 300000, participants: 8900,
    status: "Open", featured: true, tag: "New",
  },
  {
    id: "6", title: "UniHack Tokyo", organizer: "TodaiTech", organizerLogo: "TT",
    banner: studentImg, startDate: "2026-10-10", endDate: "2026-10-12",
    location: "Tokyo, Japan", region: "Asia", coords: { lat: 35.68, lng: 139.69 },
    format: "In-Person", domain: ["AI", "Web3"], audience: "Student", prizePool: 50000, participants: 1500,
    status: "Open", tag: "Student",
  },
  {
    id: "7", title: "GenAI Builders Brazil", organizer: "LatamAI", organizerLogo: "LA",
    banner: aiImg, startDate: "2026-08-15", endDate: "2026-08-17",
    location: "São Paulo, Brazil", region: "South America", coords: { lat: -23.55, lng: -46.63 },
    format: "Hybrid", domain: ["GenAI", "AI"], audience: "Open", prizePool: 75000, participants: 2200,
    status: "Open", tag: "Trending",
  },
  {
    id: "8", title: "AfricaFintech Hack", organizer: "FlutterDev", organizerLogo: "FD",
    banner: dataImg, startDate: "2026-09-05", endDate: "2026-09-07",
    location: "Lagos, Nigeria", region: "Africa", coords: { lat: 6.52, lng: 3.38 },
    format: "Hybrid", domain: ["FinTech", "Cloud"], audience: "Open", prizePool: 60000, participants: 1800,
    status: "Open", tag: "New",
  },
  {
    id: "9", title: "Sydney Climate Code", organizer: "ClimateX", organizerLogo: "CX",
    banner: web3Img, startDate: "2026-11-01", endDate: "2026-11-03",
    location: "Sydney, Australia", region: "Oceania", coords: { lat: -33.86, lng: 151.21 },
    format: "In-Person", domain: ["Climate", "Data Science"], audience: "Open", prizePool: 85000, participants: 1100,
    status: "Open", tag: "New",
  },
  {
    id: "10", title: "Enterprise GenAI Challenge", organizer: "MicroNova", organizerLogo: "MN",
    banner: cloudImg, startDate: "2026-07-18", endDate: "2026-07-20",
    location: "Seattle, USA", region: "North America", coords: { lat: 47.6, lng: -122.33 },
    format: "Hybrid", domain: ["AI", "Cloud", "GenAI"], audience: "Professional", prizePool: 500000, participants: 5600,
    status: "Open", featured: true, tag: "Enterprise",
  },
  {
    id: "11", title: "Paris Quantum Sprint", organizer: "QuantumFR", organizerLogo: "QF",
    banner: cyberImg, startDate: "2026-09-28", endDate: "2026-09-30",
    location: "Paris, France", region: "Europe", coords: { lat: 48.85, lng: 2.35 },
    format: "In-Person", domain: ["AI", "Cybersecurity"], audience: "Professional", prizePool: 140000, participants: 900,
    status: "Open",
  },
  {
    id: "12", title: "IIT Bombay HackFest", organizer: "IITB", organizerLogo: "IB",
    banner: studentImg, startDate: "2026-08-22", endDate: "2026-08-24",
    location: "Mumbai, India", region: "Asia", coords: { lat: 19.07, lng: 72.87 },
    format: "Hybrid", domain: ["AI", "Web3", "Data Science"], audience: "Student", prizePool: 70000, participants: 4200,
    status: "Open", tag: "Student",
  },
];

export const featuredHero = hackathons.find(h => h.featured)!;

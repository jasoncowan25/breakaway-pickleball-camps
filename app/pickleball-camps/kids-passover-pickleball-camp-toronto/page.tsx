import { Metadata } from "next"
import KidsPassoverCampClient from "./kids-camp-client"

export const metadata: Metadata = {
  title: "Kids Passover Pickleball Camp Toronto | Ages 8-16 | Breakaway",
  description:
    "Breakaway Kids Passover Pickleball Camp at The Jar PickleBall Club in Toronto, April 7-10 2026. Ages 8-16, no experience required. $118/day.",
  openGraph: {
    title: "Kids Passover Pickleball Camp | April 7-10, Toronto",
    description:
      "4-day youth pickleball camp at The Jar PickleBall Club. Ages 8-16, no experience required. Skills training, tournaments, prizes & lunch included. $118/day.",
    images: [
      {
        url: "/kids-pickleball-training.jpg",
        width: 1200,
        height: 630,
        alt: "Kids playing pickleball at Breakaway Camp",
      },
    ],
  },
}

export default function KidsPassoverCampPage() {
  return <KidsPassoverCampClient />
}

import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Court Rules and Player Safety", description: "Hideout Pickleball court etiquette and player safety guidance." };

export default function CourtRulesPage() {
  return <PolicyPage
    eyebrow="Play well"
    title="Court rules and player safety"
    intro="A clear court keeps the rally enjoyable. These rules reflect the operating guidance currently shown in the booking flow and should be posted at the venue as well as online."
    reviewNote="The owner should confirm venue-specific emergency procedures, first-aid arrangements, age requirements, footwear requirements, and any separate waiver reviewed by counsel."
    sections={[
      { title: "Before you play", items: ["Arrive on time with the booking details available.", "Wear suitable non-marking court footwear and comfortable sports clothing.", "Bring only safe, approved equipment and keep personal items clear of play areas.", "Warm up and tell staff about any access or safety concern before starting."] },
      { title: "On court", items: ["Respect other players, staff, and scheduled court time.", "Do not double-book or enter a court assigned to another reservation.", "Keep play controlled and stop when the court, equipment, or another person is unsafe.", "Do not use abusive, threatening, discriminatory, or disruptive language.", "Leave the court and shared areas clean and return venue equipment as directed."] },
      { title: "Incidents and emergencies", paragraphs: ["Stop play and notify venue staff immediately about an injury, collision, damaged equipment, unsafe condition, or conflict. For a serious emergency, contact local emergency services first, then notify the venue. The owner should publish the venue address and emergency contact instructions before launch."] },
      { title: "Acknowledgment and waiver", paragraphs: ["Reading these rules is not a liability waiver. If Hideout requires a release or assumption-of-risk form, it should be presented as a separate, explicit document and reviewed by qualified Philippine counsel before use."] },
    ]}
  />;
}

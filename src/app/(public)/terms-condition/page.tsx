import type { Metadata } from "next";
import LegalDoc from "@/components/site/LegalDoc";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "The terms that apply when you book a trip with Nepal Travel.",
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms & conditions"
      updated="1 November 2026"
      intro="These terms apply to every booking made with Nepal Travel. Please read them before you pay a deposit — they explain what you can expect from us and what we need from you."
      sections={[
        {
          heading: "Bookings and confirmation",
          body: [
            "A booking is created when you complete checkout and receive a reference beginning with NT-. Your place on a departure is only guaranteed once payment has been received and our team has confirmed the booking by email.",
            "The lead traveller must be at least 18 years old and is responsible for the accuracy of all names, dates and passport details supplied for the group.",
          ],
        },
        {
          heading: "Prices and payments",
          body: [
            "All prices are quoted in Nepalese Rupees (NPR) per person unless stated otherwise. Prices cover the inclusions listed on each trip page and exclude international flights, visa fees, insurance and personal spending.",
            "We accept eSewa, Khalti, cards and bank transfer. Where a deposit option is offered, the balance is due no later than 15 days before departure. Failure to pay the balance may result in cancellation.",
            "Prices may change in response to permit fees, taxes or currency movements before your booking is confirmed. Once confirmed, the price of your trip is fixed.",
          ],
        },
        {
          heading: "Cancellations and changes",
          body: [
            "You may cancel free of charge up to 30 days before departure and receive a full refund of amounts paid, less any unrecoverable permit or ticketing costs.",
            "Cancellations 29–15 days before departure incur a charge of 50% of the trip price. Cancellations 14 days or fewer before departure, or no-shows, are non-refundable.",
            "We will always try to move you to another departure instead of cancelling. Date changes made more than 30 days before departure are free of charge.",
          ],
        },
        {
          heading: "Itinerary changes",
          body: [
            "Mountain weather, landslides, flight delays and permit closures can change plans at short notice. Your guide has final authority on route and schedule decisions for safety reasons.",
            "Where a significant change is unavoidable, we will offer the nearest possible alternative of equivalent value. Any additional costs caused by events outside our control are payable by the traveller.",
          ],
        },
        {
          heading: "Health, fitness and insurance",
          body: [
            "Some trips operate above 4,000 m. You are responsible for assessing your fitness and disclosing relevant medical conditions before booking. Our team can advise on suitable routes.",
            "Comprehensive travel insurance covering trekking, emergency evacuation and medical treatment to your maximum altitude is mandatory for all trekking trips.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Nepal Travel acts as the organiser of your trip and works with licensed guides, transport providers and accommodation partners. We are not liable for losses caused by events beyond our reasonable control, including natural disasters, political unrest or airline disruption.",
            "Nothing in these terms limits liability that cannot be limited under applicable Nepalese law.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by the laws of Nepal, and any dispute will be subject to the jurisdiction of the courts of Kathmandu.",
          ],
        },
      ]}
    />
  );
}

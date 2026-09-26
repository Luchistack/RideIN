// Shared FAQ content -- each of the split-off pages shows its own group
// as a short mini-FAQ before its closing CTA, and FAQPage.jsx shows every
// group together on one page. Keeping it here means both places always
// stay in sync with each other.

export const HOW_IT_WORKS_FAQ = [
  {
    q: 'What if no rider is online?',
    a: 'This is rare. Riders are online throughout the day, so you can generally count on someone being available when you request a ride.',
  },
  {
    q: 'Can I request a specific rider again?',
    a: "Yes. If they're online and free, you can choose them directly from the map, no assignment is forced on you.",
  },
  {
    q: 'How is the wait time calculated?',
    a: "Each rider's estimated wait time is shown next to their pin before you choose, so you know roughly how long before pickup.",
  },
  {
    q: 'Do I have to pay in cash?',
    a: 'No. Every fare is settled by direct bank transfer to RideIN, so no cash or change ever needs to happen at the roadside.',
  },
]

export const FARES_FAQ = [
  {
    q: 'Do fares change with traffic or weather?',
    a: 'No. Pickup, Chatter, and Urgent pickup are all fixed fares, shown before you ever request a ride.',
  },
  {
    q: 'How is a delivery priced?',
    a: "Pickup and delivery doesn't have a fixed fare since routes vary. An admin reviews your from/to addresses and sends you the price before a rider is dispatched.",
  },
  {
    q: 'Is tipping expected?',
    a: "No. Tipping is always optional and in cash if you choose to, it's never a substitute for the fare itself.",
  },
  {
    q: 'Does RideIN mark up the fare?',
    a: "No. The rider's fare and RideIN's service fee are shown separately, so you always see exactly what you're paying for.",
  },
]

export const SAFETY_FAQ = [
  {
    q: 'How are riders vetted before they go live?',
    a: 'Every rider submits identification and is checked against estate records, an estate confirms them before their account can accept rides.',
  },
  {
    q: 'Who can see my location during a ride?',
    a: 'Only your assigned rider (or passenger) can see your live position, and only for the length of that trip.',
  },
  {
    q: 'What if a rider breaks the rules?',
    a: "You can file a report against the rider. Our admin team reviews every report and takes the necessary action.",
  },
  {
    q: 'Do I need to carry cash for safety reasons?',
    a: 'No. Every fare is settled in-app by bank transfer beforehand, so no cash changes hands during the ride.',
  },
]

export const ESTATES_FAQ = [
  {
    q: 'How long does an application take?',
    a: 'Applications are reviewed weekly, and estate management gets a call or email back with a decision.',
  },
  {
    q: 'Can our estate set its own fares?',
    a: 'Yes. Each estate runs its own riders and its own fares on the same shared RideIN system.',
  },
  {
    q: 'What if riders already operate informally in our estate?',
    a: 'They can still apply individually through the same verification process, no need to disband any existing arrangement first.',
  },
  {
    q: 'What do riders need to be approved?',
    a: 'Riders submit identification, get checked against estate records, and are confirmed by estate management before going live.',
  },
]

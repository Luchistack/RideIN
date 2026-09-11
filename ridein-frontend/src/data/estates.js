// Estates currently live on RideIN. Add a new entry once an estate's
// application (see EstateSignup.jsx) has been approved and onboarded.
export const ESTATES = [
  { id: 'e1', name: 'Millennium Estate', status: 'live', meta: 'Live · 24 verified riders' },
]

// Where the "Apply to bring RideIN to your estate" button sends people.
// Estate management fills this in with full details; RideIN reviews it and
// calls/emails them back with a decision — there's no in-app form or
// automated email for this, it's handled manually from the Google Form
// responses sheet.
export const ESTATE_APPLICATION_FORM_URL = 'https://forms.gle/F4f9t7deskA5jkP17'

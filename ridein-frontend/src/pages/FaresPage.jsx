import Fares from '../components/sections/Fares.jsx'
import PageCTA from '../components/ui/PageCTA.jsx'

export default function FaresPage() {
  return (
    <>
      <Fares />
      <PageCTA
        title="Ready to book your first ride?"
        body="Sign up as a passenger and request a rider in minutes."
        primaryLabel="Sign up"
        primaryTo="/signup"
        secondaryLabel="Log in"
        secondaryTo="/login"
      />
    </>
  )
}

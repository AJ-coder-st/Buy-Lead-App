import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to buyers list as the main page
  redirect('/buyers')
}

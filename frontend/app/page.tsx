import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to login page first for authentication
  redirect('/login')
}

'use client'

import axios from 'axios';
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const handleLoginRequest = () => {
    console.log('Sending login request')

  axios.post('http://localhost:8000/auth/login/no-redirect', {
    playerId: '1',
    resourceId: '1xpGyKyV26uPstk1Elgp9Q?si=4s6mjPfYQtytwcchBnEu0w'
  })
    .then(function (response) {
      console.log(response);
      router.push('/dashboard', { scroll: false })
    }).catch(() => {
      console.log('Request failed');
    })
  }

  return (
    <main >
      <button onClick={handleLoginRequest}>Login button</button>
    </main>
  );
}

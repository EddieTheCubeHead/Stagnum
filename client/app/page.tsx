'use client'

import axios from 'axios';

export default function Home() {
  const handleLoginRequest = () => {
    console.log('Sending login request')

  axios.get('http://localhost:8000/auth/login', {})
    .then(function (response) {
      console.log(response);
    })
  }

  return (
    <main >
      <button onClick={handleLoginRequest}>Login button</button>
    </main>
  );
}

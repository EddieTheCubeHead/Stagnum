'use client'

import axios from 'axios';

export default function Page() {
  
    const handlePlayRequest = () => {
    console.log('Sending play request')

    axios.get('http://localhost:8000/play', {})
        .then(function (response) {
            console.log(response);
        })
    }

    return (
        <main >
        <button onClick={handlePlayRequest}>Play button</button>
        </main>
    );
}

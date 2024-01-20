'use client'

import axios from 'axios';
import { useEffect } from 'react';

export default function Page() {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    useEffect(() => {
        if (code) {
            console.log('Code', code)
            handleTokenRequest(code);
        }
      }, [code]);
  
    const handleTokenRequest = (code: string) => {
        console.log('Sending play request')

        axios.get(`http://localhost:8000/auth/callback?code=${code}`, {})
            .then(function (response) {
                console.log(response);
                //return response.data.token
            }).catch((error) => {
                console.log('Request failed', error);
            })
    }

    return (
        <main >
        </main>
    );
}

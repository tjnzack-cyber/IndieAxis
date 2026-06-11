
require('dotenv').config();

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://cyb3r.pesapal.com/pesapalv3';

async function getPesapalToken() {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pesapal auth failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.token;
}

async function main() {
  const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/pesapal/ipn`;
  console.log('Registering IPN for:', ipnUrl);
  
  try {
    const token = await getPesapalToken();
    const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'POST',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPN registration failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('IPN registered successfully. IPN ID:', data.ipn_id);
    console.log('Please add this to your .env file as PESAPAL_IPN_ID');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

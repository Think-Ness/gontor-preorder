const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  
  // Create a dummy image
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  formData.append('file', blob, 'test.png');

  try {
    const res = await fetch('http://localhost:3001/api/upload/payment-proof', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error(err);
  }
}

testUpload();

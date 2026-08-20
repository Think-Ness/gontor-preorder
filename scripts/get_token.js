const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh token
});

console.log('\n========================================================');
console.log('LANGKAH 1: Buka link di bawah ini di browser Anda:');
console.log('========================================================\n');
console.log(authUrl);
console.log('\n========================================================');
console.log('Setelah Anda login dan memberi izin, browser Anda akan diarahkan');
console.log('ke halaman OAuth Playground. JANGAN lakukan apapun di halaman tersebut!');
console.log('Cukup perhatikan URL (alamat web) di atas browser Anda.');
console.log('URL tersebut akan terlihat seperti ini:');
console.log('https://developers.google.com/oauthplayground/?code=4/0AeaYI....');
console.log('Silakan COPY bagian setelah "code=" sampai habis.');
console.log('========================================================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('LANGKAH 2: Masukkan KODE (bagian setelah code=) di sini: ', (code) => {
  if (!code) {
    console.log('Kode kosong, dibatalkan.');
    process.exit(1);
  }

  // Remove trailing stuff if the user accidentally copied the whole url
  if (code.includes('code=')) {
    code = code.split('code=')[1].split('&')[0];
  }

  oauth2Client.getToken(decodeURIComponent(code), (err, token) => {
    if (err) {
      console.error('\n❌ Error mendapatkan token:', err.message);
      console.log('Pastikan Anda mengcopy kode dengan benar tanpa spasi tambahan.');
      return process.exit(1);
    }
    
    console.log('\n========================================================');
    console.log('✅ BERHASIL MENDAPATKAN REFRESH TOKEN!');
    console.log('========================================================\n');
    console.log(token.refresh_token);
    
    // Append to .env.local
    const envContent = `\nGOOGLE_CLIENT_ID="${CLIENT_ID}"\nGOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"\nGOOGLE_REFRESH_TOKEN="${token.refresh_token}"\n`;
    fs.appendFileSync('.env.local', envContent);
    
    console.log('\n✅ Kredensial telah otomatis ditambahkan ke file .env.local!');
    console.log('Silakan matikan server (Ctrl+C) dan jalankan ulang "npm run dev".');
    process.exit(0);
  });
});

const { google } = require('googleapis');
const fs = require('fs');

async function test() {
  console.log('Testing service account...\n');
  
  const key = JSON.parse(fs.readFileSync('./config/service-account-key.json'));
  console.log('Email:', key.client_email);
  console.log('Project:', key.project_id);
  
  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive']
  );
  
  try {
    await auth.authorize();
    console.log('\n✅ JWT Authentication SUCCESS!');
    
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.about.get({ fields: 'user' });
    console.log('User:', res.data.user.displayName);
    
  } catch (err) {
    console.log('\n❌ ERROR:', err.message);
  }
}

test();

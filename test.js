const bcrypt = require('bcrypt');

async function hashAndCompareEmail() {
  try {
    const email = 'user@example.com';

    // Hash the email with the salt
    const hashedEmail = await bcrypt.hash(email, 10);
    console.log('Hashed email:', hashedEmail);

    // Simulate user input
    const emailToCompare = 'user@example.com';

    // Compare email with the hashed version
    const isMatch = await bcrypt.compare(emailToCompare, hashedEmail);

    console.log(isMatch ? 'Emails match!' : 'Emails do not match.');
  } catch (err) {
    console.error('Error:', err);
  }
}

hashAndCompareEmail();

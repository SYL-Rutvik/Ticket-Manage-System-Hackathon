const users = [
  { name: 'Employee Test', email: 'employee@example.com', password: 'password123', role: 'employee' },
  { name: 'Agent Test', email: 'agent@example.com', password: 'password123', role: 'agent' },
  { name: 'Admin Test', email: 'admin@example.com', password: 'password123', role: 'admin' }
];

const registerUsers = async () => {
  console.log('Starting user registration...');
  for (const user of users) {
    try {
      console.log(`Registering ${user.email}...`);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      if (data.user) {
        console.log(`✅ Created: ${user.email}`);
      } else {
        console.log(`⚠️ ${user.email}: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ ${user.email}: ${error.message}`);
    }
  }
  console.log('Done!');
  setTimeout(() => process.exit(0), 1000);
};

registerUsers();

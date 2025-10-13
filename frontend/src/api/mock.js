const users = [
  { id: 1, name: 'Admin User', email: 'admin@inst.edu', role: 'ADMIN', dept: 'Admin' },
  { id: 2, name: 'Faculty One', email: 'fac1@inst.edu', role: 'FACULTY', dept: 'CSE' },
  { id: 3, name: 'Student One', email: 'stu1@inst.edu', role: 'STUDENT', dept: 'CSE' },
];

export async function mockLogin(email, password) {
  await new Promise(r => setTimeout(r, 300));
  const u = users.find(x => x.email === email.trim().toLowerCase());
  if (!u || password !== 'pass123') throw new Error('Invalid email or password');
  return { token: 'token-' + u.id, user: u };
}

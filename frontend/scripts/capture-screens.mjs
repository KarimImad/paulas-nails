import { chromium } from 'playwright';

const baseURL = 'http://127.0.0.1:4173';
const outDir = '/Users/karimimad/Documents/paulas-nails/docs/dossier/screens';

const services = [
  { id: 1, name: 'Pose semi-permanent', description: 'Vernis longue durée, brillance parfaite et tenue jusqu’à 3 semaines.', duration: 45, price: 35, category: 'vernis' },
  { id: 2, name: 'Manucure classique', description: 'Soin complet des mains avec gommage, massage et pose de vernis.', duration: 60, price: 30, category: 'soin' },
  { id: 3, name: 'Pose gel couleur', description: 'Renforcement ou extension en gel, finition colorée au choix.', duration: 90, price: 60, category: 'gel' },
  { id: 4, name: 'Baby boomer', description: 'Dégradé rose/blanc élégant et intemporel.', duration: 90, price: 70, category: 'gel' },
  { id: 5, name: 'Nail art', description: 'Décorations sur mesure : motifs, strass, chrome, etc.', duration: 120, price: 80, category: 'art' },
];

const slotsAvailable = [
  { id: 1, date: '2026-03-15', time: '10:00', is_available: true },
  { id: 2, date: '2026-03-15', time: '14:30', is_available: true },
  { id: 3, date: '2026-03-16', time: '11:00', is_available: true },
  { id: 4, date: '2026-03-18', time: '09:30', is_available: true },
  { id: 5, date: '2026-03-19', time: '16:00', is_available: true },
];

const reservationsMy = [
  {
    id: 10,
    user_id: 1,
    service_id: 3,
    slot_id: 2,
    status: 'confirmed',
    notes: 'Couleur nude, format amande.',
    service_name: 'Pose gel couleur',
    service_price: 60,
    service_duration: 90,
    slot_date: '2026-03-20',
    slot_time: '14:30',
  },
  {
    id: 11,
    user_id: 1,
    service_id: 1,
    slot_id: 4,
    status: 'pending',
    notes: null,
    service_name: 'Pose semi-permanent',
    service_price: 35,
    service_duration: 45,
    slot_date: '2026-03-22',
    slot_time: '09:30',
  },
  {
    id: 12,
    user_id: 1,
    service_id: 2,
    slot_id: 5,
    status: 'cancelled',
    notes: null,
    service_name: 'Manucure classique',
    service_price: 30,
    service_duration: 60,
    slot_date: '2026-02-18',
    slot_time: '16:00',
  },
];

const reservationsAdmin = [
  {
    id: 21,
    user_id: 1,
    service_id: 3,
    slot_id: 2,
    status: 'confirmed',
    notes: 'Couleur nude, format amande.',
    user_name: 'Karim Imad',
    user_email: 'karim.imad@mail.com',
    user_phone: '+33 6 12 34 56 78',
    service_name: 'Pose gel couleur',
    service_price: 60,
    service_duration: 90,
    slot_date: '2026-03-20',
    slot_time: '14:30',
  },
  {
    id: 22,
    user_id: 2,
    service_id: 1,
    slot_id: 3,
    status: 'pending',
    notes: 'Merci de confirmer rapidement.',
    user_name: 'Sofia Martin',
    user_email: 'sofia.martin@mail.com',
    user_phone: '+33 6 98 00 00 01',
    service_name: 'Pose semi-permanent',
    service_price: 35,
    service_duration: 45,
    slot_date: '2026-03-16',
    slot_time: '11:00',
  },
  {
    id: 23,
    user_id: 3,
    service_id: 5,
    slot_id: 1,
    status: 'cancelled',
    notes: null,
    user_name: 'Camille Roche',
    user_email: 'camille.roche@mail.com',
    user_phone: null,
    service_name: 'Nail art',
    service_price: 80,
    service_duration: 120,
    slot_date: '2026-03-15',
    slot_time: '10:00',
  },
];

const slotsAdmin = [
  { id: 1, date: '2026-03-15', time: '10:00', is_available: false, reservation_id: 23, reservation_status: 'cancelled', client_name: 'Camille Roche' },
  { id: 2, date: '2026-03-20', time: '14:30', is_available: false, reservation_id: 21, reservation_status: 'confirmed', client_name: 'Karim Imad' },
  { id: 3, date: '2026-03-16', time: '11:00', is_available: false, reservation_id: 22, reservation_status: 'pending', client_name: 'Sofia Martin' },
  { id: 4, date: '2026-03-18', time: '09:30', is_available: true, reservation_id: null, reservation_status: null, client_name: null },
  { id: 5, date: '2026-03-19', time: '16:00', is_available: true, reservation_id: null, reservation_status: null, client_name: null },
];

async function routeMocks(page, user) {
  await page.route('**/api/auth/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ user }),
  }));

  await page.route('**/api/services', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(services),
  }));

  await page.route('**/api/slots/available', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(slotsAvailable),
  }));

  await page.route('**/api/reservations/my', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(reservationsMy),
  }));

  await page.route('**/api/reservations', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(reservationsAdmin),
  }));

  await page.route('**/api/slots', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(slotsAdmin),
  }));

  await page.route('**/api/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({}),
  }));
}

async function capturePage(browser, { name, path, viewport, user, waitFor }) {
  const page = await browser.newPage();
  await page.setViewportSize(viewport);

  await routeMocks(page, user);

  await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 8000 });
  } else {
    await page.waitForTimeout(2000);
  }
  await page.evaluate(() => (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve());

  await page.addStyleTag({ content: `* { transition: none !important; animation: none !important; }` });
  await page.waitForTimeout(200);

  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  await page.close();
}

(async () => {
  const browser = await chromium.launch();

  const user = { id: 1, name: 'Karim Imad', email: 'karim.imad@mail.com', role: 'user', phone: '+33 6 12 34 56 78' };
  const admin = { id: 99, name: 'Karim Imad', email: 'admin@paulasnails.fr', role: 'admin', phone: '+33 6 12 34 56 78' };

  const shots = [
    { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 900 }, user: null, waitFor: 'h1' },
    { name: 'home-mobile', path: '/', viewport: { width: 390, height: 844 }, user: null, waitFor: 'h1' },
    { name: 'login-mobile', path: '/connexion', viewport: { width: 390, height: 844 }, user: null, waitFor: 'form' },
    { name: 'register-desktop', path: '/inscription', viewport: { width: 1280, height: 900 }, user: null, waitFor: 'form' },
    { name: 'reservation-desktop', path: '/reservation', viewport: { width: 1440, height: 900 }, user, waitFor: 'h1' },
    { name: 'my-reservations-mobile', path: '/mes-reservations', viewport: { width: 390, height: 844 }, user, waitFor: 'h1' },
    { name: 'admin-dashboard-desktop', path: '/admin', viewport: { width: 1440, height: 900 }, user: admin, waitFor: 'h1' },
    { name: 'admin-services-desktop', path: '/admin/services', viewport: { width: 1440, height: 900 }, user: admin, waitFor: 'h1' },
    { name: 'admin-slots-desktop', path: '/admin/creneaux', viewport: { width: 1440, height: 900 }, user: admin, waitFor: 'h1' },
    { name: 'admin-reservations-desktop', path: '/admin/reservations', viewport: { width: 1440, height: 900 }, user: admin, waitFor: 'h1' },
    { name: 'admin-testplan-desktop', path: '/admin/tests', viewport: { width: 1440, height: 900 }, user: admin, waitFor: 'h1' },
  ];

  for (const shot of shots) {
    await capturePage(browser, shot);
  }

  await browser.close();
  console.log('Screenshots captured.');
})();

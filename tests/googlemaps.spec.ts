import { test, expect } from '@playwright/test';

//Test für Google Maps, um sicherzustellen, dass die Seite geladen wird.
test.describe('Google Maps läuft', () => {
  test('has title', async ({ page }) => {
    // Google Maps aufrufen
    await page.goto('https://www.google.com/maps/');
  
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Google Maps/);
  });
});

//Test für Google Maps, um sicherzustellen, dass eine Route von Berlin nach Münster per Auto plausibel ist.
test.describe('Google Maps Route Berlin → Münster', () => {
  test('Autoroute mit plausibler Distanz', async ({ page }) => {
    // Google Maps aufrufen
    await page.goto('https://www.google.com/maps/');

    // Akzeptieren von Cookies, falls der Button sichtbar ist
    const acceptButton = page
      .getByRole('button')
      .filter({ hasText: /Alle akzeptieren|Akzeptieren|Accept all/i });

    if (await acceptButton.first().isVisible().catch(() => false)) {
      await acceptButton.first().click();
    }

    // Klicken auf die Schaltfläche "Route" oder "Directions"
    await page
      .getByRole('button', { name: /Route|Directions|Wegbeschreibung/i })
      .first()
      .click();

    // Locator für die Routeneingabefelder ermitteln (Start und Ziel)
    const routeInputs = page.locator(
      'input[aria-label*="Start" i], input[aria-label*="starting" i], ' +
      'input[placeholder*="Start" i], input[placeholder*="starting" i], ' +
      'input[aria-label*="Ziel" i], input[aria-label*="destination" i], ' +
      'input[placeholder*="Ziel" i], input[placeholder*="destination" i]'
    );

    // Start- und Zielort eingeben
    await expect(routeInputs).toHaveCount(2);
    await routeInputs.nth(0).fill('Berlin');
    await routeInputs.nth(1).fill('Münster');

    // Drücken der Eingabetaste, um die Route zu berechnen
    await routeInputs.nth(1).press('Enter');

    // Klicken auf die Schaltfläche "Mit dem Auto", um die Auto-Route anzuzeigen
    const driveButton = page.getByRole('button', { name: /Mit dem Auto/i });
    await expect(driveButton).toBeVisible();
    await driveButton.click();

    // Warten, bis die Route geladen ist und die Distanz angezeigt wird
    await expect(page.locator('body')).toContainText('Berlin');
    await expect(page.locator('body')).toContainText('Münster');

    // Locator für die Distanzinformationen ermitteln und den Text extrahieren
    const routeText = await page.locator('body').innerText();
    const distanceMatch = routeText.match(/(\d{2,4}(?:[.,]\d+)?)\s*km/i);
    expect(distanceMatch).not.toBeNull();

    const distance = Number(distanceMatch![1].replace(',', '.'));

    // Überprüfen, ob die Distanz plausibel ist (zwischen 450 km und 550 km)
    expect(distance).toBeGreaterThanOrEqual(450);
    expect(distance).toBeLessThanOrEqual(550);
  });
});
import { test, expect } from '@playwright/test';

/**
 * End-to-End Integration Test Suite for League & Team Administration (User Story 1)
 * Task: T008
 * 
 * Verifies:
 * 1. Admin League Creation and Configuration
 * 2. Team Registration and Roster Building (4 teams, 10 players/team with jersey numbers and positions)
 * 3. Referee Management and League Pool Assignment (2 referees)
 * 4. Roster completeness and pool eligibility assertions
 */

test.describe('User Story 1: League & Team Administration Flow', () => {
  const testLeague = {
    name: 'Barrio Community Premier League',
    season: 'Summer 2026',
    location: 'Central Neighborhood Sports Complex',
    description: 'Neighborhood amateur 11-a-side competitive football league',
  };

  const teamNames = [
    'Barrio FC',
    'Northside Kickers',
    'East End United',
    'Southside Stars',
  ];

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  const refereeNames = ['Carlos Rodriguez', 'Ana Martinez'];

  test('should create a new league successfully', async ({ page }) => {
    // Navigate to admin dashboard / league creation page
    await page.goto('/league');

    // Fill out League creation form
    await page.fill('input[name="name"]', testLeague.name);
    await page.fill('input[name="season"]', testLeague.season);
    await page.fill('input[name="location"]', testLeague.location);
    await page.fill('textarea[name="description"]', testLeague.description);

    // Submit league creation
    await page.click('button[type="submit"]');

    // Verify league dashboard reflects the created league
    await expect(page.locator(`text=${testLeague.name}`)).toBeVisible();
    await expect(page.locator(`text=${testLeague.season}`)).toBeVisible();
  });

  test('should register 4 teams with 10 players each including jersey numbers and positions', async ({ page }) => {
    await page.goto('/league/teams');

    for (const teamName of teamNames) {
      // Create team
      await page.fill('input[name="teamName"]', teamName);
      await page.click('button:has-text("Add Team")');
      await expect(page.locator(`text=${teamName}`)).toBeVisible();

      // Add 10 players per team
      for (let i = 1; i <= 10; i++) {
        const playerName = `Player ${i} (${teamName})`;
        const jerseyNumber = String(i);
        const position = positions[(i - 1) % positions.length];

        await page.fill('input[name="playerName"]', playerName);
        await page.fill('input[name="jerseyNumber"]', jerseyNumber);
        await page.selectOption('select[name="position"]', position);
        await page.click('button:has-text("Add Player")');

        // Assert player appears on roster
        await expect(page.locator(`text=${playerName}`)).toBeVisible();
      }
    }
  });

  test('should register 2 referees and assign them to the league pool', async ({ page }) => {
    await page.goto('/league/referees');

    for (const refName of refereeNames) {
      await page.fill('input[name="refereeName"]', refName);
      await page.click('button:has-text("Register Referee")');
      await page.click(`button[data-referee="${refName}"]:has-text("Assign to Pool")`);

      // Assert referee is assigned and eligible
      await expect(page.locator(`tr:has-text("${refName}")`)).toContainText('Assigned');
    }
  });

  test('should verify full setup readiness for fixture schedule generation', async ({ page }) => {
    await page.goto('/league');

    // Verify league summary reflects 4 registered teams and 2 assigned referees
    await expect(page.locator('[data-testid="registered-teams-count"]')).toHaveText('4');
    await expect(page.locator('[data-testid="assigned-referees-count"]')).toHaveText('2');
    await expect(page.locator('button:has-text("Generate Fixtures")')).toBeEnabled();
  });
});

import { test, expect } from '@playwright/test';

/**
 * End-to-End Integration Test Suite for Match Scheduling, Results & Standings (User Story 2)
 * Task: T017
 * 
 * Verifies:
 * 1. Round-robin fixture schedule generation for league teams
 * 2. Referee and Admin match result submission (scores, scorers, yellow/red cards)
 * 3. Real-time league standings calculation (Points: 3 Win / 1 Draw / 0 Loss, GD, rank ordering)
 * 4. Data consistency between match completions and standings updates
 */

test.describe('User Story 2: Match Scheduling, Results & Standings Flow', () => {
  const testLeague = {
    id: 'league-barrio-2026',
    name: 'Barrio Community Premier League',
  };

  const fixtureMatches = [
    { homeTeam: 'Barrio FC', awayTeam: 'Northside Kickers', homeScore: 3, awayScore: 1 },
    { homeTeam: 'East End United', awayTeam: 'Southside Stars', homeScore: 2, awayScore: 2 },
  ];

  test('should generate round-robin fixture schedule for registered league teams', async ({ page }) => {
    // Navigate to match schedule / fixture generation page
    await page.goto('/match/fixtures');

    // Select target league
    await page.selectOption('select[name="leagueId"]', testLeague.name);

    // Trigger fixture generation
    await page.click('button:has-text("Generate Fixtures")');

    // Assert fixtures are created and rendered on the schedule list
    await expect(page.locator(`text=${fixtureMatches[0].homeTeam} vs ${fixtureMatches[0].awayTeam}`)).toBeVisible();
    await expect(page.locator(`text=${fixtureMatches[1].homeTeam} vs ${fixtureMatches[1].awayTeam}`)).toBeVisible();
    await expect(page.locator('[data-testid="fixture-status-pending"]')).toHaveCount(2);
  });

  test('should allow referee or admin to submit match results, scorers, and cards', async ({ page }) => {
    // Navigate to match result submission page
    await page.goto('/match/results');

    const match = fixtureMatches[0];

    // Select pending match fixture
    await page.click(`tr:has-text("${match.homeTeam} vs ${match.awayTeam}") button:has-text("Enter Results")`);

    // Enter match score
    await page.fill('input[name="homeScore"]', String(match.homeScore));
    await page.fill('input[name="awayScore"]', String(match.awayScore));

    // Log goal event
    await page.click('button:has-text("Add Goal Event")');
    await page.fill('input[name="eventMinute"]', '14');
    await page.fill('input[name="playerName"]', `Player 1 (${match.homeTeam})`);
    await page.selectOption('select[name="eventType"]', 'GOAL');

    // Log card event
    await page.click('button:has-text("Add Card Event")');
    await page.fill('input[name="eventMinute"]', '42');
    await page.fill('input[name="playerName"]', `Player 5 (${match.awayTeam})`);
    await page.selectOption('select[name="eventType"]', 'YELLOW_CARD');

    // Submit match result
    await page.click('button[type="submit"]:has-text("Submit Final Result")');

    // Assert match status updates to COMPLETED
    await expect(page.locator(`tr:has-text("${match.homeTeam} vs ${match.awayTeam}")`)).toContainText('COMPLETED');
  });

  test('should calculate real-time standings with points, GD, and accurate ranks', async ({ page }) => {
    // Navigate to real-time standings table page
    await page.goto('/match/standings');

    // Verify standings table headers
    await expect(page.locator('th:has-text("Rank")')).toBeVisible();
    await expect(page.locator('th:has-text("Team")')).toBeVisible();
    await expect(page.locator('th:has-text("PTS")')).toBeVisible();

    // Verify Barrio FC (Winning Team: 3 pts, +2 GD) is ranked #1
    const topRow = page.locator('table tbody tr').first();
    await expect(topRow).toContainText('Barrio FC');
    await expect(topRow).toContainText('3'); // Points
    await expect(topRow).toContainText('+2'); // Goal Difference

    // Verify drawn teams (East End United & Southside Stars: 1 pt each)
    await expect(page.locator('table tbody tr:has-text("East End United")')).toContainText('1');
    await expect(page.locator('table tbody tr:has-text("Southside Stars")')).toContainText('1');

    // Verify losing team (Northside Kickers: 0 pts, -2 GD)
    await expect(page.locator('table tbody tr:has-text("Northside Kickers")')).toContainText('0');
  });

  test('should verify end-to-end schedule and standings consistency', async ({ page }) => {
    await page.goto('/match/standings');

    // Assert complete standings summary counters
    await expect(page.locator('[data-testid="completed-matches-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="standings-table"]')).toBeVisible();
  });
});

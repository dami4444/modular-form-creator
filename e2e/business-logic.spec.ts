import { test, expect } from '@playwright/test'

/**
 * End-to-end coverage of the backend-driven business rules:
 * draft creation, module gating, provisioning transition, and the
 * completed-resource edit buffer (stage → discard-on-refresh → persist-on-submit).
 *
 * Requires the backend running on http://localhost:5001. The frontend dev server
 * is started automatically by playwright.config.ts.
 */

const overviewUrl = /\/resources\/[^/]+$/

test('resource lifecycle: draft → modules → provisioning → completed edit buffer', async ({
  page,
}) => {
  const name = `Verify ${Date.now()}`
  let id = ''

  await test.step('create a resource (starts as draft)', async () => {
    await page.goto('/resources')
    await page.getByRole('button', { name: '+ New resource' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Resource name').fill(name)
    await dialog.getByRole('button', { name: 'Create resource' }).click()
    await page.waitForURL(overviewUrl)
    id = new URL(page.url()).pathname.split('/resources/')[1]
    await expect(page.getByText('Draft').first()).toBeVisible()
  })

  await test.step('Project Details is locked until Basic Info is complete', async () => {
    await expect(page.getByText('Locked')).toBeVisible()
  })

  await test.step('completing Basic Info (draft PATCH) auto-advances to Project Details', async () => {
    await page.getByRole('button', { name: 'Edit Basic Info' }).click()
    await page.waitForURL('**/basic-info')
    await page.getByLabel('Owner').fill('Jane Doe')
    await page.getByLabel('Email').fill('jane@example.com')
    await page
      .getByLabel('Description')
      .fill('A resource created during automated verification')
    await page.getByLabel('Priority').selectOption('high')
    await page.getByRole('button', { name: 'Save Basic Info' }).click()
    // Draft Basic Info now advances straight to the next step (Project Details), which is unlocked.
    await page.waitForURL('**/project-details')
    await expect(page.getByLabel('Project name')).toBeVisible()
  })

  await test.step('Project Details is unlocked but provisioning stays disabled until it is complete', async () => {
    await page.getByRole('link', { name: 'Overview', exact: true }).click()
    await page.waitForURL(overviewUrl)
    await expect(page.getByText('Locked')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Provision resource' })).toBeDisabled()
  })

  await test.step('completing Project Details (draft PATCH) enables provisioning', async () => {
    await page.getByRole('button', { name: 'Edit Project Details' }).click()
    await page.waitForURL('**/project-details')
    await page.getByLabel('Project name').fill('Apollo')
    await page.getByLabel('Budget').fill('50000')
    await page.getByLabel('Category').selectOption('internal')
    await page.getByText('FE devs', { exact: true }).click()
    await page.getByRole('button', { name: 'Save Project Details' }).click()
    await page.waitForURL(overviewUrl)
    await expect(page.getByRole('button', { name: 'Provision resource' })).toBeEnabled()
  })

  await test.step('provisioning moves draft → completed and blocks re-provision', async () => {
    await page.getByRole('button', { name: 'Provision resource' }).click()
    await expect(page.getByText('Completed').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Provision resource' })).toHaveCount(0)
  })

  await test.step('staging stays on the tab, is gated by dirtiness, and is compared on details', async () => {
    await page.getByRole('button', { name: 'Edit Basic Info' }).click()
    await page.waitForURL('**/basic-info')

    // Stage is disabled until the form actually changes.
    await expect(page.getByRole('button', { name: 'Stage changes' })).toBeDisabled()
    await page.getByLabel('Owner').fill('Janet Buffered')
    await expect(page.getByRole('button', { name: 'Stage changes' })).toBeEnabled()

    await page.getByRole('button', { name: 'Stage changes' }).click()
    // Stays on the same tab; banner appears; Stage disables again (nothing new to stage).
    await expect(page).toHaveURL(/\/basic-info$/)
    await expect(page.getByText('unsaved changes')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stage changes' })).toBeDisabled()

    // /details compares saved vs. unsaved side by side (both values shown, change marked).
    await page.getByRole('link', { name: 'Details', exact: true }).click()
    await page.waitForURL('**/details')
    await expect(page.getByText('Unsaved', { exact: true })).toBeVisible()
    await expect(page.getByText('Jane Doe')).toBeVisible() // saved value
    await expect(page.getByText('Janet Buffered')).toBeVisible() // unsaved value, alongside
  })

  await test.step('discarding reverts the open tab to saved data', async () => {
    await page.getByRole('link', { name: 'Basic Info', exact: true }).click()
    await page.waitForURL('**/basic-info')
    await expect(page.getByLabel('Owner')).toHaveValue('Janet Buffered')
    await page.getByRole('button', { name: 'Discard' }).click()
    await expect(page.getByLabel('Owner')).toHaveValue('Jane Doe')
    await expect(page.getByText('unsaved changes')).toHaveCount(0)
  })

  await test.step('refresh discards staged edits', async () => {
    await page.getByLabel('Owner').fill('Janet Refresh')
    await page.getByRole('button', { name: 'Stage changes' }).click()
    await expect(page.getByText('unsaved changes')).toBeVisible()
    await page.reload()
    await expect(page.getByText('unsaved changes')).toHaveCount(0)
    await expect(page.getByLabel('Owner')).toHaveValue('Jane Doe')
  })

  await test.step('completed edit persists via full PUT on explicit submit', async () => {
    await page.getByLabel('Owner').fill('Janet Persist')
    await page.getByRole('button', { name: 'Stage changes' }).click()
    await expect(page.getByText('unsaved changes')).toBeVisible()
    await page.getByRole('button', { name: 'Submit changes' }).click()
    await expect(page.getByText('unsaved changes')).toHaveCount(0)

    await page.goto(`/resources/${id}/details`)
    await expect(page.getByText('Janet Persist')).toBeVisible()
  })

  await test.step('resource can be deleted from the list', async () => {
    await page.goto('/resources')
    await page.getByRole('button', { name: `Delete ${name}` }).click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(page.getByRole('button', { name: `Delete ${name}` })).toHaveCount(0)
  })
})

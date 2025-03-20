import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/"); // Go to the home page
});

test.afterEach(async () => {});

test.describe('user register', () => {
    test('user register successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('99912345');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
        await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
        await page.getByRole('button', { name: 'REGISTER' }).click();
    });

    test('user login successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();
    });
  
});
import { expect, test } from "@playwright/test";

test("can log in", async ({ page }) => {
  await page.goto("/login");

  const nameInput = page.getByRole("textbox", { name: "Name" });
  const emailInput = page.getByRole("textbox", { name: "Email" });
  const loginButton = page.getByRole("button", { name: "Login" });

  await expect(nameInput).toBeVisible();
  await expect(emailInput).toBeVisible();

  await nameInput.fill("Test");
  await emailInput.fill("example@example.com");

  await loginButton.click();

  await page.waitForURL("/");
});

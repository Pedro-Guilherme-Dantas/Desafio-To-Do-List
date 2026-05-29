const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

describe('Auth and Dashboard E2E', () => {
  let driver
  jest.setTimeout(30000)

  beforeAll(async () => {
    let options = new chrome.Options()
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage')
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  })

  afterAll(async () => {
    await driver.quit()
  })

  test('User can login and view dashboard', async () => {
    await driver.get('http://localhost:5173/login')
    
    // Fill login form
    const usernameField = await driver.wait(until.elementLocated(By.name('username')), 15000)
    await usernameField.sendKeys('testuser')
    await driver.findElement(By.name('password')).sendKeys('password123')
    await driver.findElement(By.css('button[type="submit"]')).click()
    
    // Wait for redirect to dashboard
    await driver.wait(until.elementLocated(By.xpath("//h2[text()='Dashboard']")), 5000)
    
    // Verify columns exist
    const columns = await driver.findElements(By.className('col-12 col-md-6 col-xl-4'))
    expect(columns.length).toBe(6) // Today, Next 3 Days, Next 5 Days, Next Weeks, Next Month, No Deadline
  })
})

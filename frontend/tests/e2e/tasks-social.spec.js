const { Builder, By, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')

describe('Tasks and Social E2E', () => {
  let driver

  beforeAll(async () => {
    let options = new chrome.Options()
    options.addArguments('--headless')
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  })

  afterAll(async () => {
    await driver.quit()
  })

  test('User can create a task', async () => {
    await driver.get('http://localhost:5173/') // Assuming already logged in or mocked
    
    // Click New Task
    await driver.findElement(By.xpath("//button[contains(text(), 'New Task')]")).click()
    
    // Wait for modal
    await driver.wait(until.elementLocated(By.className('modal-content')), 3000)
    
    // Fill task form
    await driver.findElement(By.css('input[type="text"]')).sendKeys('E2E Test Task')
    await driver.findElement(By.css('textarea')).sendKeys('Description for E2E Test Task')
    
    // Submit
    await driver.findElement(By.css('button[type="submit"]')).click()
    
    // Wait for modal to close and task to appear in 'No Deadline' column
    await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'E2E Test Task')]")), 5000)
  })
})

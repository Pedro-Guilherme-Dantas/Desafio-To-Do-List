import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { jest } from '@jest/globals';

describe('Testes E2E Simples - Login e Dashboard', () => {
  let driver
  jest.setTimeout(30000)

  beforeAll(async () => {
    let options = new chrome.Options()
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage')
    let serviceBuilder = new chrome.ServiceBuilder('/usr/bin/chromedriver')
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(serviceBuilder)
      .build()
  })

  afterAll(async () => {
    if (driver) {
      await driver.quit()
    }
  })

  test('Deve contornar o login via localStorage e carregar o Dashboard', async () => {
    // 1. Acessa a raiz para inicializar o domínio no navegador do Selenium
    await driver.get('http://localhost:5173/')
    
    // 2. Injeta um token falso, enganando o frontend de que já estamos logados
    await driver.executeScript("window.localStorage.setItem('access', 'fake-jwt-token');")
    
    // 3. Redireciona direto para a página interna
    await driver.get('http://localhost:5173/dashboard')
    
    // 4. Verifica se o elemento chave (Título Dashboard) carregou na tela
    const dashboardTitle = await driver.wait(until.elementLocated(By.xpath("//h2[text()='Dashboard']")), 10000)
    
    // Valida que o elemento está visível
    expect(await dashboardTitle.isDisplayed()).toBe(true)
  })
})

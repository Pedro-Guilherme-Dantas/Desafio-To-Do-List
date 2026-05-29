import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { jest } from '@jest/globals';

describe('Testes E2E Simples - Tarefas', () => {
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

  test('Deve encontrar e abrir o modal de nova tarefa', async () => {
    // 1. Acessa a página principal
    await driver.get('http://localhost:5173/') 
    
    // 2. Injeta o token e configura o idioma
    await driver.executeScript("window.localStorage.setItem('access', 'fake-jwt-token'); window.localStorage.setItem('i18nextLng', 'en');")
    
    // 3. Navega para o dashboard (onde fica o botão de nova tarefa)
    await driver.get('http://localhost:5173/dashboard')
    
    // 4. Aguarda o botão de nova tarefa carregar e clica
    const newTaskBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'New Task')]")), 10000)
    await newTaskBtn.click()
    
    // 5. Verifica se o elemento chave do modal apareceu na tela
    const modalContent = await driver.wait(until.elementLocated(By.className('modal-content')), 10000)
    
    // Valida que o modal está visível
    expect(await modalContent.isDisplayed()).toBe(true)
  })
})

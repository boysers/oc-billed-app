/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.classList.value).toMatch("active-icon");
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("Given the bills container is initialized", () => {
      test("When clicking on the new bill button, i go to the form bill", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills })
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const billsContainer = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })
  
        const newBillButton = screen.getByTestId("btn-new-bill")
        const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill())
  
        newBillButton.addEventListener("click", handleClickNewBill)
        fireEvent.click(newBillButton)
  
        expect(handleClickNewBill).toHaveBeenCalled()
  
        const formNewBill = screen.queryByTestId("form-new-bill")
        expect(formNewBill).toBeTruthy()
      })

      test("When clicking on icon eye", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills })
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const billsContainer = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })

        const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye.bind(billsContainer))
        const eye = screen.getAllByTestId("icon-eye")[0]

        eye.addEventListener('click', () => handleClickIconEye(eye))
        fireEvent.click(eye)

        expect(handleClickIconEye).toHaveBeenCalled()

        const modale = screen.getByTestId('modaleFile')
        expect(modale).toBeTruthy()
      })
    })
  })
})

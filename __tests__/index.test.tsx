import { fireEvent, render } from '@testing-library/react'
import Home from '@/pages/index'

const originalJestListeners = {
  uncaughtException: [] as NodeJS.UncaughtExceptionListener[],
  unhandledRejection: [] as NodeJS.UnhandledRejectionListener[],
} as any;

// For each event, we retrieve the registered listeners, store them
// in our global object and remove them from the event emitter.
beforeEach(() => {
  const removeListeners = (event: "uncaughtException" | "unhandledRejection") => {
    const originalProcess = (process as any)._original() as NodeJS.Process;
    originalProcess.listeners(event as any).forEach(listener => {
      originalJestListeners[event].push(listener as any)
      originalProcess.off(event, listener)
    })
  };
  removeListeners("uncaughtException");
  removeListeners("unhandledRejection");
})
// For each event, we retrieve the listeners stored in the global object
// and we register them on the event emitter.
afterEach(() => {
  const restoreListeners = (event: "uncaughtException" | "unhandledRejection") => {
    let listener
    const originalProcess = (process as any)._original() as NodeJS.Process;
    while ((listener = originalJestListeners[event].pop()) !== undefined) {
      originalProcess.on(event, listener)
    }
  }
  restoreListeners("uncaughtException");
  restoreListeners("unhandledRejection");
})

describe('Home', () => {
  it('click me button throws load data error.', async () => {
    const { getByTestId } = render(<Home />);

    const uncaughtErrorPromise = new Promise(resolve => {
      const originalProcess = (process as any)._original() as NodeJS.Process;
      originalProcess.on("uncaughtException", resolve)
     })
   
     fireEvent.click(getByTestId("click-me"));
   
     await expect(uncaughtErrorPromise).resolves.toEqual(new Error('load data error.'))
  })
})

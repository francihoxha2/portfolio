import { useCallback } from 'react'

export const OPEN_PORTFOLIO_ASSISTANT_EVENT = 'portfolio:open-assistant'

export function useAssistantLauncher() {
  return useCallback(() => {
    window.dispatchEvent(new Event(OPEN_PORTFOLIO_ASSISTANT_EVENT))
  }, [])
}

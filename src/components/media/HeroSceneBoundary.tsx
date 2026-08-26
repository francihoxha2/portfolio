import { Component, type ErrorInfo, type ReactNode } from 'react'

interface HeroSceneBoundaryProps {
  children: ReactNode
  fallback: ReactNode
  onSceneError?: (error: Error, info: ErrorInfo) => void
  resetKey?: string
}

interface HeroSceneBoundaryState {
  hasError: boolean
}

export default class HeroSceneBoundary extends Component<
  HeroSceneBoundaryProps,
  HeroSceneBoundaryState
> {
  state: HeroSceneBoundaryState = { hasError: false }

  static getDerivedStateFromError(): HeroSceneBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onSceneError?.(error, info)
  }

  componentDidUpdate(previousProps: HeroSceneBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false })
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

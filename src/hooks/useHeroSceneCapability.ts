import { useEffect, useState } from 'react'
import {
  getHeroSceneCapability,
  type HeroSceneCapability,
  type HeroSceneSignals,
} from '../components/media/heroSceneCapabilities.ts'
import { useReducedMotion } from './useReducedMotion.ts'

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike
}

function readSignals(reducedMotion: boolean): HeroSceneSignals {
  const connection = (navigator as NavigatorWithConnection).connection

  return {
    reducedMotion,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    saveData: Boolean(connection?.saveData),
    webGLAvailable: typeof window.WebGLRenderingContext !== 'undefined',
  }
}

export function useHeroSceneCapability(): HeroSceneCapability {
  const reducedMotion = useReducedMotion()
  const [capability, setCapability] = useState(() =>
    getHeroSceneCapability(readSignals(reducedMotion)),
  )

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: coarse)')
    const connection = (navigator as NavigatorWithConnection).connection
    const updateCapability = () => {
      setCapability(getHeroSceneCapability(readSignals(reducedMotion)))
    }

    updateCapability()
    pointerQuery.addEventListener('change', updateCapability)
    connection?.addEventListener('change', updateCapability)

    return () => {
      pointerQuery.removeEventListener('change', updateCapability)
      connection?.removeEventListener('change', updateCapability)
    }
  }, [reducedMotion])

  return capability
}

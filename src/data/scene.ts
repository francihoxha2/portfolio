export type SceneVector3 = [number, number, number]

export const sceneColors = {
  charcoal: '#101521',
  charcoalRaised: '#1a2230',
  darkMetal: '#202936',
  violet: '#8270ff',
  blue: '#4c9aff',
  cyan: '#5ddde6',
  softWhite: '#dce8f4',
} as const

export const systemConnections: ReadonlyArray<ReadonlyArray<SceneVector3>> = [
  [
    [-3.15, 0.18, 0.26],
    [-2.45, 0.35, -0.08],
    [-1.5, 0.15, -0.2],
  ],
  [
    [2.18, 0.58, -0.2],
    [2.85, 0.85, 0.08],
    [3.38, 1.18, -0.08],
  ],
  [
    [2.12, -0.42, 0.08],
    [2.92, -0.62, 0.4],
    [3.45, -0.28, 0.56],
  ],
  [
    [0.82, -1.08, 1.12],
    [1.54, -0.92, 1.42],
    [2.2, -0.72, 1.3],
  ],
]

export function createDataPointPositions(count: number): SceneVector3[] {
  return Array.from({ length: count }, (_, index) => {
    const lane = index % 6
    const depth = Math.floor(index / 6)
    const phase = index * 1.618

    return [
      -3.6 + lane * 1.4 + Math.sin(phase) * 0.16,
      -0.95 + (depth % 4) * 0.31 + Math.cos(phase * 0.7) * 0.08,
      -1.25 + (depth % 7) * 0.38 + Math.sin(phase * 0.4) * 0.12,
    ]
  })
}

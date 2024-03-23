import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame, clickEnd, keyDown, keyUp } from './state'
import { render, RenderProps } from './renderer'

const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)

const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }

const Canvas = ({ height, width }: { height: number; width: number }) => {
  
  const initialState: State = {
    pos: new Array(1).fill(1).map((_) => ({
      life: conf.BALLLIFE,
      coord: {
        x: randomInt(width - 120) + 60,
        y: randomInt(height - 120) + 60,
        dx: 4 * randomSign(),
        dy: 0,
      },
    })),
    player: {
      life: conf.PLAYERLIFE,
      coord: {
        x: conf.RADIUS * 3,
        y: height - conf.RADIUS,
        dx: 0,
        dy: 0,
      },
    },
    size: { height, width },
    endOfGame: true,
  }

  const ref = useRef<any>()
  const state = useRef<State>(initialState)
  const scaleRef = useRef<number>(1)
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const iterate = (ctx: CanvasRenderingContext2D) => {
    state.current = step(state.current)
    state.current.endOfGame = !endOfGame(state.current)
    render(ctx, {
      pos: posRef.current,
      scale: scaleRef.current,
    })(state.current)
    if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  }

  const onClick = (e: PointerEvent) => {
    console.log('click')
    state.current = click(state.current)(e)
  }

  const onClickEnd = (e: PointerEvent) => {
    console.log('click end')
    state.current = clickEnd(state.current)(e)
  }

  const onMove = (e: PointerEvent) => {
    state.current = mouseMove(state.current)(e)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    state.current = keyDown(state.current, event.key)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    state.current = keyUp(state.current)
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    ref.current.addEventListener('mousedown', onClick)
    ref.current.addEventListener('mouseup', onClickEnd)
    ref.current.addEventListener('mousemove', onMove)
    ref.current.addEventListener('mouseup', onClick)
    initCanvas(iterate)(ref.current)

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      
      ref.current.removeEventListener('mousedown', onClick)
      ref.current.removeEventListener('mouseup', onClickEnd)
      ref.current.removeEventListener('mousemove', onMove)
      ref.current.removeEventListener('mouseup', onClick)
    }
  }, [])

  return <canvas {...{ height, width, ref }} />
}

export default Canvas

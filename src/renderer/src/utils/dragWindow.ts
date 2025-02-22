const useDrag = (): { onMouseDown: (e: MouseEvent) => void } => {
  let animationId
  let mouseX
  let mouseY
  let clientWidth = 0
  let clientHeight = 0
  let draggable = true

  const onMouseDown = (e: MouseEvent): void => {
    // 右击不移动，只有左击的时候触发
    if (e.button === 2) return
    draggable = true
    // 记录位置
    mouseX = e.clientX
    mouseY = e.clientY
    // 记录窗口大小
    if (Math.abs(document.documentElement.clientWidth - clientWidth) > 5) {
      clientWidth = document.documentElement.clientWidth
    }
    if (Math.abs(document.documentElement.clientHeight - clientHeight) > 5) {
      clientHeight = document.documentElement.clientHeight
    }
    // 注册 mouseup 事件
    document.addEventListener('mouseup', onMouseUp)
    // 启动通信
    animationId = requestAnimationFrame(moveWindow)
  }
  const onMouseUp = (): void => {
    // 释放锁
    draggable = false
    // 取消注册 mouseup 事件
    document.removeEventListener('mouseup', onMouseUp)
    // 清除定时器
    cancelAnimationFrame(animationId)
  }
  const moveWindow = (): void => {
    // 传给主进程位置信息
    window.electron.ipcRenderer.send('msg-trigger', {
      type: 'windowMoving',
      data: { mouseX, mouseY, width: clientWidth, height: clientHeight }
    })
    if (draggable) {
      animationId = requestAnimationFrame(moveWindow)
    }
  }

  return { onMouseDown }
}

export default useDrag

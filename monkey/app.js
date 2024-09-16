
  function init() { 

    const settings = {
      handlePos: null,
      index: 0,
      nearestIndex: 0,
    }

    const monkey = {
      el: document.querySelector('.monkey'),
      x: 44,
      y: 0,  
      alternate: false,
    }

    const wrapper = document.querySelector('.wrapper')

    const setStyles = ({ el, x, y, deg }) =>{
      el.style.transform = `translate(${x ? `${x}px` : 0}, ${y ? `${y}px` : 0}) rotate(${deg || 0}deg)`
    }

    const createHandles = (y, n) => {
      const handles = {
        el: Object.assign(document.createElement('div'), 
        { 
          className: 'outer-handle-wrapper',
          innerHTML: new Array(n).fill('').map(()=> {
            return `<div class="handle-wrapper">
                      <div class="handle"></div>
                    </div>`
          }).join('')
        }),
      }
      handles.el.style.top = `${y}px`
      wrapper.appendChild(handles.el)
    }

  ;[
    [300, 5],
    [150, 3],
    [150, 4],
    [150, 2],
    [150, 4],
    [100, 2],
    [100, 5],
    [150, 2],
    [150, 4],
    [150, 3],
    [100, 2],
    [100, 5],
  ].map((itemA, indexA, arr) => {
    return [
      arr.map((itemB, indexB) => {
        const prevHandlesHeight = indexB === 0 ? 0 : arr[indexB - 1][1] * 20
        return indexB <= indexA ? itemB[0] + prevHandlesHeight : 0
      }).reduce((n, acc) => {
        return n + acc
      }, 0),
      itemA[1]
    ]
  }).forEach(itemC => createHandles(itemC[0], itemC[1]))

    const handles = document.querySelectorAll('.handle')

    const monkeyJump = ({ x, y }) => {
      monkey.el.classList[monkey.x > x ? 'add' : 'remove']('reverse')
      monkey.el.classList[monkey.alternate ? 'add' : 'remove']('alternate')
      monkey.alternate = !monkey.alternate
      monkey.x = x
      monkey.el.style.setProperty(
        '--jump-height', (monkey.y - y) > 80 ? `${y - monkey.y - 10}px` : '-50px'
      )
      monkey.y = y
      setStyles(monkey)

      monkey.el.classList.add('jump')
      setTimeout(()=> {
        monkey.el.classList.remove('jump')
      }, 500)
    }

    const getHandlePos = () => {
      return [...handles].map(handle => {
        const { x, y } = handle.getBoundingClientRect()
        return { 
          x: x + window.scrollX, 
          y: y + window.scrollY
        }
      })
    }
    settings.handlePos = getHandlePos()

    window.addEventListener('resize', ()=> {
      settings.handlePos = getHandlePos()
      const { x, y } = settings.handlePos[settings.index]
      monkeyJump({ x, y })
    })

    const getNearestHandleIndex = () => {
      const y = Math.round(window.scrollY + (window.innerHeight / 2))
      const nearestIndex = settings.handlePos.map((handle, i) => {
        return {
          i,
          diff: Math.abs(handle.y - y)
        }
      }).sort((a, b) => a.diff - b.diff)[0].i
      settings.nearestIndex = nearestIndex
    }

    setInterval(()=> {
      getNearestHandleIndex()
      if (settings.index === settings.nearestIndex) return
      const { x, y } = settings.handlePos[settings.index]
      monkeyJump({ 
        x: x + 5, 
        y: y + 5
      })
      if (settings.index > settings.nearestIndex && settings.index >= 0) {
        settings.index--
      } else if (settings.index < settings.nearestIndex && settings.index < handles.length - 1) {
        settings.index++
      }

      // document.querySelector('.indicator').innerHTML = `index:${settings.index} | settings.nearestIndex: ${settings.nearestIndex}`
    }, 700)

  }
  
  window.addEventListener('DOMContentLoaded', init)




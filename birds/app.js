window.addEventListener('DOMContentLoaded', () => {
  const randomN = max => Math.ceil(Math.random() * max)
  const radToDeg = rad => Math.round(rad * (180 / Math.PI))
  const nearestN = (x, n) => (x === 0 ? 0 : x - 1 + Math.abs(((x - 1) % n) - n))
  const px = n => `${n}px`

  const settings = {
    isResizing: false,
    resizeTimer: null,
  }

  const dirConfig = {
    0: ['up'],
    360: ['up'],
    45: ['d-up', 'right'],
    90: ['side', 'right'],
    135: ['d-down', 'right'],
    180: ['down'],
    225: ['d-down', 'left'],
    270: ['side', 'left'],
    315: ['d-up', 'left'],
  }

  // box order is reveresed, so is ordered bottom to top
  const boxes = [
    {
      top: ['s', 's'],
      text: 'scroll up  <br /><span>(slowly)</span>',
    },
    {
      top: ['m', 'm'],
      text: 'birds fly around based on your scroll position',
    },
    {
      top: ['m', 'm'],
      bottom: ['m'],
      text: 'keep going - more birds will join in',
    },
    {
      top: ['m', 'm'],
      bottom: ['m', 'm'],
      text: 'keep going...',
    },
    {
      top: ['m', 's', 'm'],
      bottom: ['m', 'm'],
      text: 'still keep going...',
    },
    {
      top: ['m', 's', 's', 'm'],
      bottom: ['m', 'm'],
      text: 'a bit more...',
    },
    {
      top: ['m', 's', 's', 'm'],
      bottom: ['m', 's', 'm'],
      text: "you're nearly there...",
    },
    {
      top: ['m', 's', 's', 's', 'm'],
      bottom: ['s', 's', 's'],
      text: "you've reached the end! <br/> <span>(if you scroll down, birds will fly down with you)</span>",
    },
  ]

  document.querySelector('.content-wrapper').innerHTML = boxes.reduce(
    a =>
      (a += `
        <section>
          <div></div>
          <p></p>
          <div></div>
        </section>`),
    '',
  )

  const sections = () =>
    [...document.querySelectorAll('section')].map((section, i) => ({
      section,
      y: section.getBoundingClientRect().top + window.scrollY,
      i,
    }))

  const sectionElements = sections().map(s => {
    const slots = s.section.querySelectorAll('div')
    if (boxes[s.i]?.top)
      slots[0].innerHTML = boxes[s.i].top.reduce(
        (a, b) => (a += `<div class="box ${b}"></div>`),
        '',
      )
    if (boxes[s.i]?.bottom)
      slots[1].innerHTML = boxes[s.i].bottom.reduce(
        (a, b) => (a += `<div class="box ${b}"></div>`),
        '',
      )
    s.section.querySelector('p').innerHTML = boxes[s.i].text
    return {
      boxes: s.section.querySelectorAll('.box'),
    }
  })

  class SpeechBubble {
    constructor(props) {
      Object.assign(this, {
        el: Object.assign(document.createElement('div'), {
          className: 'speech-bubble',
          innerHTML: '<div class="text-container"></div>',
        }),
        ...props,
      })
      this.el.childNodes[0].innerHTML = this.displayTextGradual(this.text)
      if (this.bird.bubble) this.bird.bubble.remove()
      this.bird.bubble = this
      this.bird.anchor.appendChild(this.el)
    }
    displayTextGradual(text, offset = 0) {
      return [...text].reduce(
        (acc, l, i) =>
          (acc +=
            l === '§'
              ? '\n'
              : `<span style="animation-delay: ${((i + offset) * 0.03).toFixed(
                  3,
                )}s">${l}</span>`),
        '',
      )
    }
    remove() {
      this.el.remove()
      this.bird.bubble = null
    }
  }

  class Bird {
    constructor(props) {
      Object.assign(this, {
        el: Object.assign(document.createElement('div'), {
          className: 'bird-wrapper',
          innerHTML: `
            <div class="bird">
              <div class="anchor"></div>
              <div class="head"></div>
              <div class="body"></div>
              <div class="wing left-wing"></div>
              <div class="wing right-wing"></div>
              <div class="legs">
                <div class="leg left-leg"></div>
                <div class="leg right-leg"></div>
              </div>
              <div class="tail"></div>
            </div>
          `,
        }),
        dirClasses: [],
        hopCount: 0,
        pos: { x: 0, y: 0 },
        hopInterval: null,
        twitchInterval: null,
        animationTimer: null,
        ...props,
      })
      this.setStyles()
      document.body.append(this.el)
      this.anchor = this.el.querySelector('.anchor')
    }
    setStyles() {
      const {
        el,
        pos: { x, y },
        w,
        h,
      } = this
      if (w) el.style.width = px(w)
      if (h) el.style.height = px(h)
      el.style.transform = `translate(${x ? px(x) : 0}, ${y ? px(y) : 0})`
    }
    setClasses() {
      this.el.className = `bird-wrapper ${
        this.isFlying ? 'fly' : ''
      } ${this.dirClasses.map(c => c).join(' ')}`
    }
    elAngle(pos) {
      const { x, y } = pos
      const angle = radToDeg(Math.atan2(this.pos.y - y, this.pos.x - x)) - 90
      const adjustedAngle = angle < 0 ? angle + 360 : angle
      return Math.round(adjustedAngle)
    }
    faceDirection(pos) {
      this.dirClasses = dirConfig[nearestN(this.elAngle(pos), 45)]
      this.setClasses()
    }
    get isFacingRight() {
      return this.el.classList.contains('right')
    }
    get isNearEdge() {
      const buffer = 30
      return this.isFacingRight
        ? Math.abs(this.pos.x - this.box.getBoundingClientRect().right) < buffer
        : Math.abs(this.pos.x - this.box.getBoundingClientRect().left) < buffer
    }
    turn() {
      this.dirClasses = this.dirClasses.map(d => {
        if (d === 'right') return 'left'
        if (d === 'left') return ' right'
        return d
      })
      this.setClasses()
    }
    hop() {
      if (this.isNearEdge) this.turn()
      this.el.classList.add('hop')
      this.dirClasses = ['side', this.isFacingRight ? 'right' : 'left']
      this.setClasses()
      this.hopCount = 0
      this.hopInterval = setInterval(() => {
        if (this.hopCount % 2 === 0) {
          this.pos.x += this.isFacingRight ? 10 : -10
          this.setStyles()
          this.el.classList.add('hop')
        } else {
          this.el.classList.remove('hop')
        }
        this.hopCount++

        if (this.hopCount === 5) {
          clearInterval(this.hopInterval)
          this.animationTimer = setTimeout(() => {
            this.el.classList.remove('hop')

            this.dirClasses = this.dirClasses.map(d => {
              return d === 'side'
                ? ['d-up', 'd-down', 'side'][Math.floor(Math.random() * 3)]
                : d
            })
            this.setClasses()
          }, 200)
        }
      }, 100)
    }
    tweet() {
      this.el.classList.add('tweet')
      new SpeechBubble({
        bird: this,
        text: 'tweet',
      })
      setTimeout(() => {
        this.el.classList.remove('tweet')
        this.bubble?.remove()
      }, 1000)
    }
    twitch() {
      this.twitchInterval = setInterval(() => {
        this.el.className = `bird-wrapper pos-${randomN(3)} ${this.dirClasses
          .map(c => c)
          .join(' ')}`
      }, 800)
    }
    flyToPos(i, alwaysFly = false) {
      if (this.isFlying || this.isHopping || !birds[i]) return
      const index =
        i % 2 === 0 ? sectionElements[i].boxes.length - this.id - 1 : this.id
      this.box = sectionElements[i].boxes[index]
      if (!this.box) return

      clearInterval(this.twitchInterval)
      const { top, left, width } = this.box.getBoundingClientRect()

      const newPos = {
        x: left + width / 2 + window.scrollX,
        y: top + window.scrollY - 17,
      }

      if (!alwaysFly && this.pos.y === newPos.y) {
        this.isHopping = true

        this.animationTimer = setTimeout(() => {
          Math.random() < 0.9
            ? this.twitch()
            : Math.random() < 0.7
            ? this.hop()
            : this.tweet()
          clearTimeout(this.animationTimer)
          this.animationTimer = setTimeout(() => {
            this.isHopping = false
          }, 1000)
        }, randomN(200))
        return
      }

      this.faceDirection(newPos)
      this.pos = newPos

      this.setStyles()
      this.el.classList.add('fly')
      this.isFlying = true
      this.zone = i
      clearTimeout(this.animationTimer)
      this.animationTimer = setTimeout(() => {
        this.el.classList.remove('fly')
        this.isFlying = false
        this.dirClasses =
          dirConfig[[135, 180, 225][Math.floor(Math.random() * 3)]]
        this.twitch()
      }, 2000)
    }
  }

  const birds = new Array(8).fill('').map(
    (_, i) =>
      new Bird({
        id: i,
        pos: { x: -100, y: window.innerHeight + window.scrollY - 200 },
      }),
  )

  setTimeout(() => {
    birds.forEach((bird, i) => bird.flyToPos(i))
  }, 200)

  setTimeout(() => {
    window.scrollTo(
      0,
      document.querySelector('.wrapper').getBoundingClientRect().height,
    )
  }, 100)

  const getIndex = () => {
    return sections().find(b => b.y < window.scrollY + window.innerHeight / 2)
      ?.i
  }

  const flyToPositions = (bird, index, i, alwaysFly = false) => {
    if (birds[index] && i <= sectionElements[index].boxes.length) {
      bird.flyToPos(index, alwaysFly)
    } else {
      bird.flyToPos(i, alwaysFly)
    }
  }

  setInterval(() => {
    if (settings.isResizing) return
    const index = getIndex()
    if (!isNaN(index))
      birds.forEach((bird, i) => {
        flyToPositions(bird, index, i)
      })
  }, 1000)

  window.addEventListener('resize', () => {
    settings.isResizing = true
    clearTimeout(settings.resizeTimer)
    const index = getIndex()
    birds.forEach((bird, i) => {
      bird.isHopping = false
      bird.isFlying = false
      clearTimeout(bird.animationTimer)
      flyToPositions(bird, index, i, true)
    })
    settings.resizeTimer = setTimeout(() => {
      settings.isResizing = false
    }, 100)
  })

  // window.addEventListener('mousemove', e => {
  //   birds.forEach(bird => {
  //     bird.dirClasses =
  //       dirConfig[
  //         nearestN(
  //           bird.elAngle({
  //             x: e.pageX,
  //             y: e.pageY,
  //           }),
  //           45,
  //         )
  //       ]
  //     bird.el.className = `bird-wrapper ${bird.dirClasses
  //       .map(c => c)
  //       .join(' ')}`
  //   })

  //   // indicator.innerHTML = `${bird.dirClasses.join('-')}`
  // })
})

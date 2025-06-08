function init() { 
  const wrapper = document.querySelector('.wrapper')
  const pos = { x: null, y: null }

  const cat = {
    wrapper: document.querySelector('.cat-wrapper'),
    el: document.querySelector('.cat'),
    jumpCount: 0,
    walk() { 
      this.el.classList.add('walk') 
    },
    handleMotion(e) {
      ;['X', 'Y'].forEach(param => {
        pos[param.toLowerCase()] = e.targetTouches ? e.targetTouches[0][`offset${param}`] : e[`page${param}`]
      })
      cat.el.classList.remove('first-pose')
      this.walk()
    },
    get turnRight() {
      return this.el.getBoundingClientRect().x < pos.x
    },
    turn() {
      this.el.style.left = `${pos.x + (this.turnRight ? -90 : 10)}px`
      this.wrapper.classList[this.turnRight ? 'remove' : 'add']('face-left')
      this.wrapper.classList[this.turnRight ? 'add' : 'remove']('face-right')
    },
    jump() {
      this.wrapper.classList.remove('jump')
      if (pos.y < (wrapper.clientHeight - 250)) {
        setTimeout(()=> {
          this.wrapper.classList.add('jump')
        }, 100)
      } 
    },
    decideStop(){
      if (
        !this.turnRight && pos.x + 10 === this.el.offsetLeft || 
        this.turnRight && pos.x - 90 === this.el.offsetLeft
        ) {
          this.wrapper.classList.remove('walk')  
      }
    }
  }
  
  setInterval(()=> {
    if (!pos.x || !pos.y) return
    cat.turn()
    cat.el.classList[pos.y > (wrapper.clientHeight - 100) ? 'add' : 'remove']('head-down')
    cat.decideStop()
    cat.jumpCount += 100
    if (cat.jumpCount === 1000) {
      cat.jumpCount = 0
      cat.jump()
    }
  }, 100)

  ;['mousemove', 'click'].forEach(action => document.addEventListener(action, e => cat.handleMotion(e)))
}

window.addEventListener('DOMContentLoaded', init)




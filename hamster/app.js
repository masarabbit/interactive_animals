
  function init() { 
    const wrapper = document.querySelector('.wrapper')
    const wheel = document.querySelector('.wheel')
    const defaultHamsterEnergy = 1000
    const hamster = {
      energy: defaultHamsterEnergy,
      speedFactor: 4,
      isRunning: true,
    }

    const setSpeed = () => {
      wrapper.style.setProperty('--hamster-speed', `${1 / hamster.speedFactor}s`)
      wrapper.style.setProperty('--wheel-speed', `${2 / hamster.speedFactor}s`)
      wrapper.style.setProperty('--wheel-angle', `${0.4 * hamster.speedFactor}deg`)
    }

    document.querySelector('input').addEventListener('input', e => {
      hamster.speedFactor = e.target.value
      setSpeed()
    })

    setInterval(()=> {
      if (hamster.isRunning) {
        hamster.energy -= (hamster.speedFactor * hamster.speedFactor)
      }
      if (hamster.isRunning && hamster.energy < 0) {
        hamster.isRunning = false
        wheel.classList.add('spinning')
        setTimeout(()=> {
          hamster.energy = defaultHamsterEnergy
          hamster.isRunning = true
          wheel.classList.remove('spinning')
        }, 6 * 1000)
      }
    }, 500)

    setSpeed()
  }
  
  window.addEventListener('DOMContentLoaded', init)




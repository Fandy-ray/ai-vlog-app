const state = {
  type: 'study',
  style: 'study',
  health: null,
  types: [],
  styles: [],
  shotPlan: null,
  materials: [],
  result: null
}

function setState(patch = {}) {
  Object.keys(patch).forEach(key => {
    state[key] = patch[key]
  })

  return state
}

function resetFlow() {
  state.shotPlan = null
  state.materials = []
  state.result = null
}

export default {
  state,
  setState,
  resetFlow
}

import EventGenerator from 'APPSRC/helpers/EventGenerator'

function stateValidator (instance, rules) {
  // rules [{name, passPattern, errorMessage}, ...]
  return () => {
    const error = {}
    let errorFlag = false
    for (let index = rules.length - 1; index >= 0; index--) {
      const rule = rules[index]
      if (typeof instance.state[rule.name] === 'string' && !instance.state[rule.name].match(rule.passPattern)) {
        errorFlag |= true
        error[rule.name] = rule.errorMessage
      }
    }
    instance.setState({ error })
    return !errorFlag
  }
}

function codeValidator (instance, rules) {
  // rules [{name, exceptionCode, errorMessage}, ...]
  return (input) => {
    const error = {}
    for (let index = 0; index < rules.length; index++) {
      const rule = rules[index]
      if (rule.exceptionCode && rule.exceptionCode === input && rule.name) {
        error[rule.name] = rule.errorMessage
        instance.setState({ error })
        return false
      } else if (rule.exceptionCode && rule.exceptionCode === input && !rule.name) {
        instance.props.dispatchEvent(EventGenerator.NewNotification(rule.errorMessage, parseInt(rule.level) || 2))
        return false
      }
    }
    return true
  }
}

export default {
  stateValidator,
  codeValidator
}

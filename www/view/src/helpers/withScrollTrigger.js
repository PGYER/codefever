import React from 'react'

export default function (options) {
  return function (WrappedComponent) {
    return class extends React.Component {
      constructor (props) {
        super(props)
        this.target = null
        this.cancel = null
        this.onScroll = this.onScroll.bind(this)
        this.state = {
          scrollTrigger: false
        }
      }

      componentDidMount () {
        if (options.watching) {
          this.cancel && this.cancel()
          this.target = document.querySelector(options.watching)
          this.cancel = function () { this.target.removeEventListener('scroll', this.onScroll) }
          this.target.addEventListener('scroll', this.onScroll)
          this.onScroll({ target: this.target })
        }
      }

      componentWillUnmount () {
        this.cancel && this.cancel()
        this.cancel = null
        this.target = null
      }

      onScroll (ev) {
        const scrollAmount = ev.target.pageYOffset || ev.target.scrollTop
        if (scrollAmount > options.threshold && !this.state.scrollTrigger) {
          this.setState({ scrollTrigger: true })
        } else if (scrollAmount <= options.threshold && this.state.scrollTrigger) {
          this.setState({ scrollTrigger: false })
        }
      }

      render () {
        return <WrappedComponent ref={this.mountContainer} scrollTrigger={this.state.scrollTrigger} {...this.props} />
      }
    }
  }
}

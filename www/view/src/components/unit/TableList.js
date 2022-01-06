// core
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { withStyles, withTheme } from '@material-ui/core/styles'

// components
import { tableDataLabelParser } from 'APPSRC/helpers/VaribleHelper'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

// style
const styles = theme => ({})

class TableList extends Component {
  render () {
    const { data, intl } = this.props

    let inputData = data || [[], []]
    inputData = tableDataLabelParser(intl.formatMessage, inputData)

    return <Table>
      <TableHead>
        <TableRow>
          { inputData[1].map((name, index) => (<TableCell key={index} style={{ width: inputData[0][index] }}>
            <Typography variant='body1' component='span'>{name}</Typography>
          </TableCell>)) }
        </TableRow>
      </TableHead>
      <TableBody>
        {inputData.map((item, index) => {
          if (index > 1) {
            return (<TableRow key={index}>
              { item.map((row, rowid) => (<TableCell key={rowid}>{row}</TableCell>)) }
            </TableRow>)
          }
          return null
        })}
      </TableBody>
    </Table>
  }
}

TableList.propTypes = {
  // classes: PropTypes.object.isRequired,
  // theme: PropTypes.object.isRequired,
  data: PropTypes.array,
  intl: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default injectIntl(
  withTheme(
    withStyles(styles)(
      withRouter(
        connect(mapStateToProps, mapDispatchToProps)(TableList)
      )
    )
  )
)

import makePreset from '@pgyer/mui-theme-preset'

function makeTheme (originTheme) {
  const baseTheme = makePreset(originTheme, 'CodeFever')

  // export overwrite properties
  return {
    ...baseTheme,
    overrides: {
      ...baseTheme.overrides,
      MuiInputBase: {
        input: {
          ...baseTheme.overrides.MuiInputBase.input,
          backgroundColor: 'none'
        }
      },
      MuiMenuItem: {
        root: {
          ...baseTheme.overrides.MuiMenuItem.root,
          height: originTheme.spacing(4)
        }
      },
      MuiTableCell: {
        root: {
          borderBottom: '1px solid ' + baseTheme.palette.border,
          height: originTheme.spacing(5),
          paddingTop: 0,
          paddingBottom: 0,
          textAlign: 'left',
          flexDirection: 'row',
          '&:last-child': {
            textAlign: 'right',
            flexDirection: 'row-reverse'
          }
        }
      }
    }
  }
}

export default makeTheme

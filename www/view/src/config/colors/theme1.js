import makePreset from '@pgyer/mui-theme-preset'

function makeTheme (originTheme) {
  const baseTheme = makePreset(originTheme, 'CodeFever')

  // export overwrite properties
  baseTheme.typography.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
  baseTheme.palette.primary.main = '#3455db'
  baseTheme.typography.caption.fontSize = 14
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
      },
      MuiPaper: {
        root: {
          pointerEvents: 'auto'
        },
        elevation1: {
          boxShadow: 'none'
        },
        elevation2: {
          boxShadow: '0px 8px 16px 0px rgb(63 70 62 / 20%)'
        },
        elevation8: {
          boxShadow: '0 10px 40px rgb(14 32 66 / 15%), 0 1px 2px rgb(14 32 66 / 5%)'
        }
      },
      MuiTab: {
        ...baseTheme.overrides.MuiTab,
        root: {
          ...baseTheme.overrides.MuiTab.root,
          '&$selected': {
            fontWeight: 600
          }
        }
      }
    }
  }
}

export default makeTheme

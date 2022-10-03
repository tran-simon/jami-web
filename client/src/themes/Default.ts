import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      light: '#E5EEF5', // same as "#0056991A"
      main: '#0071C9',
      dark: '#005699',
    },
    error: {
      main: '#CC0022',
    },
    success: {
      main: '#009980',
    },
  },
  typography: {
    fontFamily: 'Ubuntu',
    allVariants: {
      color: 'black',
    },
    h1: {
      fontWeight: 400,
      fontSize: '26px',
      lineHeight: '36px',
    },
    h2: {
      fontWeight: 400,
      fontSize: '22px',
      lineHeight: '30px',
    },
    h3: {
      fontWeight: 400,
      fontSize: '18px',
      lineHeight: '26px',
    },
    h4: {
      fontWeight: 500,
      fontSize: '15px',
      lineHeight: '22px',
    },
    h5: {
      fontWeight: 500,
      fontSize: '13px',
      lineHeight: '19px',
    },
    body1: {
      fontWeight: 400,
      fontSize: '15px',
      lineHeight: '22px',
    },
    body2: {
      fontWeight: 400,
      fontSize: '13px',
      lineHeight: '19px',
    },
    caption: {
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-Th.ttf");
          font-weight: 100;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-L.ttf");
          font-weight: 300;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-LI.ttf");
          font-weight: 300;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-R.ttf");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-RI.ttf");
          font-weight: 400;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-M.ttf");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-MI.ttf");
          font-weight: 500;
          font-style: italic;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-B.ttf");
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: "Ubuntu";
          src: url("./fonts/Ubuntu-BI.ttf");
          font-weight: 700;
          font-style: italic;
        }
      `,
    },
  },
});

export default createTheme(theme, {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: '46px',
          fontWeight: 700,
          fontSize: '15px',
          lineHeight: '17px',
          textTransform: 'none',
          borderRadius: '5px',
        },
        sizeSmall: {
          height: '36px',
        },
        contained: {
          background: theme.palette.primary.dark,
          '&:hover': {
            background: theme.palette.primary.main,
          },
        },
        outlined: {
          background: '#FFF',
          borderColor: '#0056995C',
          color: theme.palette.primary.dark,
          '&:hover': {
            background: theme.palette.primary.light,
            borderColor: theme.palette.primary.dark,
          },
        },
        text: {
          background: '#fff',
          color: theme.palette.primary.dark,
          '&:hover': {
            background: theme.palette.primary.light,
          },
        },
      },
    },
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          width: '60px',
          height: '30px',
          padding: 0,
        },
        switchBase: {
          padding: 0,
          '&.Mui-checked': {
            transform: `translateX(30px)`,
          },
        },
        thumb: {
          width: '28px',
          height: '28px',
          border: `1px solid ${theme.palette.primary.dark}`,
          '.Mui-checked.Mui-checked &': {
            width: '30px',
            height: '30px',
            border: 'none',
          },
        },
        track: {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '30px',
          opacity: 1,
          '.Mui-checked.Mui-checked + &': {
            backgroundColor: theme.palette.primary.light,
            opacity: 1,
          },
        },
        colorPrimary: {
          color: '#fff',
          '&.Mui-checked': {
            color: theme.palette.primary.dark,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          color: theme.palette.primary.dark,
          '&.Mui-error': {
            color: theme.palette.error.main,
          },
        },
        underline: {
          /*
            Material UI uses "before" for the regular underline.
            There is a second underline called "after" placed over "before"
          */
          '&:before': {
            borderBottom: `2px solid ${theme.palette.primary.dark}`,
          },
          '&:hover:not(.Mui-disabled, .Mui-error):before': {
            borderBottom: '2px solid #03B9E9',
          },
          '&:after': {
            borderBottom: '2px solid #03B9E9',
          },
          '&:hover:not(.Mui-error):after': {
            borderBottom: '2px solid #03B9E9',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          height: '90px',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          position: 'absolute',
          bottom: '0px',
          fontSize: '15px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'black',
          fontSize: '15px',
          left: '50%',
          transform: 'translate(-50%, 20px)',
          transition: 'left .2s, transform .2s',
        },
        shrink: {
          color: 'black',
          left: 0,
          transform: 'translate(0, 50px) scale(0.75)',
          transition: 'left .2s, transform .2s',
          '&.Mui-focused, &.Mui-error': {
            color: 'black',
          },
        },
      },
    },
  },
});

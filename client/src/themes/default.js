import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      light: "#E5EEF5", // same as "#0056991A"
      main: "#0071C9",
      dark: "#005699",
    },
    error: {
      main: "#CC0022",
    },
    success: {
      main: "#009980",
    },
  },
})

export default createTheme(theme, {
  typography: {
    fontFamily: "Ubuntu",
    h1: {
      fontWeight: 400,
      fontSize: "26px",
      lineHeight: "36px",
    },
    h2: {
      fontWeight: 400,
      fontSize: "22px",
      lineHeight: "30px",
    },
    h3: {
      fontWeight: 400,
      fontSize: "18px",
      lineHeight: "26px",
    },
    h4: {
      fontWeight: 500,
      fontSize: "15px",
      lineHeight: "22px",
    },
    h5: {
      fontWeight: 500,
      fontSize: "13px",
      lineHeight: "19px",
    },
    body1: {
      fontWeight: 400,
      fontSize: "15px",
      lineHeight: "22px"
    },
    body2: {
      fontWeight: 400,
      fontSize: "13px",
      lineHeight: "19px",
    },
    caption: {
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: "46px",
          fontWeight: 700,
          fontSize: "15px",
          lineHeight: "17px",
          textTransform: "none",
        },
        sizeSmall: {
          height: "36px",
        },
        contained: {
          background: theme.palette.primary.dark,
          "&:hover": {
            background: theme.palette.primary.main,
          },
        },
        outlined: {
          background: "#FFF",
          borderColor: "#0056995C",
          color: theme.palette.primary.dark,
          "&:hover": {
            background: theme.palette.primary.light,
            borderColor: theme.palette.primary.dark,
          },
        },
        text: {
          background: "#fff",
          color: theme.palette.primary.dark,
          "&:hover": {
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
          width: "60px",
          height: "30px",
          padding: 0,
        },
        switchBase: {
          padding: 0,
          "&.Mui-checked": {
            transform: `translateX(30px)`,
          },
        },
        thumb: {
          width: "28px",
          height: "28px",
          border: `1px solid ${theme.palette.primary.dark}`,
          ".Mui-checked.Mui-checked &": {
            width: "30px",
            height: "30px",
            border: "none",
          }
        },
        track: {
          backgroundColor: theme.palette.primary.light,
          borderRadius: "30px",
          opacity: 1,
          ".Mui-checked.Mui-checked + &": {
            backgroundColor: theme.palette.primary.light,
            opacity: 1,
          }
        },
        colorPrimary: {
          color: "#fff",
          "&.Mui-checked": {
            color: theme.palette.primary.dark,
          },
        },
      },
    },
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
})

import { createTheme } from "@mui/material";

export default createTheme({
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
          background: "#005699",
          "&:hover": {
            background: "#0071C9",
          },
        },
        outlined: {
          background: "#FFF",
          borderColor: "#0056995C",
          color: "#005699",
          "&:hover": {
            background: "#0056991A",
            borderColor: "#005699",
          },
        },
        text: {
          background: "#fff",
          color: "#005699",
          "&:hover": {
            background: "#0056991A",
          },
        },
      },
    },
    MuiTextField: {

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
          border: "1px solid #005699",
          ".Mui-checked.Mui-checked &": {
            width: "30px",
            height: "30px",
            border: "none",
          }
        },
        track: {
          backgroundColor: "#0056991A",
          borderRadius: "30px",
          opacity: 1,
          ".Mui-checked.Mui-checked + &": {
            backgroundColor: "#0056991A",
            opacity: 1,
          }
        },
        colorPrimary: {
          color: "#fff",
          "&.Mui-checked": {
            color: "#005699",
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
});

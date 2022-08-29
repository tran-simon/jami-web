import { SvgIcon } from "@mui/material"

/*
    We use SvgIcon so the icons can be handled more easily by Material ui components.
    Here some tips to add an SvgIcon in case you too struggle to find informations online:
    - Open the svg with https://jakearchibald.github.io/svgomg/ in order to clean it from useless information.
    - Replace the <svg> tag for <SvgIcon>.
    - Try removing "style" attributes. They are often uncessary and cause errors.
    - If some "style" attributes are necessary, convert them to the React inline style syntax (https://reactjs.org/docs/dom-elements.html#style).
    - Play with the viewBox attribute in order to center the icon and make it uses all available space. Adding a temporary border with inline style might help.
*/

export const ArrowIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 -3 20 20">
                <g>
                    <path d="M0.302825536,7.53652162 L6.27862638,13.4439361 L6.37822306,13.542393 C6.77660979,13.9362206 7.47378655,13.8377637 7.77257659,13.4439361 C8.07136664,13.0501085 8.07136664,12.3609101 7.67297991,12.0655394 L3.39032264,7.83189235 L18.9274048,7.83189235 C19.5249849,7.83189235 19.9233716,7.43806472 19.9233716,6.84732327 C19.9233716,6.25658182 19.5249849,5.86275419 18.9274048,5.86275419 L3.39032264,5.86275419 L7.67297991,1.62910716 C7.97176996,1.23527953 7.97176996,0.742994993 7.67297991,0.349167363 C7.27459319,-0.0446602682 6.67701311,-0.143117176 6.27862638,0.250710455 L0.302825536,6.15812492 C0.00403549366,6.45349564 -0.0955611871,6.84732327 0.103632174,7.2411509 C0.103632174,7.33960781 0.203228855,7.43806472 0.302825536,7.53652162" id="Fill-1"></path>
                </g>
        </SvgIcon>
    )
}

export const CameraIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="2 3 20 19">
            <path d="M3.6 20.3c-.4 0-.8-.2-1.1-.5-.2-.2-.4-.6-.4-.9V7.7c-.1-.3.1-.7.4-1 .2-.3.5-.4.8-.5H7.9l1.2-2.5h5.7L16 6.2h4.3c.4 0 .8.2 1.1.5.2.2.4.6.4.9v11.2c0 .4-.2.8-.5 1.1-.2.2-.6.4-.9.4H3.6zm0-12.6-.1 11v.1h17.1V7.7h-5.3L14 5.2h-4L8.8 7.7H3.6zm8.4 9.7c-1.2 0-2.3-.5-3.2-1.3-.8-.8-1.3-2-1.3-3.2 0-1.2.5-2.3 1.3-3.2.8-.8 2-1.3 3.2-1.3 1.2 0 2.3.5 3.2 1.3.8.8 1.3 2 1.3 3.2s-.5 2.3-1.3 3.2c-.9.8-2 1.3-3.2 1.3zm0-7.5c-.8 0-1.6.3-2.1.9S9 12.1 9 12.9s.3 1.6.9 2.1c1.1 1.1 3.1 1.1 4.3 0 .6-.6.9-1.3.9-2.1s-.3-1.6-.9-2.1c-.6-.6-1.4-.9-2.2-.9z"/>
        </SvgIcon>
    )
}

export const CancelIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="2 2 20 20">
            <path d="M12 2C6.4771525 2 2 6.4771525 2 12s4.4771525 10 10 10 10-4.4771525 10-10S17.5228475 2 12 2Zm0 1.33333168c2.0746076-.00128199 4.079864.74684198 5.6466667 2.10666832L5.39333333 17.5933333c-2.17561675-2.5749862-2.66070945-6.17789412-1.2436087-9.23660098C5.56682538 5.29802546 8.62897124 3.33855529 12 3.33333168Zm0 17.33333502c-2.08385186-.000638-4.09692832-.7561338-5.66666667-2.1266667L18.5866667 6.38c2.1903962 2.57136307 2.6872505 6.1810635 1.2730136 9.2485834C18.4454435 18.6961032 15.3778286 20.6624553 12 20.6666667Z"/>
        </SvgIcon>
    )
}

export const CheckedIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 16 16">
            <path d="M11.138 5.152 6.802 9.486l-1.936-1.94a.64205296.64205296 0 0 0-.908.908l2.39 2.394a.642.642 0 0 0 .908 0l4.79-4.785a.6431145.6431145 0 0 0-.908-.911Z"/>
            <path d="M8 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8ZM8 1.284A6.716 6.716 0 1 0 14.716 8 6.723 6.723 0 0 0 8 1.284Z"/>
        </SvgIcon>
    )
}

export const CrossedEyeIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 15.931 12.145">
            <path d="M7.933 10.41a7.081 7.081 0 0 1-3.7-1.292 12.409 12.409 0 0 1-2.874-2.717.237.237 0 0 1 0-.366 14.122 14.122 0 0 1 2.429-2.372L3 2.873a14.6 14.6 0 0 0-2.836 2.93.629.629 0 0 0 .019.87 13.62 13.62 0 0 0 4.222 3.834 7.4 7.4 0 0 0 3.547 1 7.067 7.067 0 0 0 2.948-.711l-.848-.848a5.577 5.577 0 0 1-2.119.462ZM15.74 5.784a13.154 13.154 0 0 0-4.26-3.856A7.284 7.284 0 0 0 8.145.941a6.436 6.436 0 0 0-2.892.6l.848.848a5.691 5.691 0 0 1 1.793-.348 5.788 5.788 0 0 1 2.583.617 11.437 11.437 0 0 1 3.586 2.783c.193.212.347.424.54.636a.209.209 0 0 1 .019.289 13.993 13.993 0 0 1-2.256 2.275l.79.79a14.6 14.6 0 0 0 2.6-2.737.658.658 0 0 0-.016-.91Z"/>
            <path d="m9.687 5.974 1 1a3.349 3.349 0 0 0 .1-.752 2.867 2.867 0 0 0-2.835-2.848 2.576 2.576 0 0 0-.771.116l1.022 1.021a1.738 1.738 0 0 1 1.484 1.463ZM5.311 5.205a2.6 2.6 0 0 0-.193 1.022A2.867 2.867 0 0 0 7.971 9.06a3.005 3.005 0 0 0 1.022-.193l-.906-.906h-.135a1.749 1.749 0 0 1-1.734-1.773v-.077ZM2.882.173A.514.514 0 0 0 2.493 0a.659.659 0 0 0-.556.386.49.49 0 0 0 .135.578l11.007 11.007a.514.514 0 0 0 .386.173.659.659 0 0 0 .559-.386.49.49 0 0 0-.131-.577Z"/>
        </SvgIcon>
    )
}

export const CrossIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="5 5 14 14">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </SvgIcon>
    )
}

export const EyeIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 15.931 10.568">
            <path d="M7.933 9.469a7.081 7.081 0 0 1-3.7-1.292A12.409 12.409 0 0 1 1.359 5.46a.237.237 0 0 1 0-.366c.733-.892 3.322-3.276 4.685-3.702l-.791-.79a18.682 18.682 0 0 0-5.089 4.26.629.629 0 0 0 .019.867 13.62 13.62 0 0 0 4.222 3.837 7.4 7.4 0 0 0 3.547 1 7.067 7.067 0 0 0 2.948-.711l-.847-.853a5.577 5.577 0 0 1-2.12.467Z"/>
            <path d="M15.74 4.843A13.154 13.154 0 0 0 11.48.987 7.284 7.284 0 0 0 8.145 0a6.436 6.436 0 0 0-2.892.6l.848.848A5.691 5.691 0 0 1 7.894 1.1a5.788 5.788 0 0 1 2.583.617A11.437 11.437 0 0 1 14.063 4.5c.193.212.347.424.54.636a.209.209 0 0 1 .019.289 17.151 17.151 0 0 1-4.627 3.6l.79.79a21.4 21.4 0 0 0 4.973-4.067.658.658 0 0 0-.018-.905Z"/>
            <g transform="translate(4.952 1.963)" style={{"stroke": "#005699", "fill": "none"}}>
                <circle cx="3" cy="3" r="3" style={{"stroke": "none"}}/>
                <circle cx="3" cy="3" r="2.5"/>
            </g>
        </SvgIcon>
    )
}

export const FolderIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 17.504 14.812">
            <path d="M15.484 14.812H2.02a.675.675 0 0 1-.666-.578L.007 4.809a.674.674 0 0 1 .665-.769h.673V.673A.674.674 0 0 1 2.02 0h4.039a.676.676 0 0 1 .373.113l1.85 1.233h7.2a.674.674 0 0 1 .673.673v2.02h.673a.675.675 0 0 1 .667.769l-1.346 9.426a.677.677 0 0 1-.665.578ZM1.449 5.387 2.6 13.466h12.3l1.154-8.079Zm1.244-4.04v2.692h12.118V2.693H8.078A.677.677 0 0 1 7.7 2.58L5.855 1.346Z"/>
        </SvgIcon>
    )
}

export const InfoIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="2 2 20 20">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </SvgIcon>
    )
}

export const LockIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 12.727 15.636">
            <path d="M10.727 15.636H2a2 2 0 0 1-2-2V7.454a2 2 0 0 1 2-2h8.727a2 2 0 0 1 2 2v6.182a2 2 0 0 1-2 2ZM2 6.545a.91.91 0 0 0-.909.909v6.182a.91.91 0 0 0 .909.909h8.727a.908.908 0 0 0 .909-.909V7.454a.908.908 0 0 0-.909-.909Z"/>
            <path d="M10.363 6.546h-8A.546.546 0 0 1 1.818 6V4.181a4.048 4.048 0 0 1 1.35-2.974A4.73 4.73 0 0 1 6.364 0a4.729 4.729 0 0 1 3.195 1.207 4.048 4.048 0 0 1 1.35 2.974V6a.546.546 0 0 1-.546.546Zm-4-5.455a3.645 3.645 0 0 0-2.462.923 2.918 2.918 0 0 0-.993 2.167v1.274h6.91V4.181a2.918 2.918 0 0 0-.993-2.167 3.644 3.644 0 0 0-2.461-.923ZM6.363 11.272a1.636 1.636 0 1 1 1.636-1.636 1.638 1.638 0 0 1-1.636 1.636Zm0-2.182a.545.545 0 1 0 .545.545.546.546 0 0 0-.545-.544Z"/>
            <path d="M5.818 10.727v1.819a.5455.5455 0 1 0 1.091 0v-1.819a.5455.5455 0 0 0-1.091 0Z"/>
        </SvgIcon>
    )
}

export const PenIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 14.863 14.863">
            <path d="m0 14.863.025-5.4L9.49 0l5.373 5.388-3.941 3.941-.711-.715.918-.913-3.967-3.966-6.123 6.129v3.966H5l2.959-2.958.71.715L5.4 14.838ZM9.49 1.426l-1.6 1.6 3.946 3.946 1.6-1.6L9.49 1.427Z"/>
        </SvgIcon>
    )
}

export const PersonIcon = (props) => {
    return (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <g stroke="#03B9E9" strokeWidth="1.75" fill="none" fillRule="evenodd" strokeLinejoin="round">
            <path d="M17 6.5c0 2.48522308-2.0147769 4.5-4.5 4.5C10.01477692 11 8 8.98522308 8 6.5 8 4.0147769 10.01477692 2 12.5 2 14.9852231 2 17 4.0147769 17 6.5ZM3 22c0-5.5228267 4.02947764-10 9.00005436-10C16.9705224 12 21 16.4771733 21 22"/>
        </g>
    </SvgIcon>
    )
}

export const RoundCrossIcon = (props) => {
    return (
        <SvgIcon {...props} viewBox="0 0 16 16">
            <path d="M8 16a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8ZM8 .888A7.112 7.112 0 1 0 15.112 8 7.12 7.12 0 0 0 8 .888Z"/>
            <path d="M10.837 5.167a.444.444 0 0 0-.628 0l-2.2 2.2-2.214-2.2a.44406306.44406306 0 0 0-.628.628l2.2 2.2-2.2 2.2a.44904009.44904009 0 0 0 .628.642l2.2-2.2 2.2 2.2a.4507918.4507918 0 1 0 .642-.633l-2.2-2.2 2.2-2.209a.445.445 0 0 0 0-.628Z"/>
        </SvgIcon>
    )
}

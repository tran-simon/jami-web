import { Button, Stack, Switch, ThemeProvider, Typography } from "@mui/material"
import { CancelButton, EditButton, UploadButton, TakePictureButton, InfoButton, TipButton, BackButton, CloseButton } from "../components/buttons"
import { NickNameInput, PasswordInput, RegularInput, UsernameInput } from "../components/inputs"
import defaultTheme from './default'

export const ThemeDemonstrator = () => {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Stack spacing="5px">
                <Stack>
                    <Typography variant="h1">Exemple de titre H1</Typography>
                    <Typography variant="h2">Exemple de titre H2</Typography>
                    <Typography variant="h3">Exemple de titre H3</Typography>
                    <Typography variant="h4">Exemple de titre H4</Typography>
                    <Typography variant="h5">Exemple de titre H5</Typography>
                    <Typography variant="body1">Texte courant principal</Typography>
                    <Typography variant="body2">Texte courant secondaire</Typography>
                    <Typography variant="caption">Légendes et annotations</Typography>
                </Stack>
                <Stack spacing="5px" padding="5px" width="300px" >
                    <Button variant="contained">Bouton primaire</Button>
                    <Button variant="outlined">Bouton secondaire</Button>
                    <Button variant="text">Bouton tertiaire</Button>
                    <Button variant="contained" size="small">Bouton liste préférences</Button>
                </Stack>
                <Stack direction="row" spacing="5px">
                    <CancelButton/>
                    <EditButton/>
                    <UploadButton/>
                    <TakePictureButton/>
                </Stack>
                <Stack direction="row" spacing="5px">
                    <InfoButton/>
                    <TipButton/>
                </Stack>
                <Stack direction="row" spacing="5px">
                    <BackButton/>
                    <CloseButton/>
                </Stack>
                <Stack>
                    <Switch/>
                </Stack>
                <Stack padding="5px" width="300px" >
                    <UsernameInput/>
                    <UsernameInput
                        error
                        defaultValue="Cyrille"
                    />
                    <PasswordInput/>
                    <PasswordInput
                        error
                        defaultValue="SavoirFaireLinux"
                    />
                    <NickNameInput/>
                    <RegularInput/>
                </Stack>
            </Stack>
        </ThemeProvider>
    )
}
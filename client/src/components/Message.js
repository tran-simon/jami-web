import { Box, Chip, Divider, Stack, Typography } from "@mui/material"
import dayjs from "dayjs"
import isToday from "dayjs/plugin/isToday"
import isYesterday from "dayjs/plugin/isYesterday"
import React from "react"
import { useTranslation } from "react-i18next"
import ConversationAvatar from "./ConversationAvatar"

dayjs.extend(isToday)
dayjs.extend(isYesterday)

export const MessageCall = (props) => {
  return (
    <Stack
      alignItems="center"
    >
      "Appel"
    </Stack>
  )
}

export const MessageInitial = (props) => {
  const { t } = useTranslation()
  return (
    <Stack
      alignItems="center"
    >
      {t("message_swarm_created")}
    </Stack>
  )
}

export const MessageDataTransfer = (props) => {
  return (
    <MessageBubble
      backgroundColor={"#E5E5E5"}
      position={props.position}
      isFirstOfGroup={props.isFirstOfGroup}
      isLastOfGroup={props.isLastOfGroup}
    >
      "data-transfer"
    </MessageBubble>
  )
}

export const MessageMember = (props) => {
  const { t } = useTranslation()
  return (
    <Stack
      alignItems="center"
    >
      <Chip
        sx={{
          width: "fit-content",
        }}
        label={t("message_user_joined", {user: props.message.author})}
      />
    </Stack>
  )
}

export const MessageMerge = (props) => {
  return (
    <Stack
      alignItems="center"
    >
      "merge"
    </Stack>
  )
}

export const MessageText = (props) => {
  return (
    <MessageBubble
      backgroundColor={props.bubbleColor}
      position={props.position}
      isFirstOfGroup={props.isFirstOfGroup}
      isLastOfGroup={props.isLastOfGroup}
    >
      <Typography variant="body1" color={props.textColor} textAlign={props.position}>
        {props.message.body}
      </Typography>
    </MessageBubble>
  )
}

export const MessageDate = ({time}) => {
  let textDate

  if (time.isToday()) {
    textDate = "Today"
  }
  else if (time.isYesterday()) {
    textDate = "Yesterday"
  }
  else {
    const date = time.date().toString().padStart(2,'0')
    const month = (time.month()+1).toString().padStart(2,'0')
    textDate = `${date}/${month}/${time.year()}`
  }

  return (
    <Box marginTop="30px" >
      <Divider
        sx={{
          ".MuiDivider-wrapper": {
            margin: 0,
            padding: 0,
          },
          "&::before": {
            borderTop: "1px solid #E5E5E5",
          },
          "&::after": {
            borderTop: "1px solid #E5E5E5",
          },
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          border="1px solid #E5E5E5"
          borderRadius="5px"
          padding="10px 16px"
        >
          {textDate}
        </Typography>
      </Divider>
    </Box>
  )
}

export const MessageTime = ({time, hasDateOnTop}) => {
  const hour = time.hour().toString().padStart(2,'0')
  const minute = time.minute().toString().padStart(2,'0')
  const textTime = `${hour}:${minute}`

  return (
    <Stack
      direction="row"
      justifyContent="center"
      margin="30px"
      marginTop={hasDateOnTop ? "20px" : "30px"}
    >
      <Typography
        variant="caption"
        color="#A7A7A7"
        fontWeight={700}
      >
        {textTime}
      </Typography>
    </Stack>
  )
}

export const MessageBubblesGroup = (props) => {
  const isUser = false // should access user from the store
  const position = isUser ? "end" : "start"
  const bubbleColor = isUser ? "#005699" : "#E5E5E5"
  const textColor = isUser ? "white" : "black"

  return (
    <Stack // Row for a group of message bubbles with the user's infos
      direction="row"
      justifyContent={position}
      alignItems="end"
      spacing="10px"
    >
      {
        !isUser
        &&
          <ConversationAvatar
            displayName="TempDisplayName"
            sx={{ width: "22px", height: "22px", fontSize: "15px" }}
          />
      }
      <Stack // Container to align the bubbles to the same side of a row
        width="66.66%"
        alignItems={position}
      >
        <ParticipantName
          name={props.messages[0]?.author}
          position={position}
        />
        <Stack // Container for a group of message bubbles
          spacing="6px"
          alignItems={position}
          direction="column-reverse"
        >
          {props.messages.map(
            (message, index) => {
              let Component
              switch (message.type) {
                case "text/plain":
                  Component = MessageText
                  break
                case "application/data-transfer+json":
                  Component = MessageDataTransfer
                  break
              } 
              return (
                <Component // Single message
                  key={message.id} 
                  message={message}
                  textColor={textColor}
                  position={position}
                  bubbleColor={bubbleColor}
                  isFirstOfGroup={index == props.messages.length-1}
                  isLastOfGroup={index == 0}
                />
              )
            }
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

const MessageBubble = (props) => {
  const largeRadius = "20px"
  const smallRadius = "5px"
  const radius = React.useMemo(() => {
    if (props.position == "start") {
      return {
        borderStartStartRadius: props.isFirstOfGroup ? largeRadius : smallRadius,
        borderStartEndRadius: largeRadius,
        borderEndStartRadius: props.isLastOfGroup ? largeRadius : smallRadius,
        borderEndEndRadius: largeRadius,
      }
    }
    return {
      borderStartStartRadius: largeRadius,
      borderStartEndRadius: props.isFirstOfGroup ? largeRadius : smallRadius,
      borderEndStartRadius: largeRadius,
      borderEndEndRadius: props.isLastOfGroup ? largeRadius : smallRadius,
    }
  }, [props.isFirstOfGroup, props.isLastOfGroup, props.position])

  return (
    <Box
      sx={{
        width: "fit-content",
        backgroundColor: props.backgroundColor,
        padding: "16px",
        ...radius,
      }}
    >
      {props.children}
    </Box>
  )
}

const ParticipantName = (props) => {
  return (
    <Box
      marginBottom="6px"
      marginLeft="16px"
      marginRight="16px"
    >
      <Typography
        variant="caption"
        color="#A7A7A7"
        fontWeight={700}
      >
        {props.name}
      </Typography>
    </Box>
  )
}
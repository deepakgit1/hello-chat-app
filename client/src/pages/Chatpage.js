import { Box } from "@chakra-ui/react"
import ChatBox from "../components/ChatBox";
import SideDrawer from "../components/miscellenious/SideDrawer";
import MyChats from "../components/MyChats";
import { ChatState } from "../context/ChatProvider"
import React, { useEffect, useState } from 'react'


const Chatpage = () => {
  const { user } = ChatState()
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        d="flex"
        justifyContent={"space-between"}
        w="100%"
        h="91.5vh"
        p="10px"
        background={"#ACFBFF"}
      >
        {user && (<MyChats fetchAgain={fetchAgain} />
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}

      </Box>
    </div>
  )
};

export default Chatpage
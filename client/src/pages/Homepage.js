import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Login from '../components/authentication/Login'
import Signup from '../components/authentication/Signup'

const Homepage = () => {
    const history = useHistory();

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("userInfo"));
  
      if (user) history.push("/chats");
    }, [history]);
  

    return (
        <Container maxW='2xl' centerContent>
            <Box
                d="flex"
                justifyContent="center"
                p={3}
                bg="#F0F6FE "
                w="100%"
                m="40px 0 15px 0"
                borderRadius="lg"
                borderWidth="1px"
            >
                <Text fontSize="4xl" fontFamily="Josefin Sans" fontWeight={"bold"}>
                    Hello-Chat
                </Text>
            </Box>
            <Box bg="white" w="100%" p={4} borderRadius="lg" color={"black"} borderWidth="1px">
                <Tabs variant='soft-rounded'>
                    <TabList mb="1em">
                        <Tab width={"50%"}>Login</Tab>
                        <Tab width={"50%"}>Signup</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                           <Login/>
                        </TabPanel>
                        <TabPanel>
                            <Signup/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    )
}

export default Homepage
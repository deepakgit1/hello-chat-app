import {
    Avatar, Box, Button, Drawer, DrawerBody,
    DrawerContent, DrawerHeader, DrawerOverlay,
    Input, Menu, MenuButton, MenuDivider, MenuItem,
    MenuList, Spinner, Text, toast, Tooltip,
    useDisclosure, useToast
} from '@chakra-ui/react';
import React, { useState } from 'react'
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { Effect } from "react-notification-badge";
import { getSender } from '../../config/ChatLogic';
import NotificationBadge from "react-notification-badge";

const SideDrawer = () => {
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState()
    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState()
    const history = useHistory()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()

    const logoutHandle = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    }
    
    const handleSearch = async (search) => {
        if (!search) {
            toast({
                title: "Please Enter something in search",
                status: "warning",
                duration: 2000,
                isClosable: true,
                position: "top-right",
            });
            return "";
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const accessChat = async (userId) => {
        console.log(userId);
    
        try {
          setLoadingChat(true);
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.post(`/api/chat`, { userId }, config);
    
          if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title: "Error fetching the chat",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };

    return (
        <>
            <Box
                d="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px"
                borderRadius={"md"}
                borderColor="#ECF4FF"
                background={"#69A7FF"}
            >
                <Tooltip label="Search user to chat" hasArrow placement='bottom-end'>
                    <Button variant={"ghost"} onClick={onOpen}>
                        <i className="fas fa-search" onClick={onOpen}></i>
                        <Text d={{ base: "none", md: "flex" }} px="4" onClick={onOpen}>Search User here</Text>
                    </Button>
                </Tooltip >
                <Text fontSize="2xl" fontFamily="Josefin Sans" fontWeight={'bold'}>
                    Hello-Chat
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize={"2xl"} m="1" mr={3} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map(notif => (
                                <MenuItem key={notif._id} onClick={() => {
                                    setSelectedChat(notif.chat);
                                    setNotification(notification.filter((n) => n !== notif));
                                }}>
                                    {notif.chat.isGroupChat ? `New Message in ${notification.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size={"sm"} cursor="pointer" src={user.pic} />  
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandle}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={"1px"}>Search users</DrawerHeader>
                    <DrawerBody>
                        <Box d="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                // value={search}
                                onChange={(e) => handleSearch(e.target.value)} 
                            />
                            <Button
                                onClick={(e) => handleSearch(e.target.value)}
                            >Go</Button>
                        </Box>
                        {
                            loading ? (
                                <ChatLoading />
                            ) : (
                                searchResult?.map(user => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => accessChat(user._id)}
                                    />
                                ))
                            )}
                        {loadingChat && <Spinner ml="auto" d="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer
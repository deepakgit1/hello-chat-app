import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, FormControl, IconButton, Image, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider';
import { getSender, getSenderFull } from '../config/ChatLogic'
import ProfileModal from './miscellenious/ProfileModal';
import UpdateGroupChatModal from './miscellenious/UpdateGroupChatModal';
import axios from 'axios';
import "./style.css"
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "../animations/typing.json";
import Robot from "../assets/robot.gif"
import Chatimg from "../chatbg.jpg"

const ENDPOINT = "https://hello-chat-app-new.herokuapp.com/";

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {


    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState()
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const toast = useToast();
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            setLoading(true)
            const { data } = await axios.get(`/api/message/${selectedChat._id}`,
                config
            );
            // console.log(messages)
            setMessages(data)
            setLoading(false)

            socket.emit("join chat", selectedChat._id)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit("setup", user);
        socket.on('connected', () => setSocketConnected(true))
        socket.on('typing', () => setIsTyping(true))
        socket.on('stop typing', () => setIsTyping(false))
    }, [])

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    // console.log(notification,"-----");

    useEffect(() => {
        socket.on("Message Received", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageReceived])
            }
        })
    })

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("")
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );

                console.log(data);
                socket.emit("new message", data)
                setMessages([...messages, data])
            } catch (error) {
                console.log(error);
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Josefin Sans"
                        d="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            d={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                <p style={{ color: "#fff" }}>{getSender(user, selectedChat.users)}</p>
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>
                                <p style={{ color: "#fff" }}>{selectedChat.chatName.toUpperCase()}</p>
                                <UpdateGroupChatModal
                                    fetchMessages={fetchMessages}
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                />
                            </>
                        )}
                    </Text>
                    <Box
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        // bg="#ECF4FF"
                        backgroundImage={Chatimg}
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />

                        ) : (
                            <div className='messages'>
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                            {isTyping ?
                                <div>
                                    <Lottie
                                        animationData={animationData}
                                        style={{ marginBottom: -10, width: 70, marginLeft: 0 }}
                                    />
                                </div> : <></>}
                            <Input
                                variant="filled"
                                bg="#e6ebf5"
                                placeholder="Enter a message.."
                                border={"1px"}
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box 
                    alignItems="center"
                    justifyContent="center"
                    h="100%"
                    color={"#fff"}
                    fontWeight="bold"
                >
                    <Image src={Robot} />
                    <Text fontSize="3xl" pb={3} fontFamily="Josefin Sans" textAlign="center" mt={"-6rem"}>
                        Click on a user to start chatting
                    </Text>
                </Box>
            )
            }</>
    )
}

export default SingleChat
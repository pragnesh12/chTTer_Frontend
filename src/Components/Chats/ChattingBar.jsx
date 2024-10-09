import React, { useContext, useEffect, useState, useRef } from "react";
import JwtService from "../../apiServices/authService";
import { io } from "socket.io-client";
import { GetUserContext } from "../../Store/user-store";
import chatService from "../../apiServices/chatService";

const ChattingBar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [loginUser, setLoginUser] = useState();
  const [input, setInput] = useState({ message: "" });
  const { selectedChat } = useContext(GetUserContext);
  const { setIsOnline } = useContext(GetUserContext);
  const [room, setRoom] = useState();
  const [latestMessages, setLatestMessages] = useState([]);
  const [FetchReceiver, setFetchReceiver] = useState();
  const messageEndRef = useRef(null); // To track the end of messages for auto-scrolling

  // Establish socket connection
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:1156/", {
      auth: { token: localStorage.getItem("auth") },
    });

    socket.current.on("connect", () => {
      console.log(
        "Socket.io Connected Successfully. Socket Id:",
        socket.current.id
      );
      setIsOnline(true);
    });

    socket.current.on("Receive-Message", ({ message, from }) => {
      console.log("Received message from sender:", message);
      if (message) {
        setLatestMessages((prevMessages) => [
          ...prevMessages,
          { message, from },
        ]);
      }
    });

    // Cleanup socket on unmount
    socket.current.on("disconnect", () => {
      console.log(
        "Socket.io Disconnected Successfully. Socket Id:",
        socket.current.id
      );
      setIsOnline(false);
    });
    return () => socket.current.disconnect();
  }, [room, currentUser.id]);

  // Fetch current user and chat participants
  useEffect(() => {
    (async () => {
      const res = await JwtService.getCurrentUser(selectedChat);

      if (!selectedChat) {
        setCurrentUser(res.currentUser);
        setLoginUser(res.currentUser);
        setUsers(res.allUsers);
      } else {
        setCurrentUser(res.user);
        setFetchReceiver(res.user.profile_picture);
      }

      // setLoginUser(JSON.parse(localStorage.getItem("currentUser")));

      await chatService
        .getConversationBetweenUsers(selectedChat)
        .then((res) => {
          console.log("PPPPP=>", res.conversation);
          setLatestMessages(res.conversation);
          // latestMessages.map((msg) => console.log(msg.latest_messages));
          console.log("curr : ", currentUser);
        });
    })();
  }, [selectedChat]);

  // Scroll to the latest message when `latestMessages` updates
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [latestMessages]);

  // Send message handler
  const handleOnClick = async () => {
    if (!input.message) return; // Prevent empty message send

    // Emit the message to the socket
    socket.current.emit("Send-Message", {
      message: input.message,
      to: room || currentUser.id,
    });

    // Update message list immediately for the sender
    setLatestMessages([
      ...latestMessages,
      { message: input.message, from: "You" },
    ]);

    await chatService.sendMessage(currentUser.id, input.message);
    // Clear input field after sending
    setInput({ message: "" });
  };

  // Filter out current user from the list of users
  const filteredUsers = users.filter((user) => user.id !== currentUser.id);

  return (
    <div className="flex-1">
      <header className="bg-white p-4 text-gray-700 border-b border-gray-300">
        <h1 className="text-2xl font-semibold">
          {!selectedChat ? "Please Select Chat" : currentUser.first_name}
        </h1>
      </header>

      <div className="h-screen overflow-y-auto p-4 pb-36">
        {latestMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 cursor-pointer ${
              loginUser.id == msg.receiver_id || msg.from === "You"
                ? "justify-end"
                : ""
            }`}
          >
            <div
              className={`flex max-w-96 ${
                loginUser.id == msg.receiver_id || msg.from === "You"
                  ? "bg-indigo-500 text-white"
                  : "bg-white"
              } rounded-lg p-3 gap-3`}
            >
              <p>{msg.message ? msg.message : msg.latest_messages}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
              <img
                src={`${
                  loginUser.id == msg.receiver_id || msg.from === "You"
                    ? loginUser.profile_picture
                    : currentUser.profile_picture
                } `}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
                onError={(event) => {
                  event.target.src = "default-image.png";
                }}
              />
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <footer className="bg-white border-t border-gray-300 p-2 md:p-4 fixed bottom-0 w-2/4 md:w-3/4">
        <div className="flex flex-col md:flex-row items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500 mb-2 md:mb-0"
            value={input.message} // Controlled input
            onChange={(e) => setInput({ message: e.target.value })}
          />
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-0 md:ml-2 w-full md:w-auto"
            onClick={handleOnClick}
            type="submit"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChattingBar;

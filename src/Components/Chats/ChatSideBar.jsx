import React, { useContext, useEffect, useRef, useState } from "react";
import JwtService from "../../apiServices/authService";
import { API_IMAGE_URL } from "../../config/AppConfig";
import { io } from "socket.io-client";
import { GetUserContext } from "../../Store/user-store";
import chatService from "../../apiServices/chatService";

const ChatSideBar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]); // To store the list of online users

  const { setSelectedChat } = useContext(GetUserContext);
  const { selectedChat } = useContext(GetUserContext);

  const socket = useRef(null);

  // Socket connection and handle IsOnline event
  useEffect(() => {
    socket.current = io("http://localhost:1156/", {
      auth: { token: localStorage.getItem("auth") },
    });

    // Listen for the 'IsOnline' event and update the online users list
    socket.current.on("isOnline", (users) => {
      console.log("Users ------------ > ", users);
      setOnlineUsers((prevUsers) => [...prevUsers, users]); // Store online users' IDs
      console.log("//==>", onlineUsers);
    });

    // Listen for 'userDisconnected' event to remove users
    socket.current.on("userDisconnected", (userId) => {
      console.log("User Disconnected ID:", userId);
      setOnlineUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
    });

    // Clean up socket connection on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Fetch all users and the current user
  useEffect(() => {
    (async () => {
      const res = await JwtService.getCurrentUser();
      console.log("res.allUsers", res.allUsers);
      console.log("res.data.user", res.currentUser);
      setCurrentUser(res.currentUser);
      setUsers(res.allUsers);

      // // Fetch ChatDetailes
      // const resp = await chatService.getChatDetailes(res.currentUser.id);
    })();
  }, []);

  // Filter out the current user from the list of users
  const filteredUsers = users.filter((user) => user.id !== currentUser.id);

  const handleOnClick = async (id) => {
    (await id)
      ? setSelectedChat(id)
      : setSelectedChat("Please Select The Chat");
  };

  return (
    <div className="w-1/1 md:w-1/4 bg-white border-r border-gray-300">
      <header className="p-4 border-b border-gray-300 flex justify-between items-center text-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold">Chats</h1>
        <div className="relative"></div>
      </header>

      <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
        {filteredUsers.map((val, key) => (
          <div
            className={`flex items-center mb-4 cursor-pointer hover:bg-gray-100 ${
              selectedChat && selectedChat === val.id && `bg-gray-100`
            } p-2 rounded-md`}
            key={key}
            onClick={() => {
              handleOnClick(val.id);
            }}
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full mr-3">
              <img
                src={`${
                  val.profile_picture
                    ? `${API_IMAGE_URL}${val.profile_picture}`
                    : "default-image.png"
                } `}
                alt="User Avatar"
                className="w-full h-full rounded-full"
              />
              {onlineUsers.includes(val.id) && ( // Check if the user is online
                <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{val.first_name}</h2>
              <p className="text-gray-600">{val.last_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;

import React, { useContext, useEffect, useRef, useState } from "react";
import JwtService from "../../apiServices/authService";
import { API_IMAGE_URL } from "../../config/AppConfig";
import { GetUserContext } from "../../Store/user-store";
import { io } from "socket.io-client";

const ChatSideBar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const { setSelectedChat } = useContext(GetUserContext);

  const { selectedChat } = useContext(GetUserContext);

  const socket = useRef(null);
  useEffect(() => {
    (async () => {
      const res = await JwtService.getCurrentUser();
      console.log("res.allUsers", res.allUsers);
      console.log("res.data.user", res.currentUser);
      setCurrentUser(res.currentUser);
      setUsers(res.allUsers);
    })();
  }, []);

  // useEffect(() => {
  //   // Socket Io Implementation :-
  //   socket.current = io("http://localhost:1156/", {
  //     auth: { token: localStorage.getItem("auth") },
  //   });

  //   socket.current.on("IsOnline", (userId) => {
  //     console.log("Online Users : - ", userId);
  //   });
  // });

  // Filter out the current user from the list of users
  const filteredUsers = users.filter((user) => user.id !== currentUser.id);

  const handleOnClick = async (id) => {
    (await id)
      ? setSelectedChat(id)
      : setSelectedChat("PLease Select The Chat");
  };
  return (
    <div className="w-1/1 md:w-1/4 bg-white border-r border-gray-300">
      <header className="p-4 border-b border-gray-300 flex justify-between items-center  text-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold">Chats</h1>
        <div className="relative"></div>
      </header>

      <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
        {/* <div
          className={`flex items-center mb-4 cursor-pointer hover:bg-gray-100 ${
            selectedChat === currentUser.id && `bg-gray-100`
          } p-2 rounded-md`}
          onClick={() => {
            handleOnClick(currentUser.id);
          }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full mr-3">
            <img
              src={`${
                currentUser
                  ? `${currentUser.profile_picture}`
                  : "default-image.png"
              } `}
              alt="User Avatar"
              className="w-full h-full rounded-full"
              onError={(event) => {
                event.target.src = "default-image.png";
              }}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {currentUser.first_name} (you)
            </h2>
            <p className="text-gray-600">{currentUser.last_name}</p>
          </div>
        </div> */}

        {users &&
          filteredUsers.map((val, key) => (
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
                  className="w-full h-full rounded-full "
                />
                {/* {1 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )} */}
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

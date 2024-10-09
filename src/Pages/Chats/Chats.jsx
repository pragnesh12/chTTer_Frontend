import React, { useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import ChatSideBar from "../../Components/Chats/ChatSideBar";
import ChattingBar from "../../Components/Chats/ChattingBar";

const Chats = () => {
  

  return (
    <>
      <Navbar />
      <div class="flex h-screen overflow-hidden">
        <ChatSideBar />
        <ChattingBar />
      </div>
    </>
  );
};

export default Chats;

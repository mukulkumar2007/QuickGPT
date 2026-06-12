import React from "react";
import { useAppContext } from "../contexts/AppContext";
import { useState } from "react";
import { useEffect } from "react";
import { assets } from "../assets/assets";
import Message from "./Message";
import { useRef } from "react";
import toast from "react-hot-toast";

const Chatbox = () => {
  const containerRef = useRef(null);

  const { selectedChat, theme, setUser, token, user, axios, setSelectedChat } =
    useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast("Login to send Messages");
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: Date.now(),
          isImage: false,
        },
      ]);

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/message/${mode}`,
        { chatId: selectedChat._id, prompt, isPublished },
        { headers: { Authorization: token } }
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        //decrese credits
        setUser((prev) => ({
          ...prev,
          credits: mode === "image" ? prev.credits - 2 : prev.credits - 1,
        }));
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPrompt("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.message || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat Messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {!selectedChat || messages?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4x1 sm:text-6x1 text-center text-gray-400 dark:text-white">
              Ask me Anything.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} />
          ))
        )}
      </div>

      {/* Three dot Loading */}
      {loading && (
        <div className="loader flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
        </div>
      )}

      {mode === "image" && (
        <label className="inline-flex items-center gap-2 mb-3 text-sm mx-auto">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt Input */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none"
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          {/* <option className="dark:bg-purple-900" value="image">
            Image
          </option> */}
        </select>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none"
          required
        />
        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt=""
            className="w-8 cursor-pointer"
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;

import Chat from "../models/Chat.js";
//API Controller for creating a new chat

export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
      userName: req.user.name,
    };
    await Chat.create(chatData);
    res.json({ success: true, message: "Chat created" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get all chats
export const getChat = async (req, res) => {
  try {
    const userId = req.user_id;
    const chats = await Chat.find(userId).sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//API Controller to  delete a chat
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user_id;
    const { chatId } = req.body;

    await Chat.deleteOne({ _id: chatId, userId });

    res.json({ success: true, message: "Chat Deleted" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

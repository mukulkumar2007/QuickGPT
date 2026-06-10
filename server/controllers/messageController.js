import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imageKit from "../configs/imagekit.js";
import openai from "../configs/openai.js";

// Text based AI chat msg controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this features",
      });
    }
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.message.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });

    chat.message.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    //check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this features",
      });
    }
    const { prompt, chatId, isPublished } = req.body;
    //Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    //push chat message
    chat.message.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    //Encode the Prompt
    const encodedPrompt = encodeURIComponent(prompt);

    //Construct ImageKit AI generation link
    const generatedImageUrl = `${
      process.env.IMAGEKIT_URL_ENDPOINT
    }/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    //Trigger generation by fetching from Imagekit
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    //convert to base 64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    //Upload to image kit Media library
    const uploadResponse = await imageKit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };
    res.json({ success: true, reply });
    chat.message.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get published image
export const getPublishedImage = async (req, res) => {
  try {
    const publishedImageMessages = await Chat.aggregate([
      { $unwind: "$message" },
      {
        $match: {
          "message.isImage": true,
          "message.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          imageUrl: "$message.content",
          userName: "$userName",
        },
      },
    ]);
    res.json({ success: true, images: publishedImageMessages.reverse() });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

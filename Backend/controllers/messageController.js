import Message from "../modals/Message.js";
import User from "../modals/User.js";
import ImageKit from "../configs/imageKit.js";
import fs from 'fs'

// In-memory map for Server-Sent Events (SSE) connections: userId -> res
const sseClients = new Map();

export const serverSideEventController = (req, res) => {
  const { userId } = req.auth();
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // send a ping
  res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

  sseClients.set(userId, res);

  req.on('close', () => {
    sseClients.delete(userId);
  });
};

// Helper to push message via SSE if recipient connected
const pushSSE = (toUserId, payload) => {
  const res = sseClients.get(toUserId);
  if (!res) return false;
  try {
    res.write(`event: message\ndata: ${JSON.stringify(payload)}\n\n`);
    return true;
  } catch (e) {
    sseClients.delete(toUserId);
    return false;
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to, content } = req.body;
    if (!to) return res.json({ success: false, message: 'recipient required' });

    // handle uploaded files (multer) and upload to ImageKit
    const files = req.files || [];
    const uploaded = [];
    for (const f of files) {
      try {
        const buffer = fs.readFileSync(f.path)
        const base64 = buffer.toString('base64')
        const response = await ImageKit.upload({
          file: base64,
          fileName: f.originalname,
          folder: '/messages'
        })
        // response.url contains public URL
        uploaded.push({ filename: f.originalname, url: response.url })
      } catch (e) {
        console.error('ImageKit upload failed', e)
      } finally {
        // remove temp file
        try { fs.unlinkSync(f.path) } catch (e) { }
      }
    }

    const msg = await Message.create({ from: userId, to, content: content || '', attachments: uploaded });

    // push to recipient if connected
    pushSSE(to, { message: msg });

    return res.json({ success: true, message: msg });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { from } = req.body;
    if (!from) return res.json({ success: false, message: 'from user required' });

    await Message.updateMany({ from, to: userId, seen: false }, { $set: { seen: true } });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    // get latest 100 messages involving user, then reduce to conversations
    const msgs = await Message.find({ $or: [{ from: userId }, { to: userId }] }).sort({ createdAt: -1 }).limit(100).lean();

    const conversations = new Map();
    for (const m of msgs) {
      const other = m.from === userId ? m.to : m.from;
      if (!conversations.has(other)) {
        conversations.set(other, m);
      }
    }

    const result = [];
    for (const [otherId, m] of conversations.entries()) {
      const user = await User.findById(otherId).select('_id full_name username profile_picture');
      result.push({ user, lastMessage: m });
    }

    return res.json({ success: true, conversations: result });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

export const getConversation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const other = req.params.id;
    if (!other) return res.json({ success: false, message: 'other user id required' });

    const msgs = await Message.find({
      $or: [
        { from: userId, to: other },
        { from: other, to: userId }
      ]
    }).sort({ createdAt: 1 }).lean();

    return res.json({ success: true, messages: msgs });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}


// Expose helper for other modules/tests
export const _sseClients = sseClients;

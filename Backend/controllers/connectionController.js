import User from "../modals/User.js";
import { inngest } from "../inngest/index.js";

// Send a connection request (adds to `connections` array on target user and triggers reminder event)
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { toUserId } = req.body;

    if (!toUserId) return res.json({ success: false, message: "toUserId required" });

    if (userId === toUserId) return res.json({ success: false, message: "cannot connect to yourself" });

    const fromUser = await User.findById(userId);
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.json({ success: false, message: "target user not found" });

    // simple rate-limit: max 20 pending connection requests per user
    const pendingCount = toUser.connections ? toUser.connections.length : 0;
    if (pendingCount >= 1000) {
      return res.json({ success: false, message: "target user has too many connections" });
    }

    // don't duplicate
    if (toUser.connections && toUser.connections.includes(userId)) {
      return res.json({ success: false, message: "connection request already sent" });
    }

    toUser.connections = toUser.connections || [];
    toUser.connections.push(userId);
    await toUser.save();

    // Trigger an Inngest event so a background job can send reminder emails
    try { await inngest.send({ name: 'connection.request.sent', data: { from: userId, to: toUserId } }); } catch (e) { console.log('inngest send failed', e); }

    return res.json({ success: true, message: 'connection request sent' });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId).populate('connections', '_id full_name username profile_picture');
    if (!user) return res.json({ success: false, message: 'user not found' });
    return res.json({ success: true, connections: user.connections || [] });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }

}

// Accept a connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { fromUserId } = req.body;

    if (!fromUserId) return res.json({ success: false, message: 'fromUserId required' });

    const recipient = await User.findById(userId);
    const sender = await User.findById(fromUserId);

    if (!recipient || !sender) return res.json({ success: false, message: 'user not found' });

    // Check that a pending request exists (sender id in recipient.connections)
    const pending = recipient.connections && recipient.connections.includes(fromUserId);
    if (!pending) return res.json({ success: false, message: 'connection not found' });

    // Ensure both users have each other in connections (dedupe)
    recipient.connections = recipient.connections || [];
    if (!recipient.connections.includes(fromUserId)) recipient.connections.push(fromUserId);

    sender.connections = sender.connections || [];
    if (!sender.connections.includes(userId)) sender.connections.push(userId);

    await recipient.save();
    await sender.save();

    return res.json({ success: true, message: 'connection accepted successfully' });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

import { Inngest } from "inngest";
import User from "../modals/User.js";
import Message from "../modals/Message.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
//inggest function
export const inngest = new Inngest({ id: "neelesh1097" });

// inngest function to save user data
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk', triggers: { event: 'clerk/user.created' } },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        // check availability of username
        const user = await User.findOne({ username })

        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }

        await User.create(userData)
    }
)

// inngest function to update user data in database

const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk', triggers: { event: 'clerk/user.updated' } },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
        }

        await User.findByIdAndUpdate(id, updatedUserData)
    }
)

// inngest function to delete user from database

const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk', triggers: { event: 'clerk/user.deleted' } },
    async ({ event }) => {
        const { id } = event.data

        await User.findByIdAndDelete(id)
    }
)

// Send a reminder when a connection request is pending
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: 'connection-request-reminder', triggers: { event: 'connection.request.sent' } },
    async ({ event, step }) => {
        const { from, to } = event.data || {};
        try {
            const sender = await User.findById(from);
            const receiver = await User.findById(to);
            if (!receiver) return console.log('receiver not found for connection reminder');

            // Immediate email notifying of new connection request
            const subject = 'New connection request';
            const body = `<p>Hi ${receiver.full_name || receiver.username},</p>
            <p>${sender.full_name || sender.username} has sent you a connection request.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile">View requests</a></p>`;

            try { await sendEmail({ to: receiver.email, subject, html: body }); } catch (e) { console.error('sendEmail immediate failed', e); }

            // Schedule a reminder after 24 hours: sleep until then, then check status and send reminder only if still pending
            const when = Date.now() + (24 * 60 * 60 * 1000);
            await step.sleepUntil(new Date(when));

            await step.run(async () => {
                const freshReceiver = await User.findById(to);
                if (!freshReceiver) return { message: 'receiver gone' };
                // If sender id still present in receiver.connections, it's still pending
                const stillPending = freshReceiver.connections && freshReceiver.connections.includes(from);
                if (!stillPending) return { message: 'already accepted or removed' };

                const remindSubject = 'Reminder: connection request pending';
                const remindBody = `<p>Hi ${freshReceiver.full_name || freshReceiver.username},</p>
                <p>This is a reminder: ${sender.full_name || sender.username} sent you a connection request and it's still pending.</p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile">View requests</a></p>`;
                try { await sendEmail({ to: freshReceiver.email, subject: remindSubject, html: remindBody }); } catch (e) { console.error('sendEmail reminder failed', e); }

                return { message: 'reminder sent' };
            })

        } catch (error) {
            console.error('connection reminder job error', error);
        }
    }
)

// Delete a story after 24 hours (triggered when story is created)
const deleteAStory = inngest.createFunction(
    { id: 'delete-story-after-24h', triggers: { event: 'story.created' } },
    async ({ event }) => {
        const { storyId, userId } = event.data || {};
        console.log(`Story created ${storyId} by ${userId}. Scheduling deletion after 24h.`);
        // Note: long-running serverless waits are not ideal; this is a placeholder for scheduling logic
    }
)

// Daily cron to notify users with unseen messages (intended to be triggered by scheduler at 9:00am)
const sendUnseenMessagesNotification = inngest.createFunction(
    { id: 'daily-unseen-message-notification', triggers: { event: 'cron.daily.unseen-messages' } },
    async ({ event }) => {
        // Find users with unseen messages
        const unseen = await Message.aggregate([
            { $match: { seen: false } },
            { $group: { _id: '$to', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        for (const u of unseen) {
            console.log(`User ${u._id} has ${u.count} unseen messages — send notification.`);
            // Hook to email/notification provider here
        }
    }
)

// Create an array where we'll export Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteAStory,
    sendUnseenMessagesNotification,
];
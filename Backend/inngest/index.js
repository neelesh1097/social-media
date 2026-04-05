import { Inngest } from "inngest";
import User from "../modals/User.js";
import Message from "../modals/Message.js";

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
    async ({ event }) => {
        const { from, to } = event.data || {};
        // Placeholder: in real app send email; here just log
        console.log(`Connection request sent from ${from} to ${to}. Scheduling reminder.`);
        // Example: could re-emit an event or call an email provider
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
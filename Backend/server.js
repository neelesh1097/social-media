import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { inngest , functions } from './inngest/index.js';
import { clerkMiddleware } from '@clerk/express'
import {serve} from 'inngest/express'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import connectionRouter from './routes/connectionRoutes.js'
import postRouter from './routes/postRoutes.js'
import storyRouter from './routes/storyRoutes.js'
import Post from './modals/Post.js'
import User from './modals/User.js'
import Story from './modals/Story.js'

const app =express();

await connectDB();

app.use(express.json());
app.use(clerkMiddleware())
app.use(cors());

// simple request logger to help debug API routing
app.use((req, res, next) => {
	console.log(new Date().toISOString(), req.method, req.originalUrl);
	next();
});

app.get('/' , (req , res) => res.send('server is running'))
app.use('/api/inngest' , serve({client :inngest,functions }))

app.use('/api/user' , userRouter)
app.use('/api/messages', messageRouter)
app.use('/api/connections', connectionRouter)
app.use('/api/post', postRouter)
app.use('/api/stories', storyRouter)

const PORT = process.env.PORT || 4000;


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
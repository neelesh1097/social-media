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

const app =express();

await connectDB();

app.use(express.json());
app.use(clerkMiddleware())
app.use(cors());

app.get('/' , (req , res) => res.send('server is running'))
app.use('/api/inngest' , serve({client :inngest,functions }))
app.use('/api/user' , userRouter)
app.use('/api/messages', messageRouter)
app.use('/api/connections', connectionRouter)

const PORT = process.env.PORT || 4000;


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
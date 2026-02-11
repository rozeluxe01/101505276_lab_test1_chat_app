### Chat Application — COMP3133 Lab Test 1

A real-time chat application built using React, TailwindCSS, Node.js, Express, Socket.io, and MongoDB Atlas.

Users can register, log in, join chat rooms, send group messages, send private messages, and see real-time typing indicators and online users.

### Features
### Authentication

User signup and login stored securely in MongoDB Atlas

Validation for duplicate usernames

User session stored via React Context

### Group Chat

Predefined rooms:

devops

cloud computing

covid19

sports

nodeJS

Join/leave rooms

Real-time messaging

Typing indicator ("username is typing…")

Messages stored in MongoDB (GroupMessage collection)

### Private Messaging (DM)

Displays online users

Select a user to start a private chat

Sends and receives private messages in real time

Only sender & receiver can see the conversation

Stored in MongoDB (PrivateMessage collection)

### Real-Time Updates

Powered by Socket.io:

Real-time group messages

Real-time private messages

Live typing indicator

Online user presence tracking

### Frontend (Client)

Built with React + Vite

Styled using TailwindCSS

Context API for auth and socket management

Fully responsive UI

### Backend (Server)

Express REST API for authentication

Socket.io for live communication

MongoDB Atlas database

Mongoose schemas for Users, Group Messages, and Private Messages

### Technologies Used
### Frontend

React (Vite)

TailwindCSS

React Router

Socket.io Client

### Backend

Node.js

Express

Socket.io

Mongoose

dotenv

MongoDB Atlas

### Project Structure
```
root/
 ├── client/                     # React + Tailwind frontend
 │   ├── src/
 │   │   ├── pages/              # Login, Signup, Chat pages
 │   │   ├── context/            # AuthContext, SocketContext
 │   │   ├── components/         # Reusable UI components
 │   │   └── ...
 │   └── ...
 │
 ├── server/                     # Node.js backend
 │   ├── models/                 # User, GroupMessage, PrivateMessage schemas
 │   ├── routes/                 # Authentication routes
 │   ├── server.js               # Main Express + Socket.io server
 │   └── .env                    # Environment variables
 │
 └── README.md
```

### Setup Instructions
Clone the project
git clone https://github.com/rozeluxe01/101505276_lab_test1_chat_app.git
cd 101505276_lab_test1_chat_app

### Backend Setup (server)
cd server
npm install

Create .env inside /server
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/chat_app
PORT=3000

### Start backend
node server.js


You should see:

Connected to MongoDB Atlas
Server running on port 3000

### Frontend Setup (client)
cd client
npm install
npm run dev


### Visit:

http://localhost:5173

MongoDB Models
Users

Stored in users collection:

{
  username: String,
  firstname: String,
  lastname: String,
  password: String,
  createdOn: Date
}

Group Messages

Stored in groupmessages:

{
  room: String,
  from_user: String,
  message: String,
  date_sent: Date
}

Private Messages

Stored in privatemessages:

{
  from_user: String,
  to_user: String,
  message: String,
  date_sent: Date
}

### How to Test

Open two browsers or incognito windows

Log in as two different users

Test:

Group chat messages

Typing indicator

Joining/leaving rooms

Online users panel

Private messaging

Verify messages appear in MongoDB Atlas under:

users

groupmessages

privatemessages

### Notes for Instructor

This version uses:

React + Tailwind instead of vanilla HTML/CSS

Socket.io for real-time messaging

MongoDB Atlas instead of local MongoDB

Clean and modular folder structure

All lab test requirements have been implemented with an enhanced UI.

### Author

Student Name: Kevin George Buhain
Student ID: 101505276
COMP3133 — Lab Test 1
George Brown College
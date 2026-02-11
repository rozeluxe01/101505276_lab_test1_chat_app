import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const ROOMS = ["devops", "cloud computing", "covid19", "sports", "nodeJS"];

export default function Chat() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  // Group chat state
  const [currentRoom, setCurrentRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [input, setInput] = useState("");

  // Private chat / online users state
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activePrivateUser, setActivePrivateUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [privateInput, setPrivateInput] = useState("");

  // ----------------------
  // Group chat socket events
  // ----------------------
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_group_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing_indicator", ({ username, isTyping }) => {
      setTypingUser(isTyping ? username : null);
    });

    return () => {
      socket.off("receive_group_message");
      socket.off("typing_indicator");
    };
  }, [socket]);

  // ----------------------
  // Register user + private chat socket events
  // ----------------------
  useEffect(() => {
    if (!socket || !user) return;

    // Tell server which user this socket belongs to
    socket.emit("register_user", { username: user.username });

    socket.on("online_users", (users) => {
      // Don't show yourself in the list
      setOnlineUsers(users.filter((u) => u !== user.username));
    });

    socket.on("receive_private_message", (msg) => {
      setPrivateMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_private_message");
    };
  }, [socket, user]);

  // ----------------------
  // Group chat handlers
  // ----------------------
  const joinRoom = (room) => {
    if (!socket || !user) return;
    if (currentRoom) {
      socket.emit("leave_room");
    }
    setMessages([]);
    setCurrentRoom(room);
    socket.emit("join_room", { room, username: user.username });
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit("leave_room");
    setCurrentRoom("");
    setMessages([]);
    setTypingUser(null); // clear indicator
  };

  const handleSend = () => {
    if (!socket || !currentRoom || !input.trim()) return;

    socket.emit("send_group_message", {
      room: currentRoom,
      from_user: user.username,
      message: input.trim(),
    });

    // Tell others we've stopped typing
    socket.emit("typing", {
      room: currentRoom,
      username: user.username,
      isTyping: false,
    });

    setInput("");
  };

  const handleTyping = (value) => {
    setInput(value);
    if (socket && currentRoom) {
      socket.emit("typing", {
        room: currentRoom,
        username: user.username,
        isTyping: value.length > 0,
      });
    }
  };

  const handleLogout = () => {
    if (socket && user) {
      socket.emit("logout_user", { username: user.username });
    }
    logout();
  };

  // ----------------------
  // Private chat handlers
  // ----------------------
  const handleSelectPrivateUser = (username) => {
    setActivePrivateUser(username);
    // For now we just show messages we already have in memory.
    // If you want history from DB, you'd call a REST API here.
  };

  const handleSendPrivate = () => {
    if (!socket || !activePrivateUser || !privateInput.trim()) return;

    socket.emit("send_private_message", {
      from_user: user.username,
      to_user: activePrivateUser,
      message: privateInput.trim(),
    });

    setPrivateInput("");
  };

  const filteredPrivateMessages = privateMessages.filter(
    (m) =>
      activePrivateUser &&
      ((m.from_user === user.username && m.to_user === activePrivateUser) ||
        (m.to_user === user.username && m.from_user === activePrivateUser))
  );

  if (!user) {
    return <div className="p-4">Please log in.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-800 text-white">
        <h1 className="text-xl font-semibold">Chat app</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Logged in as <b>{user.username}</b>
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 p-6 gap-6">
        {/* Room list */}
        <aside className="w-64 bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <h2 className="font-semibold mb-2">Rooms</h2>
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => joinRoom(room)}
              className={`w-full text-left px-3 py-2 rounded-lg border
                ${
                  currentRoom === room
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-slate-50"
                }`}
            >
              {room}
            </button>
          ))}
          {currentRoom && (
            <button
              onClick={leaveRoom}
              className="mt-4 w-full px-3 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 text-sm"
            >
              Leave room
            </button>
          )}
        </aside>

        {/* Group chat window */}
        <section className="flex-1 bg-white rounded-xl shadow flex flex-col">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <span className="font-semibold text-slate-700">
              {currentRoom ? `Room: ${currentRoom}` : "Select a room to start"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <div
                key={m._id || `${m.date_sent}-${Math.random()}`}
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  m.from_user === user.username
                    ? "ml-auto bg-indigo-600 text-white"
                    : "mr-auto bg-slate-100"
                }`}
              >
                <div className="text-xs opacity-70 mb-0.5">{m.from_user}</div>
                <div>{m.message}</div>
              </div>
            ))}
          </div>

          {typingUser && (
            <div className="px-4 py-1 text-xs text-slate-500">
              {typingUser} is typing...
            </div>
          )}

          <div className="border-t px-4 py-3 flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              disabled={!currentRoom}
            />
            <button
              onClick={handleSend}
              disabled={!currentRoom}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:bg-slate-300"
            >
              Send
            </button>
          </div>
        </section>

        {/* Private chat panel */}
        <section className="w-80 bg-white rounded-xl shadow flex flex-col">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-slate-700">Private chat</h2>
            <p className="text-xs text-slate-500">
              Click a user below to start a private chat.
            </p>
          </div>

          {/* Online users list */}
          <div className="border-b px-4 py-3 max-h-40 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2 text-slate-700">
              Online users
            </h3>
            {onlineUsers.length === 0 && (
              <p className="text-xs text-slate-400">No other users online.</p>
            )}
            <div className="flex flex-col gap-1">
              {onlineUsers.map((u) => (
                <button
                  key={u}
                  onClick={() => handleSelectPrivateUser(u)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm border
                    ${
                      activePrivateUser === u
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-slate-50"
                    }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Private messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activePrivateUser ? (
              filteredPrivateMessages.length > 0 ? (
                filteredPrivateMessages.map((m) => (
                  <div
                    key={m._id || `${m.date_sent}-${Math.random()}`}
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      m.from_user === user.username
                        ? "ml-auto bg-indigo-600 text-white"
                        : "mr-auto bg-slate-100"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-0.5">
                      {m.from_user}
                    </div>
                    <div>{m.message}</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  No messages yet. Say hi to {activePrivateUser}!
                </p>
              )
            ) : (
              <p className="text-xs text-slate-400">
                Select a user from the list above to start a private chat.
              </p>
            )}
          </div>

          {/* Private input */}
          <div className="border-t px-4 py-3 flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
              placeholder={
                activePrivateUser
                  ? `Message ${activePrivateUser}...`
                  : "Select a user to chat..."
              }
              value={privateInput}
              onChange={(e) => setPrivateInput(e.target.value)}
              disabled={!activePrivateUser}
            />
            <button
              onClick={handleSendPrivate}
              disabled={!activePrivateUser}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:bg-slate-300"
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

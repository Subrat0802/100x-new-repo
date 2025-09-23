import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(["hi", "bye"]);
  const wsRef = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((m) => [...m, data.chat]);
    };

    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "123",
          },
        })
      );
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 justify-center items-center w-screen h-screen">
      Chat App
      <div className="h-[80vh] relative w-full  md:w-[50%] rounded-lg">
        <div className="h-[92%] border ">
          {messages.length === 0 ? (
            <p className="text-center">No messages</p>
          ) : (
            <div className="flex flex-col">
              {messages.map((el) => (
                <p className="bg-black text-white m-1 p-2 w-fit rounded-lg">
                  {el}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 w-full flex">
          <input
            id="msg"
            placeholder="Message"
            className="w-[80%] border p-2"
            type="text"
          />
          <button
            onClick={() => {
              const msg = document.getElementById("msg")?.value;
              wsRef.current.send(
                JSON.stringify({
                  type: "chat",
                  payload: {
                    chat: msg,
                  },
                })
              );
            }}
            className="w-[20%] bg-black  text-white p-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

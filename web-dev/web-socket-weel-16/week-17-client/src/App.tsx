import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {

  const [socket, setSocket] = useState();
  const inputRef = useRef();

  const sendMessage = () => {
    if(!socket){
      return;
    }

    const message = inputRef.current.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    socket.send(message);
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);
    ws.onmessage = (ev) => {
      console.log(ev);
      alert(ev.data);
    }
    console.log(ws);

  }, []);

  return (
    <div>
      <input placeholder='message' type='text' ref={inputRef}/>
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default App

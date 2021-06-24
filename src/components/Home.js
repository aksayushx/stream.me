import React from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../styles/Home.css";

function Home() {
  const [roomUrl, setRoomUrl] = React.useState("");

  const joinRoom = () => {
    if (roomUrl === "") {
      alert("Enter Valid Room URl");
    } else {
      var url = roomUrl.split("/");
      window.location.href = `/${url[url.length - 1]}`;
    }
  };

  const createRoom = () => {
    var url = uuidv4();
    window.location.href = `/${url}`;
  };

  return (
    <div className="App">
      <div>
        <div>
          <Button
            className="create-room"
            onClick={() => {
              createRoom();
            }}
          >
            Create a Meeting
          </Button>
        </div>
        <div className="join-room">
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Enter Meeting Link Here"
              aria-label="Meeting-Link"
              onChange={(e) => setRoomUrl(e.target.value)}
              aria-describedby="basic-addon2"
            />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={joinRoom}>
                Join Roon
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
      </div>
    </div>
  );
}

export default Home;

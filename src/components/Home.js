import React, { useState } from "react";
import { Button, InputGroup, FormControl, ListGroup } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../styles/Home.css";

function Home() {
  /**
   * @param - createRoom - Boolean variable to store whether to create a new room to direct to an existing one.
   * @param - roomUrl - Stores the destination meeting room URL.
   */
  const [createRoom, setCreateRoom] = useState(true);
  const [roomUrl, setRoomUrl] = useState("");

  /**
   * Redirects to a new room if no room URL is provided,
   * otherwise redirects to the provided meeting room.
   */
  const joinRoom = () => {
    if (createRoom === true) {
      var url = uuidv4();
      window.location.href = `/${url}`;
    } else {
      if (roomUrl === "") {
        alert("Enter Valid Room URl");
      } else {
        url = roomUrl.split("/");
        window.location.href = `/${url[url.length - 1]}`;
      }
    }
  };

  return (
    <div className="App">
      <h1 className="name">stream.me</h1>
      <h1 className="subhead">Be in Touch!!!</h1>
      <div className="features">
        <ListGroup>
          <ListGroup.Item variant="primary">
            Easy to Use Interface
          </ListGroup.Item>
          <ListGroup.Item variant="secondary">
            Connect with upto 5 people seamlessly
          </ListGroup.Item>
          <ListGroup.Item variant="success">
            High quality video and audio
          </ListGroup.Item>
          <ListGroup.Item variant="primary">
            Access Chat before or after the meeting
          </ListGroup.Item>
        </ListGroup>
      </div>
      <div>
        <Button
          className="create-room"
          variant="dark"
          onClick={() => {
            setCreateRoom(true);
            joinRoom();
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
            onChange={(e) => {
              setRoomUrl(e.target.value);
              setCreateRoom(false);
            }}
            aria-describedby="basic-addon2"
            className="meeting-link"
          />
          <InputGroup.Append>
            <Button
              className="meeting-link join-button"
              variant="dark"
              onClick={joinRoom}
            >
              Join Room
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}

export default Home;

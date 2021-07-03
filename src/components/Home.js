import React from "react";
import {
  Button,
  InputGroup,
  FormControl,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
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
          </ListGroup>
        </div>
        <div>
          <Button
            className="create-room"
            variant="dark"
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
              className="meeting-link"
            />
            <InputGroup.Append>
              <Button
                variant="outline-secondary"
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
    </div>
  );
}

export default Home;

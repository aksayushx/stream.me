import React, { useState } from "react";
import {
  Button,
  InputGroup,
  FormControl,
  ListGroup,
  Modal,
  ModalBody,
} from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../styles/Home.css";

function Home() {
  const [modalShow, setModalShow] = useState(false);
  const [createRoom, setCreateRoom] = useState(true);
  const [userName, setUserName] = useState("");
  const [roomUrl, setRoomUrl] = useState("");

  const joinRoom = () => {
    if (createRoom === true) {
      var url = uuidv4();
      window.location.href = `/${url}`;
    } else {
      if (roomUrl === "") {
        alert("Enter Valid Room URl");
      } else {
        var url = roomUrl.split("/");
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
        </ListGroup>
      </div>
      <div>
        <Button
          className="create-room"
          variant="dark"
          onClick={() => {
            setModalShow(true);
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
              variant="outline-secondary"
              className="meeting-link join-button"
              variant="dark"
              onClick={() => setModalShow(true)}
            >
              Join Room
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        className="popup"
        dialogClassName="modal-90w"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton></Modal.Header>
        <ModalBody>
          <h2 className="pad-60 header">stream.me</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinRoom();
            }}
          >
            <div className="input-feild align-self-center input-user">
              <div className="row">
                <p className="label username">UserName</p>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  className="field"
                  placeholder="Enter your name here"
                ></input>
              </div>
            </div>
            <Button
              variant="light"
              className="submit-button"
              type="submit"
              value="Submit"
            >
              Connect
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default Home;

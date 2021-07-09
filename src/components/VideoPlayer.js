import React, { useState, useEffect, createRef } from "react";
import io from "socket.io-client";
import { Button, InputGroup, FormControl, Modal } from "react-bootstrap";
import { Badge } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CallEndIcon from "@material-ui/icons/CallEnd";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatIcon from "@material-ui/icons/Chat";
import { message } from "antd";
import "antd/dist/antd.css";
import { Row } from "reactstrap";
import "../styles/VideoPlayer.css";

const server_url =
  process.env.NODE_ENV === "production"
    ? "https://gentle-basin-90256.herokuapp.com"
    : "http://localhost:4001";

var connections = {};
const peerConnectionConfig = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
      ],
    },
  ],
};
var socket = null;
var socketId = null;
var elms = 0;

function VideoPlayer(props) {
  const localVideoRef = createRef();
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const getPermissions = async () => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setVideoAvailable(true))
        .catch(() => setVideoAvailable(true));

      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => setAudioAvailable(true))
        .catch(() => setAudioAvailable(true));

      if (videoAvailable || audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            video: videoAvailable,
            audio: audioAvailable,
          })
          .then((stream) => {
            window.localStream = stream;
            localVideoRef.current.srcObject = stream;
          })
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getMedia = () => {
    setVideoOn(videoAvailable);
    setAudioOn(audioAvailable);
    getUserMedia();
    connectToSocketServer();
  };

  const getUserMedia = () => {
    if ((videoOn && videoAvailable) || (audioOn && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: videoOn, audio: audioOn })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.error(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    //localVideoRef.current.play();

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.error(e));
      });
    }

    stream.getTracks().forEach(
      async (track) =>
        (track.onended = () => {
          setAudioOn(false);
          setVideoOn(false);
        })
    );
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const changeCssVideos = (main) => {
    let widthMain = main.offsetWidth;
    let minWidth = "30%";
    if ((widthMain * 30) / 100 < 300) {
      minWidth = "300px";
    }
    let minHeight = "40%";

    let height = String(100 / elms) + "%";
    let width = "";
    if (elms === 0 || elms === 1) {
      width = "60%";
      height = "100%";
    } else if (elms === 2) {
      width = "45%";
      height = "100%";
    } else if (elms === 3 || elms === 4) {
      width = "35%";
      height = "48%";
    } else {
      width = String(100 / elms) + "%";
    }

    let videos = main.querySelectorAll("video");
    for (let a = 0; a < videos.length; ++a) {
      videos[a].style.minWidth = minWidth;
      videos[a].style.minHeight = minHeight;
      videos[a].style.setProperty("width", width);
      videos[a].style.setProperty("height", height);
    }

    return { minWidth, minHeight, width, height };
  };

  const connectToSocketServer = () => {
    socket = io.connect(server_url, { secure: true });

    socket.on("signal", gotMessageFromServer);

    socket.on("connect", () => {
      socket.emit("join-call", window.location.href);
      socketId = socket.id;

      socket.on("chat-message", addMessage);

      socket.on("user-left", (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`);
        if (video !== null) {
          elms--;
          video.parentNode.removeChild(video);

          let main = document.getElementById("main");
          changeCssVideos(main);
        }
      });

      socket.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socket.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            );
            if (searchVidep !== null) {
              searchVidep.srcObject = event.stream;
            } else {
              elms = clients.length;
              let main = document.getElementById("main");
              let cssMesure = changeCssVideos(main);

              let video = document.createElement("video");

              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: "100%",
                margin: "10px",
                borderRadius: "2rem",
                borderStyle: "solid",
                borderWidth: "4px",
                borderColor: "yellowgreen",
                objectFit: "fill",
              };
              for (let i in css) video.style[i] = css[i];

              video.style.setProperty("width", cssMesure.width);
              video.style.setProperty("height", cssMesure.height);
              video.setAttribute("data-socket", socketListId);
              video.srcObject = event.stream;
              video.autoplay = true;
              video.playsinline = true;

              main.appendChild(video);
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => {
    setVideoOn(!videoOn);
  };

  const handleAudio = () => {
    setAudioOn(!audioOn);
  };
  const openChat = () => {
    setShowModal(true);
    setNewMessages(0);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setAllMessages((allMessages) =>
      allMessages.concat({ sender: sender, data: data })
    );
    console.log("Messgaes ", allMessages.length);
    if (socketIdSender !== socketId) {
      setNewMessages(newMessages + 1);
    }
  };

  const sendMessage = () => {
    if (message.length > 0) {
      socket.emit("chat-message", message, "Ayush");
      setMessage("");
    }
  };

  const handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  const copyInviteLink = () => {
    let text = window.location.href;
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Link copied to clipboard!");
      },
      () => {
        alert("Failed to copy");
      }
    );
  };

  useEffect(() => {
    getPermissions();
    getMedia();
  }, []);

  useEffect(() => {
    getUserMedia();
  }, [videoOn, audioOn]);
  useEffect(() => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    let blackSilence = (...args) =>
      new MediaStream([black(...args), silence()]);
    window.localStream = blackSilence();
    localVideoRef.current.srcObject = window.localStream;

    for (let id in connections) {
      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }
  }, []);

  return (
    <div>
      <div className="container">
        <div className="invite-link">
          <InputGroup className="mb-3">
            <FormControl
              placeholder={window.location.href}
              aria-label={window.location.href}
              aria-describedby="basic-addon2"
              disabled
            />
            <InputGroup.Append>
              <Button
                variant="outline-secondary"
                className="copy-button"
                onClick={copyInviteLink}
              >
                Copy Invite Link
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>

        <Row id="main" className="flex-container">
          <video
            id="my-video"
            ref={localVideoRef}
            autoPlay
            muted
            className="video-stream"
          ></video>
        </Row>
        <div className="btn-down options">
          <Button className="video-button" variant="dark" onClick={handleVideo}>
            {videoOn === true ? (
              <VideocamIcon className="icon" />
            ) : (
              <VideocamOffIcon className="icon" />
            )}
          </Button>

          <Button className="end-call" variant="dark" onClick={handleEndCall}>
            <CallEndIcon />
          </Button>

          <Button className="audio-button" variant="dark" onClick={handleAudio}>
            {audioOn === true ? (
              <MicIcon className="icon" />
            ) : (
              <MicOffIcon className="icon" />
            )}
          </Button>
          <Badge
            badgeContent={newMessages}
            max={999}
            color="secondary"
            onClick={openChat}
          >
            <Button className="chat-button" variant="dark" onClick={openChat}>
              <ChatIcon />
            </Button>
          </Badge>
        </div>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          style={{ zIndex: "999999" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Chat Room</Modal.Title>
          </Modal.Header>
          <Modal.Body className="chat-modal">
            {allMessages.length > 0 ? (
              allMessages.map((item, index) => (
                <div key={index} style={{ textAlign: "left" }}>
                  <p className="msgs">
                    <b>{item.sender}</b>: {item.data}
                  </p>
                </div>
              ))
            ) : (
              <p>No message yet</p>
            )}
          </Modal.Body>
          <Modal.Footer className="div-send-msg">
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Message"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <InputGroup.Append>
                <Button variant="outline-secondary" onClick={sendMessage}>
                  Send
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default VideoPlayer;

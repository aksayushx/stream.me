import React, { useState, useEffect, createRef } from "react";
import io from "socket.io-client";
import { IconButton } from "@material-ui/core";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CallEndIcon from "@material-ui/icons/CallEnd";
import "bootstrap/dist/css/bootstrap.min.css";

import { Row } from "reactstrap";
import "../styles/VideoPlayer.css";

const server_url =
  process.env.NODE_ENV === "production"
    ? "https://gentle-basin-90256.herokuapp.com"
    : "http://localhost:4001";

var connections = {};
const peerConnectionConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
var socket = null;
var socketId = null;
var elms = 0;

function VideoPlayer() {
  const localVideoRef = createRef();
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);

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
          .getUserMedia({ video: videoAvailable, audio: audioAvailable })
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
      } catch (e) {}
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

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
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setAudioOn(false);
          setVideoOn(false);
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
      height = "50%";
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
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
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
              // if i don't do this check it make an empyt square
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
                borderColor: "black",
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
              <Button variant="outline-secondary" onClick={copyInviteLink}>
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
          <IconButton className="video-button" onClick={handleVideo}>
            {videoOn === true ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton className="end-call" onClick={handleEndCall}>
            <CallEndIcon />
          </IconButton>

          <IconButton className="audio-button" onClick={handleAudio}>
            {audioOn === true ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;

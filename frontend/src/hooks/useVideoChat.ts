import { useEffect, useRef } from "react";
import Peer, { MediaConnection } from "peerjs";
import { useSocket } from "../context/SocketContext";

export const useVideoChat = (roomId: string) => {
  const videoGridRef = useRef<HTMLDivElement | null>(null);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const peers = useRef<{
    [userId: string]: { call: MediaConnection; video: HTMLVideoElement };
  }>({});
  const myPeer = useRef<Peer | null>(null);
  const myStream = useRef<MediaStream | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        myStream.current = stream;

        if (myVideoRef.current) {
          addVideoStream(myVideoRef.current, stream, "You");
        }

        myPeer.current = new Peer(undefined as any, {
          host: "peerjsserver-production.up.railway.app",
          port: 443,
          path: "peerjs/myapp",
          secure: true,
        });

        myPeer.current.on("open", (id: string) => {
          socket?.emit("join-room", { roomId, userId: id });
        });

        myPeer.current?.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");

          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream, call.peer);
          });

          call.on("close", () => {
            removeVideoStream(call.peer);
          });
        });

        socket?.on("user-connected", (userId: string) => {
          connectToNewUser(userId, stream);
        });

        socket?.on("user-disconnected", (userId: string) => {
          if (peers.current[userId]) {
            peers.current[userId].call.close();
            removeVideoStream(userId);
          }
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    return () => {
      socket?.disconnect();
      myPeer.current?.destroy();
    };
  }, [roomId]);

  const connectToNewUser = (userId: string, stream: MediaStream) => {
    const call = myPeer.current?.call(userId, stream);
    const video = document.createElement("video");

    call?.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream, userId);
    });

    call?.on("close", () => {
      removeVideoStream(userId);
    });

    if (call) {
      peers.current[userId] = { call, video };
    }
  };

  const addVideoStream = (
    video: HTMLVideoElement,
    stream: MediaStream,
    peerId: string
  ) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    video.style.width = "200px";
    video.style.height = "200px";
    video.style.objectFit = "cover";
    video.style.borderRadius = "10px";
    video.style.backgroundColor = "black";
    video.style.position = "relative";

    video.dataset.peerId = peerId;

    videoGridRef.current?.append(video);
  };

  const removeVideoStream = (peerId: string) => {
    const videoElements = videoGridRef.current?.querySelectorAll("video");

    videoElements?.forEach((video) => {
      if (video.dataset.peerId === peerId) {
        video.srcObject = null;
        video.remove();
      }
    });

    if (peers.current[peerId]) {
      delete peers.current[peerId];
    }
  };

  return {
    videoGridRef,
    myVideoRef,
    toggleVideo: () => {
      const videoTrack = myStream.current?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    },
    toggleAudio: () => {
      const audioTrack = myStream.current?.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    },
  };
};

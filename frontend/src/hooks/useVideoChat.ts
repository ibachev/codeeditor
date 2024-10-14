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
    myPeer.current = new Peer(undefined as any, {
      host: "localhost",
      port: 3002,
      path: "/myapp",
    });

    myPeer.current.on("open", (id: string) => {
      console.log("Peer open with ID:", id);
      socket?.emit("join-room", { roomId, userId: id });
    });

    if (myVideoRef.current) {
      myVideoRef.current.muted = true;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        // audio: true,
      })
      .then((stream) => {
        myStream.current = stream;
        if (myVideoRef.current) {
          addVideoStream(myVideoRef.current, stream, "You");
        }

        myPeer.current?.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream, call.peer);
          });

          call.on("close", () => {
            console.log(`Call closed for peer: ${call.peer}`);
            removeVideoStream(call.peer);
          });
        });

        socket?.on("user-connected", (userId: string) => {
          console.log("User connected:", userId);
          connectToNewUser(userId, stream);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    // Handle user disconnection
    socket?.on("user-disconnected", (userId: string) => {
      console.log("User disconnected:", userId);
      if (peers.current[userId]) {
        peers.current[userId].call.close();
        removeVideoStream(userId); // Correctly removing the stream based on userId
      }
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
      addVideoStream(video, userVideoStream, userId); // Use userId for the video element
    });

    call?.on("close", () => {
      console.log(`Call closed for userId: ${userId}`);
      removeVideoStream(userId);
    });

    if (call) {
      peers.current[userId] = { call, video }; // Store peer call and video
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

    video.dataset.peerId = peerId; // Store peerId on the video element

    videoGridRef.current?.append(video);
  };

  const removeVideoStream = (peerId: string) => {
    const videoElements = videoGridRef.current?.querySelectorAll("video");

    videoElements?.forEach((video) => {
      if (video.dataset.peerId === peerId) {
        video.srcObject = null; // Stop the stream
        video.remove(); // Remove video element
      }
    });

    if (peers.current[peerId]) {
      delete peers.current[peerId]; // Remove the peer reference
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

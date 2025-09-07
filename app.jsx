import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { WebsimSocket, useQuery } from "@websim/use-query";
import { motion, AnimatePresence } from "framer-motion";
import itemsList from "./common_household_items.json";
const room = new WebsimSocket();
const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported");
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      onResult(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setIsListening(false);
      }
    };
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
    };
  }, [onResult]);
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  return { isListening, startListening, stopListening };
};
function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [wordQueue, setWordQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const videoRef = useRef(null);
  const { data: wordImages, loading } = useQuery(room.collection("word_images"));
  const handleSpeechResult = useCallback(async (transcript) => {
    const currentWord = wordQueue[currentIndex]?.word;
    if (currentWord && transcript.includes(currentWord)) {
      console.log(`Correct word spoken: ${currentWord}`);
      const existingImage = wordImages.find((item) => item.id === currentWord);
      if (!existingImage) {
        setWordQueue((q) => q.map((item, idx) => idx === currentIndex ? { ...item, loading: true } : item));
        try {
          const result = await websim.imageGen({ prompt: `${currentWord}, common household object, photorealistic, white background`, transparent: true });
          await room.collection("word_images").upsert({ id: currentWord, image_url: result.url });
        } catch (e) {
          console.error("Error generating image:", e);
        } finally {
          setWordQueue((q) => q.map((item, idx) => idx === currentIndex ? { ...item, loading: false } : item));
        }
      }
      setScore((s) => s + 1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, wordQueue, wordImages]);
  const { isListening, startListening, stopListening } = useSpeechRecognition(handleSpeechResult);
  useEffect(() => {
    if (!loading) {
      const shuffled = [...itemsList].sort(() => 0.5 - Math.random());
      const initialWords = shuffled.slice(0, 20).map((word) => ({ word, loading: false }));
      setWordQueue(initialWords);
    }
  }, [loading]);
  useEffect(() => {
    if (wordQueue.length > 0 && currentIndex >= wordQueue.length - 5) {
      const shuffled = [...itemsList].sort(() => 0.5 - Math.random());
      const newWords = shuffled.slice(0, 10).filter((w) => !wordQueue.some((qw) => qw.word === w)).map((word) => ({ word, loading: false }));
      setWordQueue((q) => [...q, ...newWords]);
    }
  }, [currentIndex, wordQueue]);
  const startGame = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamEnabled(true);
      setMicEnabled(true);
      startListening();
      setGameStarted(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Please allow camera and microphone access to play.");
    }
  };
  if (!gameStarted) {
    return /* @__PURE__ */ jsxDEV("div", { className: "overlay", children: /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-5xl font-bold mb-4", children: "Augmented Reality Say the Image" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 144,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xl mb-6", children: "Allow camera and microphone access, then say the word you see!" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 145,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: startGame, children: "Start Game" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 146,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 143,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 142,
      columnNumber: 13
    }, this);
  }
  const currentWordData = wordImages?.find((item) => item.id === wordQueue[currentIndex]?.word);
  return /* @__PURE__ */ jsxDEV("div", { className: "w-full h-full bg-black text-white overflow-hidden relative", children: [
    /* @__PURE__ */ jsxDEV("video", { ref: videoRef, className: "webcam-video", autoPlay: true, playsInline: true, muted: true }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 156,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(StatusIndicator, { isListening }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 158,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(ScoreDisplay, { score }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 159,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "conveyor-belt", children: /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        className: "conveyor-track",
        animate: { x: -currentIndex * 340 },
        transition: { type: "spring", stiffness: 100, damping: 20 },
        children: wordQueue.map(({ word, loading: loading2 }, index) => {
          const imageData = wordImages?.find((item) => item.id === word);
          const isSolved = index < currentIndex || index === currentIndex && currentWordData;
          return /* @__PURE__ */ jsxDEV("div", { className: "item-slot", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "item-box", children: [
              /* @__PURE__ */ jsxDEV(AnimatePresence, { children: isSolved && imageData && /* @__PURE__ */ jsxDEV(
                motion.img,
                {
                  src: imageData.image_url,
                  alt: word,
                  className: "item-image",
                  initial: { y: -250, opacity: 0, rotate: -30 },
                  animate: { y: 0, opacity: 1, rotate: 0 },
                  transition: { type: "spring", stiffness: 150, damping: 15, delay: 0.2 }
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 176,
                  columnNumber: 45
                },
                this
              ) }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 174,
                columnNumber: 37
              }, this),
              loading2 && /* @__PURE__ */ jsxDEV("i", { className: "fas fa-spinner fa-spin fa-3x" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 186,
                columnNumber: 50
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 173,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "word-prompt", children: word }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 188,
              columnNumber: 33
            }, this)
          ] }, index, true, {
            fileName: "<stdin>",
            lineNumber: 172,
            columnNumber: 29
          }, this);
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 162,
        columnNumber: 17
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 161,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "focus-marker" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 195,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 155,
    columnNumber: 9
  }, this);
}
const StatusIndicator = ({ isListening }) => /* @__PURE__ */ jsxDEV("div", { className: "status-indicator", children: [
  /* @__PURE__ */ jsxDEV("span", { children: "MIC" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 202,
    columnNumber: 9
  }),
  /* @__PURE__ */ jsxDEV("i", { className: `fas fa-microphone mic-icon ${isListening ? "listening" : ""}` }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 203,
    columnNumber: 9
  })
] }, void 0, true, {
  fileName: "<stdin>",
  lineNumber: 201,
  columnNumber: 5
});
const ScoreDisplay = ({ score }) => /* @__PURE__ */ jsxDEV("div", { className: "score-display", children: [
  "SCORE: ",
  score
] }, void 0, true, {
  fileName: "<stdin>",
  lineNumber: 208,
  columnNumber: 5
});
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 215,
  columnNumber: 13
}));

"use client"; // Ensure this is a Client Component

import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { Container, TextField, Button, Paper, Typography, Box } from "@mui/material";

const symbols = ["+", "÷", "%", "-", "𝚫", "∑", "π", "√", "∞", "∈", "≠"]; // Add more symbols as needed

const getRandomSymbol = () => {
  return symbols[Math.floor(Math.random() * symbols.length)];
};

const getRandomPosition = (width, height) => {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [symbolsData, setSymbolsData] = useState([]);
  
  // Create refs for the message container and text input
  const messageEndRef = useRef(null);
  const inputRef = useRef(null); // Reference for the text input

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ role: "user", content: input }]),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let botMessage = { role: "bot", content: "" };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunkValue = decoder.decode(value);
        botMessage.content += chunkValue;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          if (updatedMessages[updatedMessages.length - 1].role === "bot") {
            updatedMessages[updatedMessages.length - 1] = botMessage;
          } else {
            updatedMessages.push(botMessage);
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    } finally {
      setLoading(false);
      // Focus the input after loading is done with a slight delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100); // Adjust the delay time as needed
    }
  };

  // Handle dynamic emoji background
  useEffect(() => {
    const canvas = document.getElementById("emojiCanvas");
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const symbolCount = 30; // Number of symbols to display

    // Initialize symbols
    const initialSymbols = Array.from({ length: symbolCount }, () => ({
      symbol: getRandomSymbol(),
      ...getRandomPosition(width, height),
      speed: Math.random() * 2 + 1, // Random speed
      direction: Math.random() < 0.5 ? 1 : -1, // Random direction
    }));

    setSymbolsData(initialSymbols);

    const drawSymbols = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)"; // Light background to create fading effect
      ctx.fillRect(0, 0, width, height);

      initialSymbols.forEach((s) => {
        ctx.font = "30px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Color of symbols
        ctx.fillText(s.symbol, s.x, s.y);
        // Update position
        s.y += s.speed * s.direction; // Move in the y direction
        if (s.y < 0 || s.y > height) {
          s.y = getRandomPosition(width, height).y; // Reset position
          s.x = getRandomPosition(width, height).x;
        }
      });

      requestAnimationFrame(drawSymbols);
    };

    drawSymbols();

    return () => cancelAnimationFrame(drawSymbols);
  }, []);

  // Scroll to the bottom of the messages when they change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Container
      maxWidth
      sx={{
        mt: 4,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(135deg, #9c27b0, #2196f3)", // Gradient background
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          minWidth: "50%",
          maxWidth: "50%",
          bgcolor: "#8cc2ff",
          borderRadius: 2,
          zIndex: 3, // Ensure paper is above the canvas
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ 
            color: "white", 
            fontFamily: "Comfortaa, sans-serif", 
            fontSize: "0.5" // Change the size here
          }}
        >
          MATHEMATICA CODE FOR RICCI
        </Typography>
        <Box
          sx={{
            p: 2,
            minHeight: "400px",
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: 2,
            bgcolor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  display: "inline-block",
                  bgcolor: msg.role === "user" ? "#1976d2" : "#7f3aab",
                  color: msg.role === "user" ? "white" : "white",
                  p: 1,
                  borderRadius: 2,
                  maxWidth: "70%", // Set a maximum width
                  wordWrap: "break-word", // Allow words to break and wrap within the container
                  overflow: "hidden", // Hide overflow
                  textOverflow: "ellipsis", // Add ellipsis for overflowed text
                }}
              >
                {msg.content}
              </Typography>
            </Box>
          ))}
          {/* This div serves as a scroll target */}
          <div ref={messageEndRef} />
        </Box>
        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={loading}
            sx={{
              bgcolor: "white",
            }}
            inputRef={inputRef} // Attach the ref to the input
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </Box>
      </Paper>
      {/* Dynamic emoji canvas background */}
      <canvas
        id="emojiCanvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1, // Ensure canvas is below the paper
        }}
      />
    </Container>
  );
}

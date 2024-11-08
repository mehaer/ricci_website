import { NextResponse } from "next/server";
import OpenAI from "openai";
const systemPrompt = `you are a chatbot well who’s well trained on the Ricci package`;
export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const data = await req.json();

  // Create the OpenAI completion request
  const response = await openai.chat.completions.create({
    messages:[{role: 'system', content: systemPrompt}, ...data],
        model: 'ft:gpt-4o-2024-08-06:personal::AHGufXhY',
        stream: true,
  });

  // Set up the ReadableStream for streaming response data
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  // Return the response as a stream
  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}

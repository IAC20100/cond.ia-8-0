import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in server environment!');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

let lastWebhookReceived: string | null = null;
let lastMessageExtracted: string | null = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for express-rate-limit to work correctly behind a proxy (e.g. nginx)
  app.set('trust proxy', 1);

  // 1. Security Headers (OWASP)
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
    crossOriginEmbedderPolicy: false
  }));

  // 2. CORS Protection
  app.use(cors({
    origin: '*', // In production, replace with specific domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key']
  }));

  // 3. Rate Limiting (DoS protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    // Disable validation checks for proxy headers since we've configured Express trust proxy
    validate: {
      trustProxy: false,
      xForwardedForHeader: false,
      forwardedHeader: false,
    },
  });
  app.use('/api/', limiter);

  app.use(express.json());

    // Health check and status endpoint
    app.get('/api/status', (req, res) => {
      console.log('GET /api/status called');
      res.json({ 
        status: 'online', 
        supabaseConfigured: !!supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co',
        geminiConfigured: !!(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        evoConfigured: !!(process.env.VITE_EVO_API_URL && process.env.VITE_EVO_API_KEY && process.env.VITE_EVO_INSTANCE),
        lastWebhookReceived,
        lastMessageExtracted,
        appUrl: process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:3000',
        time: new Date().toISOString() 
      });
    });

    // Webhook for Evolution API
    app.post('/api/webhook/whatsapp', async (req, res) => {
      try {
        lastWebhookReceived = new Date().toISOString();
        const data = req.body;
        const event = (data.event || '').toLowerCase();
        
        console.log(`--- WhatsApp Webhook Received: ${event} ---`);
        console.log('Full Request Body:', JSON.stringify(data, null, 2));
        
        // Evolution API sends message data in different formats depending on the event
        if (event === 'messages.upsert' || event === 'messages_upsert') {
          let messages = [];
          if (data.data?.messages && Array.isArray(data.data.messages)) {
            messages = data.data.messages;
          } else if (Array.isArray(data.data)) {
            messages = data.data;
          } else if (data.data) {
            messages = [data.data];
          }
          
          console.log(`Processing ${messages.length} messages...`);
          
          for (const msg of messages) {
            if (!msg) continue;

            const messageContent = msg.message || msg;
            const remoteJid = msg.key?.remoteJid || msg.remoteJid;
            const pushName = msg.pushName || 'Desconhecido';
            const fromMe = msg.key?.fromMe || false;

            console.log(`--- NEW MESSAGE ---`);
            console.log(`From: ${pushName} (${remoteJid}), fromMe: ${fromMe}`);
            console.log('Full Message Object:', JSON.stringify(msg, null, 2));
            
            // Robust text extraction
            let text = '';
            if (messageContent.conversation) {
              text = messageContent.conversation;
            } else if (messageContent.extendedTextMessage?.text) {
              text = messageContent.extendedTextMessage.text;
            } else if (messageContent.imageMessage?.caption) {
              text = messageContent.imageMessage.caption;
            } else if (messageContent.videoMessage?.caption) {
              text = messageContent.videoMessage.caption;
            } else if (messageContent.buttonsResponseMessage?.selectedButtonId) {
              text = messageContent.buttonsResponseMessage.selectedButtonId;
            } else if (messageContent.listResponseMessage?.title) {
              text = messageContent.listResponseMessage.title;
            } else if (typeof messageContent === 'string') {
              text = messageContent;
            } else if (msg.text) {
              text = msg.text;
            }

            console.log(`Extracted text: "${text}", fromMe: ${fromMe}, remoteJid: ${remoteJid}`);

            // Loop prevention: skip if message contains the hidden bot character (\u200B)
            if (text && text.includes('\u200B')) {
              console.log('Skipping message sent by the bot (hidden character detected).');
              continue;
            }

            // Skip messages sent by the user to themselves if they don't mention Bia
            // We use a more permissive check here to ensure we don't miss anything
            const containsBia = text.toLowerCase().includes('bia');
            if (fromMe && !containsBia) {
              console.log('Skipping message sent by the user to themselves (no Bia mention).');
              continue;
            }

            if (text) {
              lastMessageExtracted = text;
              console.log(`Processing message from ${pushName} (${remoteJid}): "${text}"`);
              
              // Insert into a table for the frontend to process
              console.log('Inserting command into Supabase...');
              const { data: insertData, error } = await supabase.from('whatsapp_commands').insert([{
                sender_name: pushName,
                sender_number: remoteJid,
                message_text: text,
                processed: false,
                created_at: new Date().toISOString()
              }]).select();

              if (error) {
                console.error('❌ Error inserting command into Supabase:', JSON.stringify(error, null, 2));
              } else {
                console.log('✅ Command inserted successfully into Supabase:', JSON.stringify(insertData, null, 2));
              }
            } else {
              console.log('⚠️ No text content found in message structure.');
            }
          }
        } else {
          console.log(`Unhandled event type: ${event}`);
        }

        res.status(200).send('OK');
      } catch (error) {
        console.error('🔥 Critical error in WhatsApp webhook handler:', error);
        res.status(500).send('Internal Server Error');
      }
    });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Webhook URL for Evolution API: ${appUrl}/api/webhook/whatsapp`);
  });
}

startServer();

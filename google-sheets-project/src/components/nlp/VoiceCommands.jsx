/* eslint-disable */
/**
 * Voice Commands Component
 * Voice commands integration for hands-free data queries
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Space, Typography, Tag, Alert, message } from "antd";
import {
  AudioOutlined,
  StopOutlined,
  SoundOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./VoiceCommands.css";

const { Title, Text } = Typography;

const VoiceCommands = ({ onCommand = null }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSupported(true);
      initializeSpeechRecognition();
    } else {
      setIsSupported(false);
      setError("Voice commands không được hỗ trợ trong trình duyệt này.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "vi-VN"; // Vietnamese

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        message.info("Đang nghe...");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);

        if (onCommand) {
          onCommand(transcript);
        }

        message.success(`Đã nhận lệnh: ${transcript}`);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Lỗi nhận diện giọng nói: ${event.error}`);
        setIsListening(false);
        message.error("Lỗi nhận diện giọng nói");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Speech recognition initialization error:", err);
      setError("Không thể khởi tạo voice recognition");
      setIsSupported(false);
    }
  };

  const startListening = () => {
    if (!isSupported) {
      message.warning("Voice commands không được hỗ trợ");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Start listening error:", err);
        message.error("Không thể bắt đầu nghe");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <Card className="voice-commands">
      <Title level={4}>
        <SoundOutlined /> Voice Commands
      </Title>

      {!isSupported && (
        <Alert
          message="Không hỗ trợ"
          description="Trình duyệt của bạn không hỗ trợ voice recognition. Vui lòng sử dụng Chrome hoặc Edge."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div className="voice-controls">
          {!isListening ? (
            <Button
              type="primary"
              size="large"
              icon={<AudioOutlined />}
              onClick={startListening}
              disabled={!isSupported}
              style={{ width: "100%" }}
            >
              Bắt đầu nghe
            </Button>
          ) : (
            <Button
              danger
              size="large"
              icon={<StopOutlined />}
              onClick={stopListening}
              style={{ width: "100%" }}
            >
              Dừng nghe
            </Button>
          )}
        </div>

        {transcript && (
          <Card size="small" title="Lệnh đã nhận">
            <Text>{transcript}</Text>
          </Card>
        )}

        <div className="voice-tips">
          <Text strong>Gợi ý lệnh:</Text>
          <Space wrap style={{ marginTop: 8 }}>
            <Tag>Show me trends</Tag>
            <Tag>Find anomalies</Tag>
            <Tag>Summary data</Tag>
            <Tag>Filter by date</Tag>
            <Tag>Search for...</Tag>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default VoiceCommands;

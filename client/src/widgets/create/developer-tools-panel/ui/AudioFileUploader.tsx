// 任意の音声ファイルをアップロード
import { Button } from "@chakra-ui/react";
import React from "react";

type Props = { onAudioFileSelected: (file: Blob) => void };

export const AudioFileUploader: React.FC<Props> = ({ onAudioFileSelected }) => {
  const [fileName, setFileName] = React.useState("");
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onAudioFileSelected(file); setFileName(file.name); }
  };
  return (
    <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ color: "#333" }}>任意の音声ファイルをアップロード:</span>
      <input type="file" id="audio-upload" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />
      <label htmlFor="audio-upload"><Button as="span" colorScheme="blue" size="sm">ファイルを選択</Button></label>
      {fileName && (<span style={{ fontSize: "0.9rem", color: "#555" }}>{fileName}</span>)}
    </div>
  );
};

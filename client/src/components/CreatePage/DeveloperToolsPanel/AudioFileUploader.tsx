// 任意の音声ファイルをアップロードし、選択されたファイルを親コンポーネントに渡す。

import React from "react";
import { Button } from "@chakra-ui/react";

type Props = {
  onAudioFileSelected: (file: Blob) => void;
};

export const AudioFileUploader: React.FC<Props> = ({ onAudioFileSelected }) => {
  // 選択されたファイル名を状態として保持
  const [fileName, setFileName] = React.useState("");

  // ファイル選択時の処理：ファイルを親に渡し、ファイル名を状態に保存
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📁 ファイルがアップロードされました:", file.name);
      onAudioFileSelected(file);
      setFileName(file.name);
    }
  };

  return (
    <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ color: "#333" }}>任意の音声ファイルをアップロード:</span>
      {/* 非表示のファイル選択 input 要素（label 経由で起動） */}
      <input
        type="file"
        id="audio-upload"
        accept="audio/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {/* 「ファイルを選択」ボタン（labelでinputをラップ） */}
      <label htmlFor="audio-upload">
        <Button as="span" colorScheme="blue" size="sm">
          ファイルを選択
        </Button>
      </label>
      {/* ファイル名が存在する場合、その名前を表示 */}
      {fileName && (
        <span style={{ fontSize: "0.9rem", color: "#555" }}>{fileName}</span>
      )}
    </div>
  );
};
// [UI] widgets/ui - AudioFileUploader.tsx
// 役割: 表示・入力のUIコンポーネント
// 任意の音声ファイルをアップロード
import styled from '@emotion/styled';
import UploadIcon from '@mui/icons-material/Upload';
import React from "react";
import { glassBackground } from '@/shared/styles/glassBackground';

type Props = { onAudioFileSelected: (file: Blob) => void };

const UploadArea = styled.label`
  ${glassBackground}
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100px;
  width: 200px;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
  font-size: 1.2rem;
  margin: 0;
  min-height: auto;
  background: transparent;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const AudioFileUploader: React.FC<Props> = ({ onAudioFileSelected }) => {
  const [fileName, setFileName] = React.useState("");
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onAudioFileSelected(file); setFileName(file.name); }
  };
  return (
    <div>
      <input type="file" id="audio-upload" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />
      <UploadArea htmlFor="audio-upload" style={{ display: "inline-flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>Choose File</span>
          <UploadIcon fontSize="small" />
        </div>
        {fileName && (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 6 }} title={fileName}>
            <span style={{ fontSize: '1.2rem', color: 'white' }}>{fileName}</span>
          </div>
        )}
      </UploadArea>

    </div>
  );
};

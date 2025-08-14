import { css } from "@emotion/react";

export const glassBackground = css`
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 20px;
  max-width: 960px;
  margin: 40px auto;
  min-height: calc(100vh - 80px);
`;
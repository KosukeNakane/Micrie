// [UI] widgets/ui - AboutLinksPanel.tsx
// 役割: 表示・入力のUIコンポーネント
import { Box, Link, Text } from '@chakra-ui/react';
import { useState } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export const AboutLinksPanel = () => {
  // 連続角度（ラップさせない）にして、360→0の境界での補間による色ブレを防ぐ
  const [hueStep, setHueStep] = useState<number>(0);
  const nextHue = () => setHueStep((s) => s + 1);
  const angle = hueStep * 60; // 0,60,120,... と単調増加
  const logoStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    borderRadius: 8,
    display: 'block',
    filter: `hue-rotate(${angle}deg) saturate(1.15)`,
    transition: 'filter 160ms ease',
  };
  return (
    <Box mt={2} w="100%" maxW="100%" mx="auto" color="white">
      {/* 縦並び：画像 → リンク（2行）→ 説明 */}
      <Box mb={4} display="flex" justifyContent="center" >
        <img
          src="/Micrie-logo-name-tagline.png"
          alt="Micrie Logo"
          style={{ ...logoStyle, cursor: 'pointer' }}
          onClick={nextHue}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextHue(); } }}
          aria-label="Change logo color"
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={3} mb={6}>
        <Link
          href="https://github.com/KosukeNakane/Micrie"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          gap={3}
          p={3}
          borderRadius="md"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          <img src="/github-icon.png" alt="GitHub" style={{ width: 24, height: 24 }} />
          <Text fontSize="md" fontWeight="semibold" color={'white'}>GitHub Repository</Text>
        </Link>
        <Link
          href="https://docs.example.com/how-to-use"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          gap={3}
          p={3}
          borderRadius="md"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          <OpenInNewIcon sx={{ fontSize: 24 }} />
          <Text fontSize="md" fontWeight="semibold" color={'white'}>How To Use</Text>
        </Link>
      </Box>
      {/* Bottom action: color change button */}
      <Box
        mt={4}
        display="flex"
        justifyContent="center"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        py={3}
      >
        <Text fontSize="md" color={'white'}>Version 0.1.0-beta.1</Text>
      </Box>
    </Box>
  );
};

/** @jsxImportSource @emotion/react */
import { Box, Button, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LoginModal } from "./LoginModal";

type Props = {
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onSaveProjectAs?: () => void;
  userName?: string; // 未ログイン時は undefined
};

export const Sidebar = ({
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
  userName,
}: Props) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const handleOpen = () => onOpenProject?.();
  const handleSave = () => onSaveProject?.();
  const handleSaveAs = () => onSaveProjectAs?.();

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      width="240px"
      bg="whiteAlpha.600"
      backdropFilter="blur(20px)"
      borderRightWidth="1px"
      borderColor="whiteAlpha.400"
      boxShadow="md"
      zIndex={2}
      p={4}
      fontFamily={'brandon-grotesque, sans-serif'}
    >
      <Box display="flex" flexDir="column" justifyContent="space-between" h="full">
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
            Project
          </Text>
          <Box display="flex" flexDir="column" gap={2}>
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={handleOpen}
              _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
              data-testid="sidebar-open-project"
            >
              Open Project…
            </Button>
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={handleSave}
              _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
              data-testid="sidebar-save-project"
            >
              Save Project
            </Button>
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={handleSaveAs}
              _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
              data-testid="sidebar-save-project-as"
            >
              Save Project As…
            </Button>
          </Box>
        </Box>

        <Box>
          <Box my={3} height="1px" bg="whiteAlpha.500" />
          {userName ? (
            <Text fontSize="sm" color="gray.700" px={1} data-testid="sidebar-username">
              {userName}
            </Text>
          ) : (
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => setLoginOpen(true)}
              _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
              data-testid="sidebar-login"
            >
              login
            </Button>
          )}
        </Box>
      </Box>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};

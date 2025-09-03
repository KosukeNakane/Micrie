/** @jsxImportSource @emotion/react */
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useAuthUiStore } from "@/features/auth/model/uiStore";
import { LoginModal } from "./LoginModal";
import { UserProfileModal } from "./UserProfileModal";
import { useAuthStore, getDisplayName } from "@/entities/user";
import {
  signInWithEmailPassword,
  signInWithGoogle,
  signInWithGithub,
  requestPasswordReset,
  signOut,
  registerWithEmailPassword,
} from "@/features/auth";
import LogoutIcon from '@mui/icons-material/Logout';

type Props = {
  onNewProject?: () => void;
  onOpenProject?: () => void;
  onSaveProject?: () => void;
  onSaveProjectAs?: () => void;
};

export const Sidebar = ({
  onNewProject,
  onOpenProject,
  onSaveProject,
  onSaveProjectAs,
}: Props) => {
  const loginOpen = useAuthUiStore((s) => s.loginOpen);
  const setLoginOpen = useAuthUiStore((s) => s.setLoginOpen);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { user } = useAuthStore();
  const handleNew = () => onNewProject?.();
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
              variant="solid"
              justifyContent="flex-start"
              onClick={handleNew}
              colorPalette="blue"
              _hover={{ bg: 'rgba(99, 179, 237, 0.85)' }}
              data-testid="sidebar-new-project"
            >
              New Project
            </Button>
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
          {user ? (
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Button
                variant="ghost"
                onClick={() => setProfileOpen(true)}
                _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                title="Edit username"
                px={2}
                py={1}
              >
                <Text fontSize="sm" color="gray.700" data-testid="sidebar-username">
                  {getDisplayName(user)}
                </Text>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLogoutConfirm(true)}
                _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                aria-label="Logout"
                title="Logout"
                p={1}
                minW="auto"
              >
                <LogoutIcon fontSize="small" />
              </Button>
            </Box>
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

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={({ email, password }) => signInWithEmailPassword(email, password)}
        onRegister={({ email, password, username }) => registerWithEmailPassword(email, password, username)}
        onForgotPassword={async (email) => {
          try { await requestPasswordReset(email); } catch (e) { console.error(e); }
        }}
        onOAuth={{
          google: () => signInWithGoogle(),
          github: () => signInWithGithub(),
        }}
      />

      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {logoutConfirm && createPortal(
        <Box position="fixed" inset={0} zIndex={1100}>
          <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={() => setLogoutConfirm(false)} />
          <Box
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            bg="white"
            borderRadius="md"
            boxShadow="xl"
            width="min(92vw, 420px)"
            p={5}
          >
            <Text fontSize="md" fontWeight="bold" mb={3}>ログアウトしますか？</Text>
            <Text fontSize="sm" color="gray.700" mb={4}>作業内容の保存を確認してください。</Text>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="ghost" onClick={() => setLogoutConfirm(false)}>キャンセル</Button>
              <Button colorPalette="red" onClick={async () => {
                setLogoutConfirm(false);
                try { await signOut(); } catch (e) { console.error(e); }
              }}>ログアウト</Button>
            </Box>
          </Box>
        </Box>,
        document.body
      )}
    </Box>
  );
};

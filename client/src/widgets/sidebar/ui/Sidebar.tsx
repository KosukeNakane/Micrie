/** @jsxImportSource @emotion/react */
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useProjectState } from "@/features/project-save-load/model/store";
import { StyledArea } from "@shared/ui";
import { DeveloperToolsPanel } from "@widgets/recording/developer-tools-panel";

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
  // スライドイン制御
  const [open, setOpen] = useState(false);
  const closingTimer = useRef<number | null>(null);
  const mouseXRef = useRef<number>(Infinity);
  const isTouchPrimary = useMemo(
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false),
    []
  );
  const loginOpen = useAuthUiStore((s) => s.loginOpen);
  const setLoginOpen = useAuthUiStore((s) => s.setLoginOpen);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { user } = useAuthStore();
  const projectName = useProjectState((s) => s.currentProjectName);
  const projectTitle = (projectName?.trim() ? projectName.trim() : "Untitled");
  const handleNew = () => onNewProject?.();
  const handleOpen = () => onOpenProject?.();
  const handleSave = () => onSaveProject?.();
  const handleSaveAs = () => onSaveProjectAs?.();
  // Developer Tools state (moved from RecordingPage)
  const [devOpen, setDevOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [devAudioBlob, setDevAudioBlob] = useState<Blob | null>(null);
  const [trimmingEnabled, setTrimmingEnabled] = useState(false);

  // タッチ: 左端からのスワイプで開き、サイドバー内からの左スワイプで閉じる
  useEffect(() => {
    let startX = 0; let startY = 0; let tracking = false;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; tracking = startX < 24 || (open && startX < 260);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX; const dy = Math.abs(t.clientY - startY);
      if (dy > 40) return; // 縦移動は無視
      if (!open && dx > 40) setOpen(true);
      if (open && dx < -40) setOpen(false);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart as any);
      window.removeEventListener('touchmove', onTouchMove as any);
    };
  }, [open]);

  // デスクトップ: 画面左端にマウスが近づいたら開く
  useEffect(() => {
    if (isTouchPrimary) return; // タッチデバイスでは無効
    const onMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      if (e.clientX < 16) setOpen(true);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isTouchPrimary]);

  // DevTools を閉じた後、カーソルがホットスポット外ならサイドバーを自動で閉じる
  useEffect(() => {
    if (devOpen) {
      setOpen(true);
      return;
    }
    if (isTouchPrimary) {
      setOpen(false);
    } else {
      setOpen(mouseXRef.current < 24);
    }
  }, [devOpen, isTouchPrimary]);

  return (
    <>
      {/* 左端ホットスポット（デスクトップ） */}
      {!isTouchPrimary && (
        <Box
          position="fixed"
          left={0}
          top={0}
          bottom={0}
          width="24px"
          zIndex={3}
          onMouseEnter={() => { if (closingTimer.current) { window.clearTimeout(closingTimer.current); closingTimer.current = null; } setOpen(true); }}
        />
      )}

      {/* 背景オーバーレイ（クリックで閉じる） */}
      {open && <Box position="fixed" inset={0} zIndex={3} onClick={() => setOpen(false)} />}

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
        zIndex={4}
        p={4}
        fontFamily={'brandon-grotesque, sans-serif'}
        transition="transform 160ms ease"
        transform={open ? 'translateX(0)' : 'translateX(-100%)'}
        onMouseLeave={() => { if (!isTouchPrimary) { closingTimer.current = window.setTimeout(() => setOpen(false), 120); } }}
        onMouseEnter={() => { if (closingTimer.current) { window.clearTimeout(closingTimer.current); closingTimer.current = null; } }}
      >
        <Box display="flex" flexDir="column" justifyContent="space-between" h="full">
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Text fontSize="sm" fontWeight="bold" color="gray.600">
                Project
              </Text>
              <Text fontSize="sm" color="gray.700" title={projectTitle}>
                {projectTitle}
              </Text>
            </Box>
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
          <Button
            variant="ghost"
            justifyContent="flex-start"
            onClick={() => setDevOpen(true)}
            _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
          >
            Developer Tools
          </Button>
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

      {/* Developer Tools Modal */}
      {devOpen && createPortal(
        <Box position="fixed" inset={0} zIndex={1200}>
          <Box position="absolute" inset={0} bg="blackAlpha.500" onClick={() => setDevOpen(false)} />
          <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)" width="min(95vw, 960px)">
            <StyledArea style={{ padding: 16 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Text fontWeight="bold">Developer Tools</Text>
                <Button variant="ghost" onClick={() => setDevOpen(false)}>Close</Button>
              </Box>
              <DeveloperToolsPanel
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                devAudioBlob={devAudioBlob}
                setDevAudioBlob={setDevAudioBlob}
                trimmingEnabled={trimmingEnabled}
                setTrimmingEnabled={setTrimmingEnabled}
              />
            </StyledArea>
          </Box>
        </Box>,
        document.body
      )}

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
    </>
  );
};

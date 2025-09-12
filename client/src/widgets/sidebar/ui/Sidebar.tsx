/** @jsxImportSource @emotion/react */
import { Box, Button, Text } from "@chakra-ui/react";
import { createPortal } from "react-dom";
import { usePortalRoot } from "@/app/providers/PortalRootContext";
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
import { BASE_W, BASE_H } from "@/app/providers/Scaler";

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
  const portalRoot = usePortalRoot();
  // スライドイン制御
  const [open, setOpen] = useState(false);
  const closingTimer = useRef<number | null>(null);
  const mouseXRef = useRef<number>(Infinity);
  const hoveringNavRef = useRef<boolean>(false);
  const HOTSPOT_BASE = 300; // 左端ホットスポットの基準幅
  const NAV_BASE_W = 300; // サイドバーの基準幅（スケール前）
  const OVERSHOOT = 64; // 閉時に完全退避させるための追加オフセット

  // 画面サイズに追従するスケール（Scaler と同じ計算式）
  const [vw, setVw] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [vh, setVh] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 0);
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const scale = useMemo(() => {
    if (!vw || !vh) return 1;
    // Scaler と同一のスケール計算（上限を設けず、1440x1024基準で拡大も縮小も行う）
    return Math.min(vw / BASE_W, vh / BASE_H);
  }, [vw, vh]);
  const HOTSPOT_W = Math.round(HOTSPOT_BASE * scale);
  const NAV_W = Math.round(NAV_BASE_W * scale);
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
      startX = t.clientX; startY = t.clientY; tracking = startX < HOTSPOT_W || (open && startX < NAV_W + 80);
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

  // デスクトップ: 画面左端にマウスが近づいたら開く（閉じるのはnavから離れた時）
  useEffect(() => {
    if (isTouchPrimary) return; // タッチデバイスでは無効
    const onMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      if (!open && e.clientX < HOTSPOT_W) {
        setOpen(true);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isTouchPrimary, open, HOTSPOT_W]);

  // DevTools を閉じた後、カーソルがホットスポット外ならサイドバーを自動で閉じる
  useEffect(() => {
    if (devOpen) {
      setOpen(true);
      return;
    }
    if (isTouchPrimary) {
      setOpen(false);
    } else {
      // DevToolsクローズ直後のみの初期状態調整。通常の開閉はホットスポットとnavのホバーで制御。
      setOpen(false);
    }
  }, [devOpen, isTouchPrimary]);

  return (
    <>
      {/* 左端ホットスポット（デスクトップ） */}
      {!isTouchPrimary && !open && (
        <Box
          position="fixed"
          left={0}
          top={0}
          bottom={0}
          width={`${HOTSPOT_W}px`}
          zIndex={3}
          onMouseEnter={() => { if (closingTimer.current) { window.clearTimeout(closingTimer.current); closingTimer.current = null; } setOpen(true); }}
        />
      )}

      {/* 背景オーバーレイ（クリックで閉じる） */}
      {open && <Box position="fixed" inset={0} zIndex={3} onClick={() => setOpen(false)} />}

      {/* 外側の固定ラッパー（スライドはこの要素で制御、幅はスケール済み） */}
      <Box
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        width={`${NAV_W}px`}
        zIndex={4}
        overflow="hidden"
        transition="transform 160ms ease"
        transform={
          open
            ? 'translateX(0)'
            : `translateX(calc(-100% - max(${OVERSHOOT}px, env(safe-area-inset-left, 0px))))`
        }
        onMouseLeave={() => { if (!isTouchPrimary) { hoveringNavRef.current = false; closingTimer.current = window.setTimeout(() => setOpen(false), 120); } }}
        onMouseEnter={() => { hoveringNavRef.current = true; if (closingTimer.current) { window.clearTimeout(closingTimer.current); closingTimer.current = null; } }}
      >
        {/* 内側の実体（ここでスケールを適用） */}
        <Box
          as="nav"
          position="absolute"
          left={0}
          top={0}
          width={`${NAV_BASE_W}px`}
          bg="whiteAlpha.600"
          backdropFilter="blur(20px)"
          borderRightWidth={open ? '1px' : '0'}
          borderColor="whiteAlpha.400"
          boxShadow={open ? 'md' : 'none'}
          p={4}
          fontFamily={'brandon-grotesque, sans-serif'}
          borderRadius="0 12px 12px 0"
          overflow="hidden"
          css={{
            height: `calc(100% / ${scale || 1})`,
            transform: `scale(${scale})`,
            transformOrigin: 'left top',
          }}
        >
          <Box display="flex" flexDir="column" justifyContent="space-between" h="full" color="rgba(5, 4, 69, 0.8)">
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Text fontSize="22px" fontWeight="meduim" color="rgba(5, 4, 69, 0.8)">
                  Project
                </Text>
                <Text fontSize="22px" fontWeight="meduim" color="rgba(5, 4, 69, 0.8)" title={projectTitle}>
                  {projectTitle}
                </Text>
              </Box>
              <Box display="flex" flexDir="column" gap={2}>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={handleOpen}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-open-project"
                  fontSize="20px"
                  fontWeight="normal"
                  color="rgba(5, 4, 69, 0.8)"
                >
                  New Project
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={handleOpen}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-open-project"
                  fontSize="20px"
                  fontWeight="normal"
                  color="rgba(5, 4, 69, 0.8)"
                >
                  Open Project…
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={handleSave}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-save-project"
                  fontSize="20px"
                  fontWeight="normal"
                  color="rgba(5, 4, 69, 0.8)"
                >
                  Save Project
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={handleSaveAs}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-save-project-as"
                  fontSize="20px"
                  fontWeight="normal"
                  color="rgba(5, 4, 69, 0.8)"
                >
                  Save Project As…
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={handleSaveAs}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-save-project-as"
                  fontSize="20px"
                  fontWeight="normal"
                  color="rgba(5, 4, 69, 0.8)"
                >
                  Developer Tools
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
                    <Text fontSize="26px" fontWeight="meduim" color="rgba(5, 4, 69, 0.8)" data-testid="sidebar-username">
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
                    <LogoutIcon fontSize="large" fontWeight="meduim" />
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => setLoginOpen(true)}
                  _hover={{ bg: 'rgba(172, 203, 229, 0.45)' }}
                  data-testid="sidebar-login"
                  fontWeight="normal"
                  fontSize={"20px"}
                >
                  login
                </Button>
              )}
            </Box>
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
          portalRoot ?? document.body
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
          portalRoot ?? document.body
        )}
      </Box>
    </>
  );
};

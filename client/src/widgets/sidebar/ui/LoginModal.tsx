import { Box, Button, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (payload: { email: string; password: string }) => void;
};

export const LoginModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ email, password });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1000}>
      {/* Overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
      {/* Content */}
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
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Login
        </Text>
        <Box display="flex" flexDir="column" gap={3}>
          <Box>
            <Text fontSize="sm" mb={1}>
              Email
            </Text>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Box>
          <Box>
            <Text fontSize="sm" mb={1}>
              Password
            </Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2} mt={5}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorPalette="blue" onClick={handleSubmit}>
            Login
          </Button>
        </Box>
      </Box>
    </Box>,
    document.body
  );
};

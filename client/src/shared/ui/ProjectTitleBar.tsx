import { Box, Text } from "@chakra-ui/react";
import { useProjectState } from "@/features/project-save-load/model/store";

export const ProjectTitleBar = () => {
  const name = useProjectState((s) => s.currentProjectName);
  const title = (name?.trim() ? name.trim() : "Untitled");
  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg="whiteAlpha.800"
      backdropFilter="blur(6px)"
      borderBottomWidth="1px"
      px={4}
      py={2}
    >
      <Text fontWeight="semibold" fontSize="md" color="gray.800">
        {title}
      </Text>
    </Box>
  );
};


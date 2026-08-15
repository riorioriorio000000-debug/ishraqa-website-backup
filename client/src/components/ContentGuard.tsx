import { useEffect } from "react";

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, [contenteditable='true']"));
}

/**
 * Adds lightweight browser-level friction against casual copying, saving and image dragging.
 * Client-side code cannot prevent screenshots or developer tools; it is not presented as DRM.
 */
export default function ContentGuard() {
  useEffect(() => {
    const stopCopy = (event: ClipboardEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };
    const stopContextMenu = (event: MouseEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };
    const stopImageDrag = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    };

    document.addEventListener("copy", stopCopy);
    document.addEventListener("contextmenu", stopContextMenu);
    document.addEventListener("dragstart", stopImageDrag);
    return () => {
      document.removeEventListener("copy", stopCopy);
      document.removeEventListener("contextmenu", stopContextMenu);
      document.removeEventListener("dragstart", stopImageDrag);
    };
  }, []);

  return null;
}

import * as React from "react";
import * as ReactDOM from "react-dom";

const DialogOverlay = React.forwardRef(
  ({ isOpen = true, ...props }, forwardedRef) => {
    return isOpen ? (
      <Portal>
        <DialogInner ref={forwardedRef} {...props} />
      </Portal>
    ) : null;
  }
);

DialogOverlay.displayName = "DialogOverlay";

const DialogInner = React.forwardRef(
  ({ onDismiss = noop, ...props }, forwardedRef) => {
    let mouseDownTarget = React.useRef(null);

    function handleClick(event) {
      if (mouseDownTarget.current === event.target) {
        event.stopPropagation();
        onDismiss(event);
      }
    }

    function handleMouseDown(event) {
      mouseDownTarget.current = event.target;
    }

    return (
      <div
        {...props}
        ref={forwardedRef}
        data-dialog-overlay=""
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      />
    );
  }
);

DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(({ ...props }, forwardedRef) => {
  function handleClick(event) {
    event.stopPropagation();
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      {...props}
      ref={forwardedRef}
      data-dialog-content=""
      onClick={handleClick}
    />
  );
});

DialogContent.displayName = "DialogContent";

const Dialog = React.forwardRef(
  ({ isOpen, onDismiss = noop, ...props }, forwardedRef) => {
    return (
      <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
        <DialogContent ref={forwardedRef} {...props} />
      </DialogOverlay>
    );
  }
);

Dialog.displayName = "Dialog";

function Portal({ children }) {
  let mountRef = React.useRef(null);
  let portalRef = React.useRef(null);
  let [, forceUpdate] = React.useState(() => Object.create(null));

  React.useLayoutEffect(() => {
    let mountNode = mountRef.current;
    // This ref may be null when a hot-loader replaces components on the page
    if (!mountNode) {
      return;
    }

    let ownerDocument = mountNode.ownerDocument;
    portalRef.current = ownerDocument.createElement("div");
    portalRef.current.setAttribute("data-portal", "");
    ownerDocument.body.appendChild(portalRef.current);
    forceUpdate(Object.create(null));
    return () => {
      if (portalRef.current) {
        ownerDocument.body.removeChild(portalRef.current);
      }
    };
  }, []);

  return portalRef.current ? (
    ReactDOM.createPortal(children, portalRef.current)
  ) : (
    <span ref={mountRef} />
  );
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export { DialogContent, DialogOverlay };

////////////////////////////////////////////////////////////////////////////////
// Utilities

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * @param ref
 * @param value
 */
function assignRef(ref, value) {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useComposedRefs(...refs) {
  return React.useCallback((node) => {
    for (let ref of refs) {
      assignRef(ref, node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function composeEventHandlers(theirHandler, ourHandler) {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
}

function noop() {}

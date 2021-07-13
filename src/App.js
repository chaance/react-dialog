import React from "react";
import logo from "./logo.svg";
import { DialogOverlay, DialogContent } from "./Dialog";
import "./App.css";

function App() {
  let [isOpen, setIsOpen] = React.useState(false);
  let rootRef = React.useRef(null);
  let closeButtonRef = React.useRef(null);
  let open = () => setIsOpen(true);
  let close = () => setIsOpen(false);

  return (
    <div className="App" ref={rootRef}>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button className="button" onClick={open} tabIndex={-1}>
          Open Dialog
        </button>
      </header>
      <DialogOverlay
        isOpen={isOpen}
        onDismiss={close}
        aria-labelledby="dialog-heading"
        rootRef={rootRef}
        initialFocusRef={closeButtonRef}
      >
        <DialogContent>
          <h2 id="dialog-heading">Friendly announcement</h2>
          <p>Hello there 👋 I am a dialog!</p>
          <input type="text" aria-label="Name" placeholder="Name..." />
          <button ref={closeButtonRef} onClick={close}>
            Close me
          </button>
        </DialogContent>
      </DialogOverlay>
    </div>
  );
}

export default App;

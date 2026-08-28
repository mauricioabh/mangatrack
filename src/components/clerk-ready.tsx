type ClerkReadyProps = {
  mode: "signIn" | "signUp";
};

export function ClerkAuthForm({ mode }: ClerkReadyProps) {
  const containerId = `clerk-${mode}-components`;
  const script = `
    (() => {
      const mode = ${JSON.stringify(mode)};
      const containerId = ${JSON.stringify(containerId)};
      let attempts = 0;

      const mount = () => {
        const clerk = window.Clerk;
        const container = document.getElementById(containerId);

        if (!clerk || !container) {
          if (attempts++ < 200) window.setTimeout(mount, 100);
          return;
        }

        const loaded = clerk.loaded ? Promise.resolve() : clerk.load();
        loaded
          .then(() => {
            if (!container.hasChildNodes()) {
              if (mode === "signIn") {
                clerk.mountSignIn(container);
              } else {
                clerk.mountSignUp(container);
              }
            }
          })
          .catch(() => {
            container.textContent =
              "Unable to load authentication. Please refresh the page.";
          });
      };

      mount();
    })();
  `;

  return (
    <>
      <div id={containerId} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}

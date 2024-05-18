export const csrfToken = () => {
    const csrfElement: HTMLElement | null = document.querySelector(
      '[name="csrf-token"]'
    );
    const csrfToken =
      csrfElement instanceof HTMLMetaElement ? csrfElement.content : "";
    return csrfToken;
  };
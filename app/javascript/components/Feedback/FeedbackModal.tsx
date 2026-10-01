import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { csrfToken } from "../../utilities/csrfToken";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

// Feedback used to be its own full page (reached via a real navigation, with
// a `return_to` param to find its way back to the SPA page the user came
// from). That round-trip could land on a blank screen depending on how the
// SPA shell re-hydrated, so this is a modal instead — it renders over
// whatever page is already showing, and "Back" is just closing it, since
// there's nowhere else to navigate to.
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
    setEmail("");
    setError(null);
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token": csrfToken(),
        },
        body: JSON.stringify({ feedback: { title, body, email } }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data && typeof data === "object"
            ? Object.values(data).flat().join(", ")
            : "Could not submit feedback.";
        setError(message || "Could not submit feedback.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-night bg-opacity-60"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-night text-cream rounded-lg p-6 flex flex-col gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="w-fit text-cream underline"
          >
            &larr; Back
          </button>

          {submitted ? (
            <>
              <DialogTitle className="text-2xl font-semibold">
                Thanks!
              </DialogTitle>
              <p>I read all of these.</p>
              <button
                type="button"
                onClick={handleClose}
                className="w-fit text-night h-9 px-4 bg-cream rounded-md self-end"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <DialogTitle className="text-2xl font-semibold">
                What's on your mind?
              </DialogTitle>
              <p className="text-sm">
                However harsh it sounds, it'll be nicer than whatever the next
                person to find the same problem <i>thinks</i>, so don't spare
                me, please.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <label className="flex flex-col gap-1 text-sm">
                  Title
                  <input
                    className="bg-cream text-night rounded px-2 py-1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Body
                  <textarea
                    className="bg-cream text-night rounded px-2 py-1"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Email (optional, only fill out if you want a response)
                  <input
                    className="bg-cream text-night rounded px-2 py-1"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-fit text-night h-9 px-4 bg-cream rounded-md self-end disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default FeedbackModal;

import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface Guest {
  name: string;
  email?: string;
  added_at?: string;
}

interface GuestInfoModalProps {
  // The guest to view, or null to keep the modal closed.
  guest: Guest | null;
  onClose: () => void;
}

// Read-only view of an anonymous guest's info. Unlike UserProfileModal,
// guests aren't Users — they have no account/uuid to fetch by — whatever
// they typed into the "Add yourself as a guest" form
// (TripsController#add_guest) is already inline in trip.guest_list, so this
// just renders that data directly with no fetch involved.
export const GuestInfoModal: React.FC<GuestInfoModalProps> = ({
  guest,
  onClose,
}) => (
  <Dialog open={!!guest} onClose={onClose} className="relative z-50">
    <div className="fixed inset-0 bg-night bg-opacity-60" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="w-full max-w-sm bg-night text-cream rounded-lg p-6 flex flex-col gap-4">
        {guest && (
          <>
            <DialogTitle className="text-2xl font-semibold">
              {guest.name}
            </DialogTitle>
            <div className="flex flex-col gap-3">
              <GuestRow label="Email" value={guest.email} />
            </div>
            <p className="text-ashgray text-xs">
              Guest — not a registered account.
            </p>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-fit text-night h-9 px-4 bg-cream rounded-md self-end"
        >
          Close
        </button>
      </DialogPanel>
    </div>
  </Dialog>
);

const GuestRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="flex flex-col gap-1">
      <span className="text-khaki text-sm">{label}</span>
      <span className="whitespace-pre-wrap text-sm">{value}</span>
    </div>
  ) : null;

export default GuestInfoModal;

"use client";

import { Button } from "@/components/ui/button";
import ModalDocumentView from "../ui/modal-document-view";
import Link from "next/link";
import Image from "next/image";

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  document: {
    id: string;
    name: string;
    storagePath?: string | null;
    mimeType?: string | null;
  };
}

const DocumentViewModal = ({
  isOpen,
  onClose,
  loading,
  document,
}: DocumentViewModalProps) => {
  const mimeType = document.mimeType ?? "";
  const url = document.storagePath ?? "";

  const imageTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ];

  if (imageTypes.includes(mimeType)) {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col h-full">
          <div className="relative h-full p-10">
            <Image fill alt="Image preview" src={url} />
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button disabled={loading} variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalDocumentView>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex flex-col h-full">
          <embed
            style={{ width: "100%", height: "100%" }}
            type="application/pdf"
            src={url}
          />
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button disabled={loading} variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalDocumentView>
    );
  }

  return (
    <ModalDocumentView isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <p className="mb-4">
          This format cannot be previewed. Please download the file to view it.
        </p>
        {url && (
          <Button asChild>
            <Link href={url}>Download</Link>
          </Button>
        )}
        <div className="pt-6 space-x-2 flex items-center justify-end w-full">
          <Button disabled={loading} variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalDocumentView>
  );
};

export default DocumentViewModal;
